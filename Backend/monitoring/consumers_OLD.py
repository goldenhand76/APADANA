import asyncio
import datetime
import json
from rest_framework_simplejwt.tokens import AccessToken
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.exceptions import TokenError
from authentication.models import User
from channels.db import database_sync_to_async
from authentication.models import LoggedInUser
from device.models import Sensor
from monitoring.models import Tab, Tile
import logging
import pandas as pd
from Angizeh_2 import influx_client
import pint
import pint_pandas

logger = logging.getLogger('daphne')
ureg = pint.UnitRegistry()
ureg.Unit.default_format = "~P"
pint_pandas.PintType.ureg.default_format = "~P"


class DashboardConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.group_name = "Dashboard"
        self.organization = None

    async def connect(self):
        try:
            await database_sync_to_async(self.get_user)(token=self.scope["url_route"]["kwargs"]["token"])
            await database_sync_to_async(self.user_logged_in)(self.channel_name)
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        except TokenError:
            await self.close()

    async def disconnect(self, close_code):
        if self.user:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            await database_sync_to_async(self.user_logged_out)()

    async def update_activities(self, event):
        if await database_sync_to_async(self.is_following)(actor_id=event["actor_id"]):
            await self.send(text_data=json.dumps({"activity": event["data"]}))

    async def update_notifications(self, event):
        if self.user.id == event["recipient_id"]:
            await self.send(text_data=json.dumps({"notification": event["data"]}))

    async def device(self, event):
        if self.organization.id == event["organization_id"]:
            await self.send(text_data=json.dumps({"type": event["device"], "id": event["id"], "value": event["value"]}))

    def is_following(self, actor_id):
        if self.get_actor_user(actor_id=actor_id).exists():
            if self.user.is_admin:  # (actor in following(self.user))
                return True
        return False

    def get_user(self, token):
        user = AccessToken(token)
        self.user = User.objects.prefetch_related('organization').get(id=user["user_id"])
        self.organization = self.user.organization

    def get_actor_user(self, actor_id):
        return User.objects.filter(id=actor_id, organization=self.organization)

    def user_logged_in(self, channel_name):
        LoggedInUser.objects.filter(user=self.user).update(channel_name=channel_name, is_online=True)

    def user_logged_out(self):
        LoggedInUser.objects.filter(user=self.user).update(channel_name=None, is_online=False)


class MonitoringConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.group_name = "Monitoring"
        self.organization = None
        self.selected_tab = None

    async def connect(self):
        try:
            await database_sync_to_async(self.get_user)(token=self.scope["url_route"]["kwargs"]["token"])
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        except TokenError:
            await self.close()

    async def disconnect(self, close_code):
        if self.user:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        if data.get('tab_id', None):
            self.selected_tab = await database_sync_to_async(self.get_tab)(id=data.get('tab_id'))
            # await self.stream(data.get('tab_id'))

    async def update_data(self, event):
        if self.selected_tab:
            if await database_sync_to_async(self.tab_selected)(sensor_id=event["sensor_id"]):
                await self.send(text_data=json.dumps({"sensor": {"id": event["sensor_id"], "value": event["value"]}}))

    async def update_tabs(self, event):
        if await database_sync_to_async(self.tab_exists)(tab_id=event["tab_id"]):
            await self.send(text_data=json.dumps({"update": event["update"]}))

    async def update_tiles(self, event):
        if await database_sync_to_async(self.tab_exists)(tab_id=event["tab_id"]):
            await self.send(text_data=json.dumps({"update": event["update"], "tab_id": event["tab_id"]}))

    def tab_exists(self, tab_id):
        if Tab.objects.filter(field=self.organization, id=tab_id).exists():
            return True
        return False

    def tab_selected(self, sensor_id):
        return self.selected_tab.tile_set.filter(sensor_id=sensor_id).exists() # Tab.objects.filter(tile__sensor_id=sensor_id, id=tab_id).exists():

    def get_tab(self, id):
        return Tab.objects.prefetch_related('tile_set', 'tile_set__sensor', 'tile_set__sensor__type').get(id=id)

    def get_tile(self, id):
        return Tile.objects.prefetch_related('sensor', 'sensor__type').get(id=id)

    def get_sensor(self, id):
        return Sensor.objects.get(id=id)

    def get_user(self, token):
        user = AccessToken(token)
        self.user = User.objects.prefetch_related('organization').get(id=user["user_id"])
        self.organization = self.user.organization

    async def stream(self, tab_id):
        client = influx_client.connection()
        while True:
            for tile in self.selected_tab.tile_set.all():
                topic = tile.sensor.value_topic.split('/')
                precision_dict = {
                    "1": 0,
                    "0.1": 1
                }
                precision = precision_dict.get(tile.precision, '0.1')
                query = f"""
                    from(bucket:"mqtt.angizehco.com")
                    |> range(start: -5m) 
                    |> filter(fn: (r) => r["_measurement"] == "{topic[5]}")
                    |> filter(fn: (r) => r["owner"] == "{topic[2]}")
                    |> filter(fn: (r) => r["gateway"] == "{topic[3]}")
                    |> filter(fn: (r) => r["node"] == "{topic[4]}")
                    |> keep(columns: ["_time", "_value"])
                    |> last()
                """
                query_api = client.query_api()
                result = query_api.query_data_frame(query)
                #
                if tile.sensor.type.default_unit not in ["%", None]:
                    unit = tile.sensor.type.default_unit
                else:
                    unit = 1
                df = pd.DataFrame({
                    "time": result["_time"],
                    "value": pd.Series(result["_value"], dtype=f"pint[{unit}]"),
                })
                if tile.unit != tile.sensor.type.default_unit:
                    df['value'] = df['value'].pint.to(f"{tile.unit}")
                df = df.pint.dequantify()
                df.columns = [c[0] for c in df.columns]
                df = df.set_index('time').tz_localize("UTC").tz_convert("Asia/Tehran").reset_index()
                df["time"] = df["time"].map(str)
                df['value'] = round(df['value'], precision)
                df = df.to_dict(orient='records')

                await self.send(text_data=json.dumps({"id": tile.id, "is_online": tile.sensor.is_online, "data": df}))
                await asyncio.sleep(1)
            self.selected_tab = await database_sync_to_async(self.get_tab)(id=tab_id)
