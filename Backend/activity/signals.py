from actstream.models import Action
from notifications.models import Notification
from django.db.models.signals import post_save
from django.dispatch import receiver
import channels.layers
from asgiref.sync import async_to_sync
from activity.serializers import ActionSerializer
from notifications.serializers import AllNotificationsListSerializer
import logging

logger = logging.getLogger('django')


@receiver(post_save, sender=Action)
def update_activity(sender, instance, **kwargs):
    channel_layer = channels.layers.get_channel_layer()
    serializer = ActionSerializer(instance)
    result = serializer.data
    async_to_sync(channel_layer.group_send)("Dashboard", {"type": "update_activities",
                                                          "actor_id": instance.actor.id,
                                                          "data": result})


@receiver(post_save, sender=Notification)
def update_notification(sender, instance, **kwargs):
    channel_layer = channels.layers.get_channel_layer()
    serializer = AllNotificationsListSerializer(instance)
    result = serializer.data
    async_to_sync(channel_layer.group_send)("Dashboard", {"type": "update_notifications",
                                                          "recipient_id": result["recipient"]["id"],
                                                          "data": result})
