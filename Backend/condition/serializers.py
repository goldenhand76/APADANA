from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers
from condition.models import Continues, Binary, Schedule
from device.models import Sensor, Actuator


class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = ('id', 'part_number', 'title', 'type')


class ActuatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actuator
        fields = ('id', 'part_number', 'title', 'type')


class GenericRelatedField(serializers.Field):
    def to_representation(self, value):
        if isinstance(value, Sensor):
            return SensorSerializer(value).data
        if isinstance(value, Actuator):
            return ActuatorSerializer(value).data
        return str(value)


class ContinuesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Continues
        fields = "__all__"


class BinarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Binary
        fields = "__all__"


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = "__all__"
