from celery import shared_task
import channels.layers
from django.db.models import F, Q, Sum
from condition.models import Continues, Binary, Schedule
from authentication.models import Organization
from automation.models import ManualTile, AutomaticTile
from device.models import Actuator
from Angizeh_2.celeryapp import app
import logging
from asgiref.sync import async_to_sync
import requests
from datetime import datetime
from datetime import timedelta
from authentication.utils import Util
from notifications.signals import notify
logger = logging.getLogger('django')


def convert_active_to_condition(active):
    if active:
        return "ON"
    return "OFF"


def convert_binary_to_operator(value):
    if value == 1.0:
        return "ON"
    return "OFF"


def convert_operator_to_binary(status):
    if status == "ON":
        return 1.0
    return 0.0


def switch_output(status):
    if status == 1.0:
        return 0.0
    return 1.0

# def check_plans(qs):
#     ###################################
#     # Perform Check on the Conditions #
#     ###################################
#     plans = qs
#     for plan in qs:
#         print(plan.condition_object_id)
#         if plan.condition_content_type.model == "binary":
#             if not Binary.objects.prefetch_related('sensor').get(id=plan.condition_object_id).perform_check:
#                 plans = plans.exclude(id=plan.id)
#         elif plan.condition_content_type.model == "continues":
#             if not Continues.objects.prefetch_related('sensor').get(id=plan.condition_object_id).perform_check:
#                 plans = plans.exclude(id=plan.id)
#         elif plan.condition_content_type.model == "schedule":
#             if not Schedule.objects.get(id=plan.condition_object_id).perform_check:
#                 plans = plans.exclude(id=plan.id)
#     return plans


@shared_task(name="forward_automation", bind=True)
def forward_automation(self, condition_content_type, sensor_id=None, value=None):
    try:
        if condition_content_type == "continues":
            c_conditions = Continues.objects.filter(sensor_id=sensor_id) \
                .filter(Q(operator='HT', set_point__lt=value) | Q(operator='LT', set_point__gt=value))
            for condition in c_conditions:
                c_automations = AutomaticTile.objects.filter(deleted_at=None, active=True) \
                    .filter(condition_content_type__model=condition_content_type, condition_object_id=condition.id) \
                    .filter(Q(actuator__value=1.0, output='OFF') | Q(actuator__value=0.0, output='ON')) \
                    .prefetch_related('condition_content_type', 'actuator').exclude(status__in=["STARTED", "RETRYING"])
                for automation in c_automations:
                    Actuator.objects.filter(id=automation.actuator.id).update(set_value=convert_operator_to_binary(automation.output))

                    plan = {"id": automation.id, "title": automation.title, "active": automation.active}
                    send_automatic_command.delay(automation.actuator.id,
                                                 automation.field.id,
                                                 automation.actuator.value_topic,
                                                 automation.actuator.value,
                                                 automation.id,
                                                 plan)

        elif condition_content_type == "binary":
            b_conditions = Binary.objects.filter(sensor_id=sensor_id).filter(Q(operator=convert_binary_to_operator(value)))
            for condition in b_conditions:
                b_automations = AutomaticTile.objects.filter(deleted_at=None, active=True) \
                    .filter(condition_content_type__model=condition_content_type, condition_object_id=condition.id) \
                    .filter(Q(actuator__value=1.0, output='OFF') | Q(actuator__value=0.0, output='ON') | Q(output='SWITCH')) \
                    .prefetch_related('condition_content_type', 'actuator').exclude(status__in=["STARTED", "RETRYING"])
                for automation in b_automations:
                    if automation.output == "SWITCH":
                        Actuator.objects.filter(id=automation.actuator.id).update(set_value=switch_output(automation.actuator.value))
                    else:
                        Actuator.objects.filter(id=automation.actuator.id).update(set_value=convert_operator_to_binary(automation.output))
                    plan = {"id": automation.id, "title": automation.title, "active": automation.active}
                    send_automatic_command.delay(automation.actuator.id,
                                                 automation.field.id,
                                                 automation.actuator.value_topic,
                                                 automation.actuator.value,
                                                 automation.id,
                                                 plan)

        elif condition_content_type == "schedule":
            qs = Schedule.objects.filter(checked=False)
            if qs.exists():
                now = datetime.now()
                within_60_seconds = datetime.now() + timedelta(seconds=60)
                s_conditions = qs.filter(Q(operator="ONCE", set_time__range=[now, within_60_seconds]) |
                                         Q(operator="HOURLY", set_time__minute=now.minute) |
                                         Q(operator="DAILY", set_time__hour=now.hour, set_time__minute=now.minute) |
                                         Q(operator="WEEKLY", set_time__week_day=now.weekday(), set_time__hour=now.hour, set_time__minute=now.minute) |
                                         Q(operator="MONTHLY", set_time__day=now.day, set_time__hour=now.hour, set_time__minute=now.minute) |
                                         Q(operator="YEARLY", set_time__month=now.month, set_time__day=now.day, set_time__hour=now.hour, set_time__minute=now.minute))
                for condition in s_conditions:
                    s_automations = AutomaticTile.objects.filter(deleted_at=None, active=True) \
                        .filter(condition_content_type__model=condition_content_type, condition_object_id=condition.id) \
                        .filter(Q(actuator__value=1.0, output='OFF') | Q(actuator__value=0.0, output='ON') | Q(output="SWITCH")) \
                        .prefetch_related('condition_content_type', 'actuator').exclude(
                        status__in=["STARTED", "RETRYING"])
                    logger.debug(s_automations)
                    for automation in s_automations:
                        if automation.output == "SWITCH":
                            Actuator.objects.filter(id=automation.actuator.id).update(set_value=switch_output(automation.actuator.value))
                        else:
                            Actuator.objects.filter(id=automation.actuator.id).update(set_value=convert_operator_to_binary(automation.output))

                        plan = {"id": automation.id, "title": automation.title, "active": automation.active}
                        send_websocket.delay("update_automatic_status", automation.field.id, "STARTED", plan)
                        send_automatic_command.delay(automation.actuator.id,
                                                     automation.field.id,
                                                     automation.actuator.value_topic,
                                                     automation.actuator.value,
                                                     automation.id,
                                                     plan)
                if s_conditions.exists():
                    s_conditions.update(checked=True)
                    uncheck_automation.apply_async(('schedule', [x[0][0] for x in s_conditions.values_list('id')]), countdown=60)
                    #  https://docs.celeryq.dev/en/stable/userguide/calling.html

    except Exception as e:
        print(e)
    raise Exception()
    # app.control.revoke(self.request.id, terminate=True)


