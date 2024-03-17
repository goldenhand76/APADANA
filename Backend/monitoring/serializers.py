from rest_framework import serializers
from monitoring.models import Tab, Tile
from device.models import Type
from device.serializers import SensorRetrieveSerializer, SensorListSerializer
from monitoring.validators import max_tab_validator, max_tile_validator, max_character_validator
import logging
import pint

ureg = pint.UnitRegistry()
# ureg.define('ppm =  count')
#=======================================
# Define the PPM unit as a dimensionless unit with a scale factor of 1e-6
# ureg.define('PPM = 1e-6 * dimensionless')
ureg.define('PPM = 1')
ureg.define('LUX = 1')
#==================


value = ureg.Quantity
# from monitoring.tasks import influx_query
logger = logging.getLogger('django')


class CustomTypeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Type
        fields = ['id', 'name', 'title']


class ListTabSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tab
        fields = ['id', 'title', 'location', 'is_favorite', 'order']


class UpdateTabSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tab
        fields = ['id', 'title', 'location', 'is_favorite', 'order']

    def validate(self, attrs):
        return attrs


class CreateTabSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tab
        fields = ['id', 'title', 'location', 'is_favorite', 'order']

    def validate(self, attrs):
        max_tab_validator(self.context["request"].user.organization)
        return attrs


class ListTilesSerializer(serializers.ModelSerializer):
    sensor_type = CustomTypeListSerializer(read_only=True)
    sensor = SensorRetrieveSerializer(read_only=True)
    unit = serializers.CharField(required=False)
    interval = serializers.SerializerMethodField()

    class Meta:
        model = Tile
        fields = ['id', 'title', 'size', 'type', 'unit', 'precision', 'timeRange', 'interval',
                  "status", "sensor", 'sensor_type']

    def get_interval(self, tile):
        interval_dict = {'5m': '10s', '30m': '30s', '1h': '1m', '6h': '6m', '1d': '1h'}
        interval = interval_dict.get(tile.timeRange, '5m')
        return interval


class UpdateTileSerializer(serializers.ModelSerializer):
    title = serializers.CharField(max_length=24, validators=[max_character_validator])
    timeRange = serializers.CharField(default="5m")
    precision = serializers.CharField(default="1")
    type = serializers.CharField(default="small")
    unit = serializers.CharField(required=False)

    class Meta:
        model = Tile
        fields = ['id', 'title', 'size', 'type', 'unit', 'precision', 'timeRange',
                  "status", "sensor", 'sensor_type']

    def validate(self, attrs):
        max_tile_validator(self.context["view"].kwargs["id"], self.context["request"].user.organization)
        return attrs


class DataTileSerializer(serializers.ModelSerializer):
    data = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    is_connected = serializers.SerializerMethodField()

    class Meta:
        model = Tile
        fields = ['id', 'is_online', 'is_connected', 'interval', "data"]

    def get_data(self, tile):
        return tile.data

    def get_is_online(self, tile):
        return tile.sensor.is_online

    def get_is_connected(self, tile):
        return tile.sensor.is_connected

    def get_sensor_type(self, tile):
        return tile.sensor_type.title


class GaugeSerializer(serializers.ModelSerializer):
    data = serializers.SerializerMethodField()
    max = serializers.SerializerMethodField()
    min = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    is_connected = serializers.SerializerMethodField()

    class Meta:
        model = Tile
        fields = ['id', 'is_online', 'is_connected', 'unit', 'precision', "max", "min", "data"]

    def get_max(self, tile):
        if tile.sensor.type.default_unit not in ["%", None]:
            unit = tile.sensor.type.default_unit
        else:
            unit = '1'


        #===
        logging.info('RAMINNNNNNNNNNNNNNNNNNNN')
        #===== New code ===
        if (unit=='ppm'):
            umax=5000
            logging.info('RAMINNNNNNNNNNNNNNNNNNNN_PPM')
            return int(umax)
        else:
            #+=====
            umax = value(tile.sensor.type.max, unit)
            if tile.unit != tile.sensor.type.default_unit:
                umax = umax.to(tile.unit)
            return int(umax.magnitude)

    def get_min(self, tile):
        if tile.sensor.type.default_unit not in ["%", None]:
            unit = tile.sensor.type.default_unit
        else:
            unit = '1'


        # ===== New code ===
        if (unit == 'ppm'):
            umin = 0
            return int (umin)
        #=================
        else:
            umin = value(tile.sensor.type.min, unit)
            if tile.unit != tile.sensor.type.default_unit:
                umin = umin.to(tile.unit)
            return int(umin.magnitude)

    def get_data(self, tile):
        return tile.gauge

    def get_is_online(self, tile):
        return tile.sensor.is_online

    def get_is_connected(self, tile):
        return tile.sensor.is_online


class GraphSerializer(serializers.ModelSerializer):
    data = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()
    is_connected = serializers.SerializerMethodField()

    class Meta:
        model = Tile
        fields = ['id', 'is_online', 'is_connected', 'interval', "data"]

    def get_data(self, tile):
        return tile.graph

    def get_is_online(self, tile):
        return tile.sensor.is_online

    def get_is_connected(self, tile):
        return tile.sensor.is_connected

    def get_sensor_type(self, tile):
        return tile.sensor_type.title