#######################################################################################################################

    async def stream_new(self, event):
        if self.selected_tab:
            for _ in self.selected_tab.tile_set.all():
                try:
                    tile = await database_sync_to_async(self.get_tile)(id=_.id)
                    if tile.sensor.id == event["sensor_id"]:
                        if tile.sensor.type.default_unit not in ["%", None]:
                            unit = tile.sensor.type.default_unit
                        else:
                            unit = 1
                        precision_dict = {
                            "1": 0,
                            "0.1": 1
                        }
                        precision = precision_dict.get(tile.precision, '0.1')
                        df = pd.DataFrame({
                            "time": datetime.datetime.now(),
                            "value": pd.Series(tile.sensor.value, dtype=f"pint[{unit}]"),
                        })
                        if tile.unit != tile.sensor.type.default_unit:
                            logger.debug(tile.unit)
                            df['value'] = df['value'].pint.to(f"{tile.unit}")
                        df = df.pint.dequantify()
                        df.columns = [c[0] for c in df.columns]
                        df = df.set_index('time').tz_localize("UTC").tz_convert("Asia/Tehran").reset_index()
                        df["time"] = df["time"].map(str)
                        df['value'] = round(df['value'], precision)
                        df = df.to_dict(orient='records')
                        await self.send(text_data=json.dumps({"id": tile.id,
                                                              "is_online": tile.sensor.is_online,
                                                              "is_connected": tile.sensor.is_connected, "data": df}))
                except Exception as e:
                    logger.debug(e)

    async def stream_will(self, event):
        if self.selected_tab:
            for tile in self.selected_tab.tile_set.all():
                try:
                    if tile.sensor.id == event["sensor_id"]:
                        if tile.sensor.type.default_unit not in ["%", None]:
                            unit = tile.sensor.type.default_unit
                        else:
                            unit = 1
                        precision_dict = {
                            "1": 0,
                            "0.1": 1
                        }
                        precision = precision_dict.get(tile.precision, '0.1')
                        df = pd.DataFrame({
                            "time": datetime.datetime.now(),
                            "value": pd.Series(tile.sensor.value, dtype=f"pint[{unit}]"),
                        })
                        if tile.unit != tile.sensor.type.default_unit:
                            logger.debug(tile.unit)
                            df['value'] = df['value'].pint.to(f"{tile.unit}")
                        df = df.pint.dequantify()
                        df.columns = [c[0] for c in df.columns]
                        df = df.set_index('time').tz_localize("UTC").tz_convert("Asia/Tehran").reset_index()
                        df["time"] = df["time"].map(str)
                        df['value'] = round(df['value'], precision)
                        df = df.to_dict(orient='records')
                        await self.send(text_data=json.dumps({"id": tile.id,
                                                              "is_connected": True,
                                                              "is_online": False,
                                                              "data": df}))
                        await asyncio.sleep(1)
                except Exception as e:
                    logger.debug(e)

    async def stream_alt_will(self, event):
        if self.selected_tab:
            for tile in self.selected_tab.tile_set.all():
                try:
                    if tile.sensor.id == event["sensor_id"]:
                        if tile.sensor.type.default_unit not in ["%", None]:
                            unit = tile.sensor.type.default_unit
                        else:
                            unit = 1
                        precision_dict = {
                            "1": 0,
                            "0.1": 1
                        }
                        precision = precision_dict.get(tile.precision, '0.1')
                        df = pd.DataFrame({
                            "time": datetime.datetime.now(),
                            "value": pd.Series(tile.sensor.value, dtype=f"pint[{unit}]"),
                        })
                        if tile.unit != tile.sensor.type.default_unit:
                            logger.debug(tile.unit)
                            df['value'] = df['value'].pint.to(f"{tile.unit}")
                        df = df.pint.dequantify()
                        df.columns = [c[0] for c in df.columns]
                        df = df.set_index('time').tz_localize("UTC").tz_convert("Asia/Tehran").reset_index()
                        df["time"] = df["time"].map(str)
                        df['value'] = round(df['value'], precision)
                        df = df.to_dict(orient='records')
                        await self.send(text_data=json.dumps({"id": tile.id,
                                                              "is_connected": False,
                                                              "is_online": True,
                                                              "data": df}))
                        await asyncio.sleep(1)
                except Exception as e:
                    logger.debug(e)