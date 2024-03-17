import channels.layers
from asgiref.sync import async_to_sync
from django.db.models.signals import post_save
from automation.tasks import send_manual_command, send_condition_sms, forward_automation, \
    send_condition_email
from django.dispatch import receiver
from automation.models import AutomaticTile, ManualTile
import logging
from device.models import Actuator, Sensor
from notifications.models import NotificationManager
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q, F
from authentication.models import User
from actstream.models import following
from datetime import timedelta
from django.utils import timezone
from automation.tasks import send_websocket
from notifications.signals import notify

logger = logging.getLogger('django')


def conv_status_integer(value):
    if value == "OFF":
        return 0.0
    elif value == "ON":
        return 1.0
    else:
        pass


def send_notification(ctype, instance, plans, set_value):
    users = []
    for plan in plans:
        if set_value == 1.0:
            qs = NotificationManager.objects.filter(action_object_content_type=ctype, action_object_id=plan.id,
                                                    condition="ON")
        else:
            qs = NotificationManager.objects.filter(action_object_content_type=ctype, action_object_id=plan.id,
                                                    condition="OFF")
        if qs.exists():
            users = User.objects.filter(organization_id=instance.organization_id)
            users_following = []
            if users.exists():
                for user in users:
                    if qs[0] in following(user):
                        users_following.append(user)
                users = [{"id": user.id, "phone": user.phone, "email": user.email, "automation": plan.title} for user in
                         users_following]
        qs.update(last_seen=timezone.now())
    return users


@receiver(post_save, sender=Actuator)
def actuator_signal(sender, instance, **kwargs):
    try:
        ##########################################################
        # Finding the Related Manual Plans to Actuator Status #
        ##########################################################
        # if instance.set_value != instance.value:
        #     Actuator.objects.filter(id=instance.id).update(set_value=instance.value)
        #     qs = ManualTile.objects.filter(deleted_at=None).prefetch_related('actuator')
        #     if instance.value == 1:
        #         plans = qs.filter(actuator=instance, active=False).exclude(status__in=["STARTED", "RETRYING"])
        #         plans.update(active=True)
        #     else:
        #         plans = qs.filter(actuator=instance, active=True).exclude(status__in=["STARTED", "RETRYING"])
        #         plans.update(active=False)

        if instance.organization.automation == 'manual':
            ctype = ContentType.objects.get(model='manualtile')
            qs = ManualTile.objects.filter(deleted_at=None).prefetch_related('actuator')
            if instance.value == 1:
                plans = qs.filter(actuator=instance, active=False).exclude(status__in=["STARTED", "RETRYING"])
                set_value = 0
            else:
                plans = qs.filter(actuator=instance, active=True).exclude(status__in=["STARTED", "RETRYING"])
                set_value = 1
            if plans.exists():
                Actuator.objects.filter(id=instance.id).update(set_value=set_value)
                users = send_notification(ctype, instance, plans, set_value)
                plan = plans.first()
                plan_json = {"id": plan.id, "title": plan.title, "active": plan.active}
                channel_layer = channels.layers.get_channel_layer()
                async_to_sync(channel_layer.group_send)("mqtt.client",
                                                        {"type": "mqtt.publish",
                                                         "topic": instance.value_topic + "/status",
                                                         "payload": f"{set_value}"})
                send_websocket.delay("update_manual_status", instance.organization_id, "STARTED", plan_json)
                send_manual_command.delay(instance.id, instance.organization_id, instance.value_topic,
                                          instance.value, plan.active, plan_json, users)
                plans.update(status='STARTED')

        elif instance.organization.automation == 'automatic':
            forward_automation.delay("schedule")

    except Exception as e:
        logger.debug(e)
    ##########################################################
    # Finding the Related Automatic Plans to Actuator Status #
    ##########################################################


#         if instance.organization.automation == 'automatic':
#             ctype = ContentType.objects.get(model='automatictile')
#             qs = AutomaticTile.objects.filter(deleted_at=None).prefetch_related('condition_content_type', 'actuator')
#             if instance.value == 1:
#                 plans = check_plans(qs.filter(actuator=instance, active=True, output__in=['OFF'])).exclude(
#                     status__in=["STARTED", "RETRYING"])
#                 set_value = 0
#             else:
#                 plans = check_plans(qs.filter(actuator=instance, active=True, output__in=['ON'])).exclude(
#                     status__in=["STARTED", "RETRYING"])
#                 set_value = 1
#             if plans.exists():
#                 plans.update(status='STARTED')
#                 Actuator.objects.filter(id=instance.id).update(set_value=set_value)
#                 users = send_notification(ctype, instance, plans)
#                 plans_json = [{"id": plan.id, "title": plan.title, "output": plan.output} for plan in plans]
#                 send_websocket.delay("update_automatic_status", instance.organization_id, "STARTED", plans_json)
#                 send_automatic_command.delay(instance.id, instance.organization_id, instance.value_topic,
#                                              instance.value, plans_json, users)
#