@shared_task(bind=True, autoretry_for=(Exception,), max_retries=3, retry_kwargs={'countdown': 5})
def send_manual_command(self, actuator_id, organization_id, topic, value, active, plan, users):
    instance = Actuator.objects.filter(id=actuator_id).exclude(value=F('set_value'))
    if instance.exists():
        if self.max_retries > self.request.retries > 0:
            actuator = instance.first()
            channel_layer = channels.layers.get_channel_layer()
            async_to_sync(channel_layer.group_send)("mqtt.client", {"type": "mqtt.publish",
                                                                    "topic": topic + "/status",
                                                                    "payload": f"{actuator.set_value}"})
            ManualTile.objects.filter(id=plan["id"]).update(status="RETRYING")
            send_websocket.delay("update_manual_status", organization_id, "RETRYING", plan)

        elif self.request.retries >= self.max_retries:
            ManualTile.objects.prefetch_related('actuator').filter(id=plan["id"]).update(active=not active,
                                                                                         status="FAILED")
            Actuator.objects.filter(id=actuator_id).update(set_value=value)
            send_websocket.delay("update_manual_status", organization_id, "FAILED", plan)
            send_status_sms.delay(users, "FAILED", plan, organization_id)
            app.control.revoke(self.request.id, terminate=True)
        raise Exception()
    else:
        ManualTile.objects.filter(id=plan["id"]).update(status="SUCCEED")
        send_websocket.delay("update_manual_status", organization_id, "SUCCEED", plan)
        send_status_sms.delay(users, "SUCCEED", plan, organization_id)
        app.control.revoke(self.request.id, terminate=True)


@shared_task(bind=True, autoretry_for=(Exception,), max_retries=5, retry_kwargs={'countdown': 2})
def send_automatic_command(self, actuator_id, organization_id, topic, value, automation, plan):
    instance = Actuator.objects.filter(id=actuator_id).exclude(value=F('set_value'))
    if instance.exists():
        if self.max_retries > self.request.retries > 0:
            actuator = instance.first()
            channel_layer = channels.layers.get_channel_layer()
            async_to_sync(channel_layer.group_send)("mqtt.client", {"type": "mqtt.publish",
                                                                    "topic": topic + "/status",
                                                                    "payload": f"{actuator.set_value}"})
            AutomaticTile.objects.filter(id=automation).update(status="RETRYING")
            send_websocket.delay("update_automatic_status", organization_id, "RETRYING", plan)

        elif self.request.retries >= self.max_retries:
            AutomaticTile.objects.filter(id=automation).update(status="FAILED")
            Actuator.objects.filter(id=actuator_id).update(set_value=value)
            send_websocket.delay("update_automatic_status", organization_id, "FAILED", plan)
            # send_status_sms.delay(users, "FAILED", plan)
            app.control.revoke(self.request.id, terminate=True)

        raise Exception()
    else:
        AutomaticTile.objects.filter(id=automation).update(status="SUCCEED")
        send_websocket.delay("update_automatic_status", organization_id, "SUCCEED", plan)
        automation_update_manual_status.delay(actuator_id, organization_id, value)

        # send_status_sms.delay(users, "SUCCEED", plan)
        app.control.revoke(self.request.id, terminate=True)


