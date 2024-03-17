from mqttasgi.consumers import MqttConsumer
from device.models import Sensor, Actuator, Type
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.db import transaction
import channels.layers
from asgiref.sync import async_to_sync
import logging
from functools import reduce
from django.db.models import Q
import operator
logger = logging.getLogger('django')


class MyMqttConsumer(MqttConsumer):
    async def connect(self):
        logger.debug("Connected")
        await self.unsubscribe('/angizeh/+/+/+/+/+')
        await self.unsubscribe('/angizeh/+/+/+/+')
        await self.unsubscribe('/angizeh/+/+/+')
        await self.subscribe('/angizeh/+/+/+', 1)
        await self.subscribe('/angizeh/+/+/+/+', 1)
        await self.subscribe('/angizeh/+/+/+/+/+', 1)
        await self.channel_layer.group_add("mqtt.client", self.channel_name)

    async def receive(self, msg):
        try:
            if len(msg['topic'].split('/')) == 5:
                if "Will" in msg['topic']:
                    if msg['topic'].split('/')[3] == "01":
                        await database_sync_to_async(self.will_message)(topic=msg["topic"])
                    else:
                        await database_sync_to_async(self.will_alt_message)(topic=msg["topic"])
                else:
                    if "Relay" in msg['topic']:
                        await database_sync_to_async(self.update_actuator)(topic=msg["topic"], value=msg["payload"])
                    elif ":" not in msg['topic']:
                        await database_sync_to_async(self.update_sensor)(topic=msg["topic"], value=msg["payload"])
            elif len(msg['topic'].split('/')) == 6:
                if "Will" in msg['topic']:
                    await database_sync_to_async(self.will_message)(topic=msg["topic"])
                elif "Relay" in msg['topic']:
                    await database_sync_to_async(self.update_actuator)(topic=msg["topic"], value=msg["payload"])
                elif ":" not in msg['topic']:
                    await database_sync_to_async(self.update_sensor)(topic=msg["topic"], value=msg["payload"])
            elif len(msg['topic'].split('/')) == 7:
                if "Will" in msg["topic"]:
                    await database_sync_to_async(self.will_alt_message)(topic=msg["topic"])
        except Exception as e:
            logger.debug(e)

    async def mqtt_publish(self, event):
        await self.publish(event["topic"], event["payload"], qos=1, retain=False)

    async def disconnect(self):
        await self.connect()

    def update_sensor(self, topic, value):
        try:
            value = float(value)
        except ValueError as e:
            logger.debug(e)
        with transaction.atomic():
            sensor_by_topic = Sensor.objects.filter(value_topic=topic)
            if sensor_by_topic.exists():
                for sensor in sensor_by_topic:
                    sensor.value = float(value)
                    sensor.is_online = True
                    sensor.is_connected = True
                    sensor.save()
                    channel_layer = channels.layers.get_channel_layer()
                    async_to_sync(channel_layer.group_send)("Monitoring", {"type": "stream_new", "sensor_id": sensor.id})
            else:
                sensor_by_part_number = Sensor.objects.filter(part_number=topic.split('/')[2])
                if sensor_by_part_number.exists():
                    org = sensor_by_part_number.first().organization
                    part_number = sensor_by_part_number.first().part_number
                    sensor_type = topic.split('/')[3]
                    if sensor_type == '02':
                        # sensor_by_part_number.filter(value_topic__contains="/03/").delete()
                        sensor_by_part_number.filter(reduce(operator.or_, (Q(value_topic__contains=x) for x in ['/03/', '/04/', '/05/', '/08/', '/09/']))).delete()

                        EC = Type.objects.get(name='EC')
                        Sensor.objects.create(organization=org, part_number=part_number, title='رسانایی خاک', type=EC, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/02/Will", value_topic=f"/angizeh/{part_number}/02/EC")
                        PHOS = Type.objects.get(name='PHOS')
                        Sensor.objects.create(organization=org, part_number=part_number, title='فسفر خاک', type=PHOS, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/02/Will", value_topic=f"/angizeh/{part_number}/02/PHOS")
                        POT = Type.objects.get(name='POT')
                        Sensor.objects.create(organization=org, part_number=part_number, title='پتاسیم خاک', type=POT, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/02/Will", value_topic=f"/angizeh/{part_number}/02/POT")
                        NI = Type.objects.get(name='NI')
                        Sensor.objects.create(organization=org, part_number=part_number, title='نیتروژن خاک', type=NI, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/02/Will", value_topic=f"/angizeh/{part_number}/02/NI")
                        SoilTemperature = Type.objects.get(name='SoilTemperature')
                        Sensor.objects.create(organization=org, part_number=part_number, title='دمای خاک', type=SoilTemperature, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/02/Will", value_topic=f"/angizeh/{part_number}/02/Temperature")
                        Moisture = Type.objects.get(name='Moisture')
                        Sensor.objects.create(organization=org, part_number=part_number, title='رطوبت خاک', type=Moisture, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/02/Will", value_topic=f"/angizeh/{part_number}/02/Moisture")
                        PH = Type.objects.get(name='PH')
                        Sensor.objects.create(organization=org, part_number=part_number, title='اسیدیته خاک', type=PH, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/02/Will", value_topic=f"/angizeh/{part_number}/02/PH")
                    elif sensor_type == '03':
                        sensor_by_part_number.filter(reduce(operator.or_, (Q(value_topic__contains=x) for x in ['/02/', '/04/', '/05/', '/08/', '/09']))).delete()
                        SoilTemperature = Type.objects.get(name='SoilTemperature')
                        Sensor.objects.create(organization=org, part_number=part_number, title='دمای خاک', type=SoilTemperature, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/03/Will", value_topic=f"/angizeh/{part_number}/03/Temperature")
                        Moisture = Type.objects.get(name='Moisture')
                        Sensor.objects.create(organization=org, part_number=part_number, title='رطوبت خاک', type=Moisture, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/03/Will", value_topic=f"/angizeh/{part_number}/03/Moisture")
                    elif sensor_type == '04':
                        sensor_by_part_number.filter(reduce(operator.or_, (Q(value_topic__contains=x) for x in ['/03/', '/02/', '/05/', '/08/', '/09/']))).delete()
                        EC = Type.objects.get(name='EC')
                        Sensor.objects.create(organization=org, part_number=part_number, title='رسانایی خاک', type=EC, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/04/Will", value_topic=f"/angizeh/{part_number}/04/EC")
                    elif sensor_type == '05':
                        sensor_by_part_number.filter(reduce(operator.or_, (Q(value_topic__contains=x) for x in ['/03/', '/04/', '/02/', '/08/', '/09/']))).delete()
                        PH = Type.objects.get(name='PH')
                        Sensor.objects.create(organization=org, part_number=part_number, title='اسیدیته خاک', type=PH, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/05/Will", value_topic=f"/angizeh/{part_number}/05/PH")
                    elif sensor_type == '08':
                        sensor_by_part_number.filter(reduce(operator.or_, (Q(value_topic__contains=x) for x in ['/03/', '/04/', '/05/', '/02/', '/09/']))).delete()
                        Motion = Type.objects.get(name='Motion')
                        Sensor.objects.create(organization=org, part_number=part_number, title='سنسور تشخیص حرکت', type=Motion, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/08/Will", value_topic=f"/angizeh/{part_number}/08/Motion")
                    elif sensor_type == '09':
                        sensor_by_part_number.filter(reduce(operator.or_, (Q(value_topic__contains=x) for x in ['/03/', '/04/', '/05/', '/02/', '/08/']))).delete()
                        Door = Type.objects.get(name='Door')
                        Sensor.objects.create(organization=org, part_number=part_number, title='سنسور وضعیت در', type=Door, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/09/Will", value_topic=f"/angizeh/{part_number}/09/Door")

    def update_actuator(self, topic, value):
        try:
            value = float(value)
        except ValueError as e:
            logger.debug(e)
        with transaction.atomic():
            actuators = Actuator.objects.filter(value_topic=topic)
            for actuator in actuators:
                actuator.value = float(value)
                actuator.is_online = True
                actuator.save()

    def will_message(self, topic=None):
        try:
            with transaction.atomic():
                qs = Sensor.objects.prefetch_related('organization__users').filter(will_topic=topic, is_online=True)
                for ob in qs:
                    ob.is_online = False
                    ob.save()
                    channel_layer = channels.layers.get_channel_layer()
                    async_to_sync(channel_layer.group_send)("Monitoring",
                                                            {"type": "stream_will",
                                                             "sensor_id": ob.id})

            with transaction.atomic():
                qs = Actuator.objects.prefetch_related('organization__users').filter(will_topic=topic, is_online=True)
                for ob in qs:
                    ob.is_online = False
                    ob.save()
        except Exception as e:
            logger.debug(e)

    def will_alt_message(self, topic):
        try:
            with transaction.atomic():
                qs = Sensor.objects.prefetch_related('organization__users').filter(will_alt_topic=topic, is_connected=True)
                for ob in qs:
                    ob.is_connected = False
                    ob.save()
                    channel_layer = channels.layers.get_channel_layer()
                    async_to_sync(channel_layer.group_send)("Monitoring",
                                                            {"type": "stream_alt_will",
                                                             "sensor_id": ob.id})
        except Exception as e:
            logger.debug(e)
        # TODO Send Notification to users, list of offline devices instead of on will message
