from django.core.exceptions import ValidationError
from django.db import models
from authentication.models import Organization
from django_better_admin_arrayfield.models.fields import ArrayField
from model_utils import FieldTracker
from django.utils import timezone
from notifications.signals import notify
from model_utils.fields import MonitorField
from django.apps import apps
from device.tasks import device_send_websocket
import logging

logger = logging.getLogger('django')
VALUES = (('CONTINUES', 'CONTINUES'), ('BINARY', 'BINARY'))


class Type(models.Model):
    name = models.CharField(max_length=32, unique=True, blank=True, null=True)
    title = models.CharField(max_length=32)
    default_unit = models.CharField(max_length=32, blank=True, null=True)
    max = models.FloatField(blank=True, null=True)
    min = models.FloatField(blank=True, null=True)
    units = ArrayField(models.CharField(max_length=8), blank=True, null=True)
    value = models.CharField(choices=VALUES, default='continues', max_length=10)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'type'


class Sensor(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    part_number = models.CharField(max_length=16)
    title = models.CharField(max_length=128, default='', null=True, blank=True)
    type = models.ForeignKey(Type, on_delete=models.CASCADE)

    will_topic = models.CharField(max_length=128)
    will_alt_topic = models.CharField(max_length=128, null=True, blank=True)

    value_topic = models.CharField(max_length=128, db_index=True)

    value = models.FloatField(blank=True, null=True)
    previous_value = models.FloatField(blank=True, null=True)

    updated_at = models.DateTimeField(null=True, blank=True)
    is_online = models.BooleanField(default=False)
    is_connected = models.BooleanField(default=False)

    tracker = FieldTracker()

    class Meta:
        ordering = ('part_number',)
        db_table = "sensor"
        indexes = [models.Index(fields=['part_number'])]



    def save_without_Notify(self,*args,**kwargs):
        if self.id is not None:
            if self.tracker.has_changed('value'):
                self.previous_value = self.tracker.previous('value')
                self.updated_at = timezone.now()

            if self.tracker.has_changed('is_connected'):
                if self.is_connected:
                    for user in self.organization.users.all():
                        ''
                        # notify.send(sender=self, recipient=user, verb='has plugged in', target=self.organization)
                else:
                    for user in self.organization.users.all():
                        ''
                        # notify.send(sender=self, recipient=user, verb='has plugged out', target=self.organization)
                self.updated_at = timezone.now()

            if self.tracker.has_changed('is_online'):
                if self.is_online:
                    for user in self.organization.users.all():
                        ''
                        # notify.send(sender=self, recipient=user, verb='has connected', target=self.organization)
                else:
                    for user in self.organization.users.all():
                        ''
                        # notify.send(sender=self, recipient=user, verb='has disconnected', target=self.organization)
                self.updated_at = timezone.now()
        super(Sensor, self).save(*args, **kwargs)




    def save(self, *args, **kwargs):
        if self.id is not None:
            if self.tracker.has_changed('value'):
                self.previous_value = self.tracker.previous('value')
                self.updated_at = timezone.now()

            if self.tracker.has_changed('is_connected'):
                if self.is_connected:
                    for user in self.organization.users.all():
                        notify.send(sender=self, recipient=user, verb='has plugged in', target=self.organization)
                else:
                    for user in self.organization.users.all():
                        notify.send(sender=self, recipient=user, verb='has plugged out', target=self.organization)
                self.updated_at = timezone.now()

            if self.tracker.has_changed('is_online'):
                if self.is_online:
                    for user in self.organization.users.all():
                        notify.send(sender=self, recipient=user, verb='has connected', target=self.organization)
                else:
                    for user in self.organization.users.all():
                        notify.send(sender=self, recipient=user, verb='has disconnected', target=self.organization)
                self.updated_at = timezone.now()
        super(Sensor, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.part_number}-{self.title}-{self.type}"


class Actuator(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    part_number = models.CharField(max_length=16)
    title = models.CharField(default="", max_length=32)
    type = models.ForeignKey(Type, on_delete=models.CASCADE)

    will_topic = models.CharField(max_length=128)
    value_topic = models.CharField(max_length=128, db_index=True)

    value = models.FloatField(blank=True, null=True, choices=((0.0, 'off'), (1.0, 'on')))
    set_value = models.FloatField(blank=True, null=True, default=0, choices=((0.0, 'off'), (1.0, 'on')))
    set_time = MonitorField(monitor='set_value')
    set_timeout = models.IntegerField(default=30)
    previous_value = models.FloatField(default=0, blank=True, null=True, choices=((0.0, 'off'), (1.0, 'on')))

    manual_selected = models.BooleanField(default=False)
    automatic_selected = models.BooleanField(default=False)

    updated_at = models.DateTimeField(null=True, blank=True)
    is_online = models.BooleanField(default=True)

    tracker = FieldTracker()

    class Meta:
        ordering = ('part_number',)
        db_table = "actuator"
        unique_together = ('organization', 'title')

    def __str__(self):
        return f"{self.part_number}-{self.title}-{self.type}"


    def save_without_Notify(self, *args, **kwargs):
        try:
            ManualTile = apps.get_model('automation', 'ManualTile')
            if self.id is not None:
                if self.tracker.has_changed('value'):
                    self.previous_value = self.tracker.previous('value')
                    self.updated_at = timezone.now()
                    logger.debug('updated')
                    ########################################################################################################
                    ######################## Update Panel Based on Actuator ################################################
                    ########################################################################################################
                    # if self.value != self.set_value:
                    #     self.set_value = self.value
                    #     if self.value == 1.0:
                    #         qs = ManualTile.objects.filter(actuator_id=self.id, active=False)
                    #         active = True
                    #     else:
                    #         qs = ManualTile.objects.filter(actuator_id=self.id, active=True)
                    #         active = False
                    #     if qs.exists():
                    #         automation = qs.first()
                    #         ManualTile.objects.filter(actuator_id=self.id).update(active=active)
                    #         plan = {"id": automation.id, "title": automation.title, "active": active}
                    #         device_send_websocket.apply_async(("update_manual_status", self.organization_id, "SUCCEED", plan), countdown=5)

                if self.tracker.has_changed('is_online'):
                    if self.is_online:
                        for user in self.organization.users.all():
                            ''
                            # notify.send(sender=self, recipient=user, verb='has connected', target=self.organization)
                    else:
                        for user in self.organization.users.all():
                            # notify.send(sender=self, recipient=user, verb='has disconnected', target=self.organization)
                            ''
                    qs = ManualTile.objects.filter(actuator_id=self.id)
                    if qs.exists():
                        plan = {"id": qs.first().id, "title": qs.first().title, "active": qs.first().active}
                        device_send_websocket.apply_async(("update_manual_status", self.organization_id, "SUCCEED", plan),
                                                          countdown=3)
                    self.updated_at = timezone.now()
        except Exception as e:
            logger.debug(e)
        super(Actuator, self).save(*args, **kwargs)



    def save(self, *args, **kwargs):
        try:
            ManualTile = apps.get_model('automation', 'ManualTile')
            if self.id is not None:
                if self.tracker.has_changed('value'):
                    self.previous_value = self.tracker.previous('value')
                    self.updated_at = timezone.now()
                    logger.debug('updated')
                    ########################################################################################################
                    ######################## Update Panel Based on Actuator ################################################
                    ########################################################################################################
                    # if self.value != self.set_value:
                    #     self.set_value = self.value
                    #     if self.value == 1.0:
                    #         qs = ManualTile.objects.filter(actuator_id=self.id, active=False)
                    #         active = True
                    #     else:
                    #         qs = ManualTile.objects.filter(actuator_id=self.id, active=True)
                    #         active = False
                    #     if qs.exists():
                    #         automation = qs.first()
                    #         ManualTile.objects.filter(actuator_id=self.id).update(active=active)
                    #         plan = {"id": automation.id, "title": automation.title, "active": active}
                    #         device_send_websocket.apply_async(("update_manual_status", self.organization_id, "SUCCEED", plan), countdown=5)

                if self.tracker.has_changed('is_online'):
                    if self.is_online:
                        for user in self.organization.users.all():
                            notify.send(sender=self, recipient=user, verb='has connected', target=self.organization)
                    else:
                        for user in self.organization.users.all():
                            notify.send(sender=self, recipient=user, verb='has disconnected', target=self.organization)
                    qs = ManualTile.objects.filter(actuator_id=self.id)
                    if qs.exists():
                        plan = {"id": qs.first().id, "title": qs.first().title, "active": qs.first().active}
                        device_send_websocket.apply_async(("update_manual_status", self.organization_id, "SUCCEED", plan),
                                                          countdown=3)
                    self.updated_at = timezone.now()
        except Exception as e:
            logger.debug(e)
        super(Actuator, self).save(*args, **kwargs)