@shared_task(bind=True)
def send_websocket(self, message_type, organization_id, status, plan):
    channel_layer = channels.layers.get_channel_layer()
    async_to_sync(channel_layer.group_send)("Automation",
                                            {"type": message_type, "organization_id": organization_id, "status": status,
                                             "plan": plan})


@shared_task(bind=True)
def send_status_sms(self, users, status, plan, organization_id):
    message = ""
    organ = Organization.objects.get(id=organization_id)
    organ_users = organ.users.all()
    plan_obj = ManualTile.objects.get(id=plan["id"])
    if status == "SUCCEED":
        if plan["active"]:
            message = message + "اتوماسیون " + plan["title"] + " با موفقیت روشن شد \n"
            for user in organ_users:
                notify.send(sender=plan_obj, recipient=user, verb='Successfully Turned On', target=organ)
        else:
            for user in organ_users:
                notify.send(sender=plan_obj, recipient=user, verb='Successfully Turned Off', target=organ)
            message = message + "اتوماسیون " + plan["title"] + " با موفقیت خاموش شد \n"
    elif status == "FAILED":
        if plan["active"]:
            message = message + "اتوماسیون " + plan["title"] + " هنگام روشن شدن با شکست مواجه شد \n"
            for user in organ_users:
                notify.send(sender=plan_obj, recipient=user, verb='Failed To Turn On', target=organ)
        else:
            message = message + "اتوماسیون " + plan["title"] + " هنگام خاموش شدن با شکست مواجه شد \n"
            for user in organ_users:
                notify.send(sender=plan_obj, recipient=user, verb='Failed To Turn Off', target=organ)
    if organ.message:
        sms_message = message + "\n لغو پیامک:۱۱"
        phones = [user["phone"] for user in users]
        data = {'from': '50004001927031', 'to': phones, 'text': sms_message, 'udh': ''}
        response = requests.post('https://console.melipayamak.com/api/send/advanced/fe0dc37dac1c4ebebde2f5a49a54b5e2',
                                 json=data)
        if response.json()["status"] == "ارسال موفق بود":
            Organization.objects.filter(id=organization_id).update(cash=F('cash') - F('sms_price'))
    if organ.email:
        data = {'email_body': message,
                'email_subject': 'سامانه هوشمند ویرانیک',
                'to_email': [user["email"] for user in users]}
        Util.send_email_2(data)


@shared_task(bind=True, name="send_condition_sms")
def send_condition_sms(self, users, result, organization_id):
    try:
        message = ""
        if result["condition"] == "LT":
            message = "مقدار " + result["title"] + " کمتر از حد مجاز است"
        elif result["condition"] == "HT":
            message = "مقدار " + result["title"] + " بیشتر از حد مجاز است"
        message = message + "\n لغو پیامک:۱۱"
        phones = [user["phone"] for user in users]
        data = {'from': '50004001927031', 'to': phones, 'text': message, 'udh': ''}
        response = requests.post('https://console.melipayamak.com/api/send/advanced/fe0dc37dac1c4ebebde2f5a49a54b5e2',
                                 json=data)
        logger.debug(response)
        if response.json()["status"] == "ارسال موفق بود":
            Organization.objects.filter(id=organization_id).update(cash=F('cash') - F('sms_price'))
    except Exception as e:
        logger.debug(e)


@shared_task(bind=True, name="send_condition_email")
def send_condition_email(self, users, result, organization_id):
    try:
        message = ""
        if result["condition"] == "LT":
            message = "مقدار " + result["title"] + " کمتر از حد مجاز است"
        elif result["condition"] == "HT":
            message = "مقدار " + result["title"] + " بیشتر از حد مجاز است"
        data = {'email_body': message,
                'email_subject': 'Alert Email',
                'to_email': [user["phone"] for user in users]}
        logger.info("sent feedback email")
        Util.send_email_2(data)
    except Exception as e:
        logger.debug(e)


@shared_task(bind=True, name="uncheck_automation")
def uncheck_automation(self, condition, ids):
    if condition == "schedule":
        Schedule.objects.filter(id__in=ids).update(checked=False)
    return


@shared_task(name="automation_update_manual_status", bind=True)
def automation_update_manual_status(self, actuator_id, organization_id, value):
    logger.debug("AUTOMATION UPDATE MANUAL STATUS")
    if value == 1.0:
        qs = ManualTile.objects.filter(actuator_id=actuator_id, active=True)
        active = False
    else:
        qs = ManualTile.objects.filter(actuator_id=actuator_id, active=False)
        active = True
    if qs.exists():
        automation = qs.first()
        ManualTile.objects.filter(actuator_id=actuator_id).update(active=active)
        plan = {"id": automation.id, "title": automation.title, "active": active}
        send_websocket.delay("update_manual_status", organization_id, "SUCCEED", plan)
    return True
