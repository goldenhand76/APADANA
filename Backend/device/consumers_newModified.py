import asyncio

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
import time
logger = logging.getLogger('django')


class MyMqttConsumer(MqttConsumer):
    # nokyete mohem:
    # MqttConsumer --> nabayar __init__(self)  dashte bashad!!! --> kar nemikonad va mottasel nemishavad!!!
    # #===== New code =====
    my_instance_variable = 0
    # def __init__(self, *args, **kwargs):
    # def __init__(self):
    #     self.my_instance_variable=0
    # #===============

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
                        # #=== New Code
                        logger.debug("update_sensor_recieved")
                        # logger.debug("Update Manual status web socket send")
                        # #======

                        await database_sync_to_async(self.update_sensor)(topic=msg["topic"], value=msg["payload"])
            elif len(msg['topic'].split('/')) == 6:
                if "Will" in msg['topic']:
                    await database_sync_to_async(self.will_message)(topic=msg["topic"])
                elif "Relay" in msg['topic']:
                    await database_sync_to_async(self.update_actuator)(topic=msg["topic"], value=msg["payload"])
                elif ":" not in msg['topic']:
                    # # === New Code
                    logger.debug("update_sensor_recieved")
                    # # ======

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

                    #===== NEW code ===
                    self.my_instance_variable=1
                    #===========

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



    # def update_sensor(self, topic, value):
    #     try:
    #         value = float(value)
    #     except ValueError as e:
    #         logger.debug(e)


    #     with transaction.atomic():
    #         sensor_by_topic = Sensor.objects.filter(value_topic=topic)
    #         will_topicc=''
    #         if sensor_by_topic.exists():


    #             # # ?????????????????????????????????????????/// ????????????? Barrasi bishar shavad!!! ===================
    #             # #== Check Will topic for sending Notification in dataset ===
    #             # will_topicc=sensor_by_topic[0].will_topic
    #             # qs = Sensor.objects.prefetch_related('organization__users').filter(will_topic=will_topicc) # agar hamegi offline bashand
    #             # noWill=0
    #             # for sensor in qs:
    #             #     if (sensor.is_online==True):
    #             #         noWill=1
    #             # if (noWill==0):
                
    #             # # if (len(qs)==0): # baraye bare aval hast!!!
    #             #     sensor.value = float(value)
    #             #     sensor.is_online = True
    #             #     sensor.is_connected = True
    #             #     sensor.save()

    #             #     # channel_layer = channels.layers.get_channel_layer()
    #             #     # async_to_sync(channel_layer.group_send)("Monitoring", {"type": "stream_new", "sensor_id": sensor.id})

    #             # #== ???????????????????????????????????????????????????????


    #              #=======================
    #             # first=1
    #             for sensor in sensor_by_topic:
                    
    #                 sensor.value = float(value)
    #                 sensor.is_online = True
    #                 sensor.is_connected = True
    #             #========= New Code ===================
    #                 # if (first==1):
    #                 #     sensor.save()
    #                 #     first=0
    #                 # else:
    #                 # sensor.save_without_Notify()
    #                 sensor.save()
    #              #=====================================

    #                 channel_layer = channels.layers.get_channel_layer()
    #                 async_to_sync(channel_layer.group_send)("Monitoring", {"type": "stream_new", "sensor_id": sensor.id})
    

    #         #============================


    #         else:
    #             sensor_by_part_number = Sensor.objects.filter(part_number=topic.split('/')[2])
    #             if sensor_by_part_number.exists():
    #                 org = sensor_by_part_number.first().organization
    #                 part_number = sensor_by_part_number.first().part_number
    #                 sensor_type = topic.split('/')[3]
    #                 if sensor_type == '02':
    #                     # sensor_by_part_number.filter(value_topic__contains="/03/").delete()
    #                     sensor_by_part_number.filter(reduce(operator.or_, (Q(value_topic__contains=x) for x in ['/03/', '/04/', '/05/', '/08/', '/09/']))).delete()

    #                     EC = Type.objects.get(name='EC')
    #                     Sensor.objects.create(organization=org, part_number=part_number, title='رسانایی خاک', type=EC, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/02/Will", value_topic=f"/angizeh/{part_number}/02/EC")
    #                     PHOS = Type.objects.get(name='PHOS')
    #                     Sensor.objects.create(organization=org, part_number=part_number, title='فسفر خاک', type=PHOS, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/02/Will", value_topic=f"/angizeh/{part_number}/02/PHOS")
    #                     POT = Type.objects.get(name='POT')
    #                     Sensor.objects.create(organization=org, part_number=part_number, title='پتاسیم خاک', type=POT, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/02/Will", value_topic=f"/angizeh/{part_number}/02/POT")
    #                     NI = Type.objects.get(name='NI')
    #                     Sensor.objects.create(organization=org, part_number=part_number, title='نیتروژن خاک', type=NI, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/02/Will", value_topic=f"/angizeh/{part_number}/02/NI")
    #                     SoilTemperature = Type.objects.get(name='SoilTemperature')
    #                     Sensor.objects.create(organization=org, part_number=part_number, title='دمای خاک', type=SoilTemperature, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/02/Will", value_topic=f"/angizeh/{part_number}/02/Temperature")
    #                     Moisture = Type.objects.get(name='Moisture')
    #                     Sensor.objects.create(organization=org, part_number=part_number, title='رطوبت خاک', type=Moisture, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/02/Will", value_topic=f"/angizeh/{part_number}/02/Moisture")
    #                     PH = Type.objects.get(name='PH')
    #                     Sensor.objects.create(organization=org, part_number=part_number, title='اسیدیته خاک', type=PH, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/02/Will", value_topic=f"/angizeh/{part_number}/02/PH")
    #                 elif sensor_type == '03':
    #                     sensor_by_part_number.filter(reduce(operator.or_, (Q(value_topic__contains=x) for x in ['/02/', '/04/', '/05/', '/08/', '/09']))).delete()
    #                     SoilTemperature = Type.objects.get(name='SoilTemperature')
    #                     Sensor.objects.create(organization=org, part_number=part_number, title='دمای خاک', type=SoilTemperature, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/03/Will", value_topic=f"/angizeh/{part_number}/03/Temperature")
    #                     Moisture = Type.objects.get(name='Moisture')
    #                     Sensor.objects.create(organization=org, part_number=part_number, title='رطوبت خاک', type=Moisture, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/03/Will", value_topic=f"/angizeh/{part_number}/03/Moisture")
    #                 elif sensor_type == '04':
    #                     sensor_by_part_number.filter(reduce(operator.or_, (Q(value_topic__contains=x) for x in ['/03/', '/02/', '/05/', '/08/', '/09/']))).delete()
    #                     EC = Type.objects.get(name='EC')
    #                     Sensor.objects.create(organization=org, part_number=part_number, title='رسانایی خاک', type=EC, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/04/Will", value_topic=f"/angizeh/{part_number}/04/EC")
    #                 elif sensor_type == '05':
    #                     sensor_by_part_number.filter(reduce(operator.or_, (Q(value_topic__contains=x) for x in ['/03/', '/04/', '/02/', '/08/', '/09/']))).delete()
    #                     PH = Type.objects.get(name='PH')
    #                     Sensor.objects.create(organization=org, part_number=part_number, title='اسیدیته خاک', type=PH, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/05/Will", value_topic=f"/angizeh/{part_number}/05/PH")
    #                 elif sensor_type == '08':
    #                     sensor_by_part_number.filter(reduce(operator.or_, (Q(value_topic__contains=x) for x in ['/03/', '/04/', '/05/', '/02/', '/09/']))).delete()
    #                     Motion = Type.objects.get(name='Motion')
    #                     Sensor.objects.create(organization=org, part_number=part_number, title='سنسور تشخیص حرکت', type=Motion, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/08/Will", value_topic=f"/angizeh/{part_number}/08/Motion")
    #                 elif sensor_type == '09':
    #                     sensor_by_part_number.filter(reduce(operator.or_, (Q(value_topic__contains=x) for x in ['/03/', '/04/', '/05/', '/02/', '/08/']))).delete()
    #                     Door = Type.objects.get(name='Door')
    #                     Sensor.objects.create(organization=org, part_number=part_number, title='سنسور وضعیت در', type=Door, will_topic=f"/angizeh/{part_number}/01/Will", will_alt_topic=f"/angizeh/{part_number}/09/Will", value_topic=f"/angizeh/{part_number}/09/Door")

    def update_actuator(self, topic, value):
        try:
            value = float(value)
        except ValueError as e:
            logger.debug(e)

        with transaction.atomic():
            actuators = Actuator.objects.filter(value_topic=topic)



            # ?????????????????????????????????????????/// ????????????? Barrasi bishar shavad!!! ===================
            #== Check Will topic for sending Notification in dataset ===
            if actuators.exists():
                will_topicc=actuators[0].will_topic
                qs = Actuator.objects.filter(will_topic=will_topicc)# agar hamegi offline bashand
                noWill=0
                for actuator in qs:
                    if (actuator.is_online==True):
                        noWill=1
                if (noWill==0):
                    actuator.value = float(value)
                    actuator.is_online = True
                    actuator.save()

            #== ???????????????????????????????????????????????????????



              #=======================
            first=1
            for actuator in actuators:
                actuator.value = float(value)
                actuator.is_online = True
                

                #========= New Code ===================
                # if (first==1):
                #     actuator.save()
                #     first=0
                # else:
                actuator.save_without_Notify()
                #=====================================



    async def delayy(self):
        await asyncio.sleep(60)
        # other codes



    def will_message(self, topic=None):
        try:
            with transaction.atomic():
                qs = Sensor.objects.prefetch_related('organization__users').filter(will_topic=topic, is_online=True)

                #========== New code===
                self.my_instance_variable = 0
                logger.debug("will message for sensor Recieved!")
                # time.sleep(1)

                async_to_sync(self.delayy)


                if (self.my_instance_variable==0):  # no update_sensor
                    logger.debug("No_Update_in 5 secods ---> Will message")
                #=======================
                    first=1
                    for ob in qs:
                        ob.is_online = False
                        #========= New Code ===================
                        if (first==1):
                            ob.save()
                            first=0
                        else:
                            ob.save_without_Notify()
                        #=====================================

                        channel_layer = channels.layers.get_channel_layer()

                        
                        async_to_sync(channel_layer.group_send)("Monitoring",
                                                                {"type": "stream_will",
                                                                 "sensor_id": ob.id})
                else:
                    logger.debug("Updated Sensor_in 5 secods")

            with transaction.atomic():
                qs = Actuator.objects.prefetch_related('organization__users').filter(will_topic=topic, is_online=True)
                first=1
                for ob in qs:
                    ob.is_online = False

                    #========= New Code ===================
                    if (first==1):
                        ob.save()
                        first=0
                    else:
                        ob.save_without_Notify()
                    #=====================================

        except Exception as e:
            logger.debug(e)



    def will_alt_message(self, topic):
        try:
            with transaction.atomic():
                qs = Sensor.objects.prefetch_related('organization__users').filter(will_alt_topic=topic, is_connected=True)

                #========== New code===
                self.my_instance_variable = 0
                logger.debug("will message for sensor Recieved!")
                # time.sleep(1)
                async_to_sync(self.delayy)

                if (self.my_instance_variable==0):  # no update_sensor
                    logger.debug("No_Update_in 5 secods ---> Will message")



                    #=======================
                    first=1
                    for ob in qs:
                        ob.is_connected = False

                        #========= New Code ===================
                        if (first==1):
                            ob.save()
                            first=0
                        else:
                            ob.save_without_Notify()
                        #=====================================
                      
                        channel_layer = channels.layers.get_channel_layer()
                        async_to_sync(channel_layer.group_send)("Monitoring",
                                                                {"type": "stream_alt_will",
                                                                 "sensor_id": ob.id})
                else:
                    logger.debug("Updated Sensor_in 5 secods")


        except Exception as e:
            logger.debug(e)
        # TODO Send Notification to users, list of offline devices instead of on will message