@receiver(post_save, sender=Sensor)
def sensor_signal(sender, instance, **kwargs):
    device_ctype = ContentType.objects.get(model='sensor')
    if instance.organization.notification_interval < 60:
        within_interval = timezone.now() - timedelta(seconds=60)
    else:
        within_interval = timezone.now() - timedelta(seconds=instance.organization.notification_interval)

    qs = NotificationManager.objects.exclude((Q(last_seen__range=(within_interval, timezone.now()))))
    if instance.organization.automation == 'automatic':
        forward_automation.delay(instance.type.value.lower(), instance.id, instance.value)
    if not qs.exists():
        return
    if instance.value is None:
        return
    qs = qs.filter(action_object_content_type=device_ctype, action_object_id=instance.id).filter(
        Q(condition='HT', set_point__lt=instance.value) | Q(condition='LT', set_point__gt=instance.value))
    if not qs.exists():
        return
    users = User.objects.filter(organization_id=instance.organization_id)
    try:
        if users.exists():
            for item in qs:
                users_following = []
                for user in users:
                    if item in following(user):
                        if item.condition == "HT":
                            notify.send(sender=instance, recipient=user, verb='Higher Than Set Point', target=instance.organization)
                        elif item.condition == "LT":
                            notify.send(sender=instance, recipient=user, verb='Lower Than Set Point', target=instance.organization)
                        users_following.append(user)
                users_list = [{"phone": user.phone, "email": user.email} for user in users_following]
                result = {"sensor_id": instance.id, "title": instance.title, "condition": item.condition}
                if instance.organization.message:
                    if instance.organization.cash > instance.organization.sms_price:
                        send_condition_sms.delay(users_list, result, instance.organization.id)
                        logger.debug("Condition SMS Task Started")
                if instance.organization.email:
                    send_condition_email.delay(users_list, result, instance.organization.id)

            qs.update(last_seen=timezone.now())
            logger.debug("Notification Update Last Seen")
    except Exception as e:
        logger.debug(e)

        # if instance.organization.email:
        #     qs.update(last_seen=timezone.now())
        #
        # if instance.organization.telegram:
        #     qs.update(last_seen=timezone.now())

# def forward_automation(instance):
#     logger.debug("Forward Signal")
#     if instance.type.value == "CONTINUES":
#         ctype = ContentType.objects.get(model='continues')
#         logger.info("continues")
#     elif instance.type.value == "BINARY":
#         ctype = ContentType.objects.get(model='binary')
#         logger.debug("binary")
#     else:
#         return
#     qs = AutomaticTile.objects.filter(deleted_at=None).filter(condition_content_type__model=ctype, condition_object_id=instance.id).prefetch_related('condition_content_type', 'actuator')
#     logger.debug("Automatic Tile Search")
#     if not qs.exists():
#         return
#     plans = check_plans(qs.filter(active=True)).exclude(status__in=["STARTED", "RETRYING"])
#     if plans.exists():
#         plans.update(status='STARTED')
#         for plan in plans:
#             Actuator.objects.filter(id=plan.actuator_id).update(set_value=conv_status_integer(plan.output))
#             plans_json = [{"id": plan.id, "title": plan.title, "output": plan.output}]
#             send_websocket.delay("update_automatic_status", instance.organization_id, "STARTED", plans_json)
#             send_automatic_command.delay(plan.actuator.id, plan.field_id, plan.actuator.value_topic, plan.actuator_value, plans_json, users)
#

# qs = qs.annotate(
#     result=Case(
#         When(set_point__lt=instance.value, then=Value('LT')),
#         When(set_point__gt=instance.value, then=Value('HT')),
#         When(set_point=instance.value, then=Value('EQ')),
#     ))

# qs.objects.aggregate(
#          lt=Count('pk', filter=Q(set_point__lt=instance.value)),
#          ht=Count('pk', filter=Q(set_point__ht=instance.value)),
#          eq=Count('pk', filter=Q(set_point=instance.value)))
