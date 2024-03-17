from datetime import datetime
import pytz
import logging
import channels.layers
from asgiref.sync import async_to_sync
from celery import shared_task
from celery.schedules import crontab
from Angizeh_2.celeryapp import app
import asyncio
logger = logging.getLogger('django')


@shared_task(bind=True)
def device_send_websocket(self, message_type, organization_id, status, plan):
    channel_layer = channels.layers.get_channel_layer()
    async_to_sync(channel_layer.group_send)("Automation",
                                            {"type": message_type, "organization_id": organization_id, "status": status,
                                             "plan": plan})
    return True


@app.task(name='publish_time')
def publish_time():
    now = datetime.now(pytz.timezone("Asia/Tehran"))
    time = now.strftime("%Y,%m,%d-%H:%M:%S")
    channel_layer = channels.layers.get_channel_layer()
    async_to_sync(channel_layer.group_send)("mqtt.client", {"type": "mqtt.publish", "topic": "/angizeh/time", "payload": f"{time}"})
    return True


app.conf.beat_schedule = {
    'publish_time': {
        'task': 'publish_time',
        'schedule': crontab(minute='*/1',),
        'args': ()
    },
}