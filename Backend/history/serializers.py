import logging
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from history.tasks import influx_query
from device.models import Sensor, Type

logger = logging.getLogger('django')


class HistorySerializer(serializers.Serializer):
    sensor_type = serializers.IntegerField(max_value=1000)
    sensor_list = serializers.ListField(child=serializers.IntegerField(max_value=1000))
    start_time = serializers.DateTimeField(required=True)
    stop_time = serializers.DateTimeField(required=True)
    timestamp = serializers.SerializerMethodField(required=False)
    data = serializers.SerializerMethodField(required=False)

    def get_timestamp(self, obj):
        days = (obj['stop_time'] - obj['start_time']).days
        seconds = (obj['stop_time'] - obj['start_time']).seconds
        if days < 1:
            return '1m'
        elif days <= 2:
            return '5m'
        elif days < 7:
            return '30m'
        elif days < 30:
            return '1h'
        elif days < 90:
            return '2h'
        elif days < 365:
            return '6h'
        else:
            return '1d'

    def get_data(self, obj):
        logger.debug(obj)
        return influx_query(obj['sensor_list'], obj['start_time'], obj['stop_time'], self.get_timestamp(obj))

    def validate(self, attrs):
        if attrs['start_time'] >= attrs['stop_time']:
            raise ValidationError({'Bad request': 'Start time must be lower than stop time'})
        try:
            Type.objects.get(pk=attrs['sensor_type'])
        except Type.DoesNotExist:
            raise ValidationError({'Bad request': 'Type item does not exists'})

        for pk in attrs['sensor_list']:
            try:
                if Sensor.objects.get(pk=pk).type_id == attrs['sensor_type']:
                    pass
                else:
                    raise ValidationError({'Bad request': 'Type of sensors is not the same'})
            except Sensor.DoesNotExist:
                raise ValidationError({'Bad request': 'Type item does not exists'})
        return attrs
