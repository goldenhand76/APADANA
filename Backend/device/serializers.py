from django.core.exceptions import ObjectDoesNotExist, ValidationError
from rest_framework import serializers
from monitoring.models import Tab, Tile
from device.models import Type, Sensor, Actuator


class TypeListSerializer(serializers.ModelSerializer):
    default_unit = serializers.CharField(required=False)

    class Meta:
        model = Type
        fields = ['id', 'name', 'title', 'default_unit', 'units', 'value']


class SensorListSerializer(serializers.ModelSerializer):
    type = TypeListSerializer()

    class Meta:
        model = Sensor
        fields = ["id", "part_number", "title", "is_online", "type"]


class SensorRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = ["id", "is_online", "is_connected"]


class ActuatorListSerializer(serializers.ModelSerializer):
    type = TypeListSerializer()

    class Meta:
        model = Actuator
        fields = ['id', 'part_number', 'title', 'is_online', 'manual_selected', 'automatic_selected', 'value', 'set_value', 'set_time', 'type']

    def to_internal_value(self, data):
        try:
            return Actuator.objects.get(**data)
        except ObjectDoesNotExist:
            raise ValidationError(["error"])
