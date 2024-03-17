from actstream.actions import follow, unfollow
from django.contrib.contenttypes.fields import GenericForeignKey
from swapper import swappable_setting
import channels.layers
from asgiref.sync import async_to_sync
from django.db import models
from django.contrib.contenttypes.models import ContentType
from .base.models import AbstractNotification, notify_handler  # noqa
from device.models import Sensor, Actuator
from authentication.models import Organization
from django.utils import timezone


class Notification(AbstractNotification):
    class Meta(AbstractNotification.Meta):
        abstract = False
        swappable = swappable_setting('notifications', 'Notification')

    # def save(self, *args, **kwargs):
    #     channel_layer = channels.layers.get_channel_layer()
    #     async_to_sync(channel_layer.group_send)("Dashboard", {"type": "update_notifications",
    #                                                           "user_id": self.recipient.id,
    #                                                           "update": "notifications"})
    #     super(Notification, self).save(*args, **kwargs)


class NotificationManager(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, blank=True, null=True)
    title = models.CharField(max_length=64)
    # The action object could be sensor or relay.
    action_object_content_type = models.ForeignKey(ContentType,
                                                   limit_choices_to={"model__in": ("sensor",
                                                                                   "actuator",
                                                                                   "manualtile",
                                                                                   "automatictile")},
                                                   on_delete=models.CASCADE)
    action_object_id = models.PositiveIntegerField()
    action_object = GenericForeignKey('action_object_content_type', 'action_object_id')
    # The condition object could be actuator, sensor condition
    CONDITION_CHOICES = (('LT', 'LT'), ('HT', 'HT'), ('EQ', 'EQ'),
                         ('ON', 'ON'), ('OFF', 'OFF'), ('SWITCH', 'SWITCH'),
                         ('CONNECT', 'CONNECT'), ('DISCONNECT', 'DISCONNECT'))
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES, blank=True, null=True)
    set_point = models.FloatField(blank=True, null=True)
    last_seen = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ('id',)
        db_table = "notification_manager"
        unique_together = ('title', 'action_object_content_type', 'action_object_id')

    def __str__(self):
        return self.title

    @classmethod
    def save_manual_tile_alarm(cls, request, tile):
        alarm_data = request.data.pop('alarm')
        following = alarm_data.pop('following')
        ctype = ContentType.objects.get(model='manualtile')
        alarm = cls.objects.create(action_object_content_type=ctype, action_object=tile, title=tile.title, organization=tile.field, **alarm_data)
        if following:
            follow(request.user, alarm)
        else:
            unfollow(request.user, alarm)

    @classmethod
    def update_manual_tile_alarm(cls, request, tile):
        alarm_data = request.data.pop('alarm', '')
        if alarm_data:
            following = alarm_data.pop('following')
            ctype = ContentType.objects.get(model='manualtile')
            obj, created = NotificationManager.objects.get_or_create(organization=tile.field,
                                                                     action_object_content_type=ctype,
                                                                     action_object_id=tile.id)
            NotificationManager.objects.filter(id=obj.id).update(title=tile.title, **alarm_data)
            if following:
                follow(request.user, obj)
            else:
                unfollow(request.user, obj)

    @classmethod
    def save_automatic_tile_alarm(cls, request, tile):
        alarm_data = request.data.pop('alarm')
        following = alarm_data.pop('following')
        ctype = ContentType.objects.get(model='automatictile')
        alarm = cls.objects.create(action_object_content_type=ctype, action_object=tile, title=tile.title, organization=tile.field, **alarm_data)
        if following:
            follow(request.user, alarm)
        else:
            unfollow(request.user, alarm)

    @classmethod
    def update_automatic_tile_alarm(cls, request, tile):
        alarm_data = request.data.pop('alarm', '')
        if alarm_data:
            following = alarm_data.pop('following')
            ctype = ContentType.objects.get(model='automatictile')
            obj, created = NotificationManager.objects.get_or_create(organization=tile.field,
                                                                     action_object_content_type=ctype,
                                                                     action_object_id=tile.id)
            NotificationManager.objects.filter(id=obj.id).update(title=tile.title, **alarm_data)
            if following:
                follow(request.user, obj)
            else:
                unfollow(request.user, obj)
