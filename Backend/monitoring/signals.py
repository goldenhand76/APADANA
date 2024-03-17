from monitoring.models import Tab, Tile
from device.models import Sensor
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
import channels.layers
from asgiref.sync import async_to_sync


@receiver(pre_delete, sender=Tab)
@receiver(post_save, sender=Tab)
def update_tabs(sender, instance, **kwargs):
    channel_layer = channels.layers.get_channel_layer()
    async_to_sync(channel_layer.group_send)("Monitoring", {"type": "update_tabs",
                                                           "tab_id": instance.id,
                                                           "update": "tabs"})


@receiver(pre_delete, sender=Tile)
@receiver(post_save, sender=Tile)
def update_tiles(sender, instance, **kwargs):
    channel_layer = channels.layers.get_channel_layer()
    async_to_sync(channel_layer.group_send)("Monitoring", {"type": "update_tiles",
                                                           "tab_id": instance.tab.id,
                                                           "update": "tiles"})


# @receiver(post_save, sender=Sensor)
# def update_data(sender, instance, **kwargs):
#     channel_layer = channels.layers.get_channel_layer()
#     async_to_sync(channel_layer.group_send)("Monitoring", {"type": "stream_new",
#                                                            "sensor_id": instance.id,
#                                                            "value": instance.value})
