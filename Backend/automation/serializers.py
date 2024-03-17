from actstream.models import following
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from rest_framework import serializers
from automation.models import ManualTile, AutomaticTile, SmartTile
from notifications.models import NotificationManager
from condition.serializers import ContinuesSerializer, BinarySerializer, ScheduleSerializer
from condition.models import Continues, Binary, Schedule
from device.serializers import ActuatorListSerializer
from automation.validators import actuator_duplication_validator
from rest_framework.validators import UniqueValidator
import logging
import re

logger = logging.getLogger('django')


class ContentTypeSerializer(serializers.ModelSerializer):
    app_label_fa = serializers.SerializerMethodField()
    model_fa = serializers.SerializerMethodField()

    class Meta:
        model = ContentType
        fields = ["id", "app_label", "app_label_fa", "model_fa", "model"]
        read_only_fields = ["model"]

    def to_internal_value(self, data):
        try:
            return ContentType.objects.get(**data)
        except ObjectDoesNotExist:
            raise ValidationError(["error"])

    def get_model_fa(self, content):
        if content.model == "sensor":
            return 'سنسور'
        if content.model == "actuator":
            return 'عملگر'
        if content.model == "continues":
            return 'پیوسته'
        if content.model == "binary":
            return 'صفر و یک'
        if content.model == "schedule":
            return 'زمانبندی'
        else:
            return None

    def get_app_label_fa(self, content):
        if content.app_label == "automation":
            return 'اتوماسیون'
        if content.app_label == "device":
            return 'دستگاه'
        if content.app_label == "condition":
            return 'نوع وضعیت'
        else:
            return None


class GenericRelatedField(serializers.Field):
    def to_representation(self, value):
        if isinstance(value, Continues):
            return ContinuesSerializer(value).data
        if isinstance(value, Binary):
            return BinarySerializer(value).data
        if isinstance(value, Schedule):
            return ScheduleSerializer(value).data
        return str(value)

    def to_internal_value(self, data):
        operator = data.get("operator", "")
        if operator in ["LT", "HT"]:
            serializer = ContinuesSerializer(data=data)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return serializer.instance
        if operator in ["ON", "OFF", "SWITCH"]:
            serializer = BinarySerializer(data=data)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return serializer.instance
        if operator in ["ONCE", "HOURLY", "DAILY", "WEEKLY", "MONTHLY", "SEASONALLY", "YEARLY"]:
            serializer = ScheduleSerializer(data=data)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return serializer.instance
        else:
            raise serializers.ValidationError("operator not found")


class ListManualTileSerializer(serializers.ModelSerializer):
    actuator = ActuatorListSerializer()

    class Meta:
        model = ManualTile
        fields = ['id', 'title', 'actuator', 'order', 'lock', 'active']


class UpdateManualTileSerializer(serializers.ModelSerializer):
    alarm = serializers.SerializerMethodField()
    actuator = ActuatorListSerializer(read_only=True)

    class Meta:
        model = ManualTile
        fields = ['id', 'title', 'actuator', 'alarm', 'active', 'lock', 'order']

    def validate(self, attrs):
        if not attrs.get('active', None):
            if self.instance.active != attrs.get('active'):
                if self.instance.status in ["STARTED", "RETRYING"]:
                    raise ValidationError("Task is In Progress, Please wait ...")
        return super().validate(attrs)

    def get_alarm(self, tile):
        request = self.context.get("request")
        ctype = ContentType.objects.get(model='manualtile')
        alarm = NotificationManager.objects.filter(action_object_content_type=ctype, action_object_id=tile.id)
        if alarm.exists():
            alarm = alarm.first()
            return {'id': alarm.id, 'condition': alarm.condition, 'set_point': alarm.set_point,
                    'following': alarm in following(request.user)}
        return None


class CreateManualTileSerializer(serializers.ModelSerializer):
    alarm = serializers.SerializerMethodField()
    actuator = ActuatorListSerializer(validators=[actuator_duplication_validator])

    class Meta:
        model = ManualTile
        fields = ['id', 'title', 'actuator', 'alarm', 'active', 'lock', 'order']

    def validate(self, attrs):
        if not attrs.get('active', None):
            if self.instance.active != attrs.get('active'):
                if self.instance.status in ["STARTED", "RETRYING"]:
                    raise ValidationError("Task is In Progress, Please wait ...")
        return super().validate(attrs)

    def get_alarm(self, tile):
        request = self.context.get("request")
        ctype = ContentType.objects.get(model='manualtile')
        alarm = NotificationManager.objects.filter(action_object_content_type=ctype, action_object_id=tile.id)
        if alarm.exists():
            alarm = alarm.first()
            return {'id': alarm.id, 'condition': alarm.condition, 'set_point': alarm.set_point,
                    'following': alarm in following(request.user)}
        return None


class ListAutomaticTileSerializer(serializers.ModelSerializer):
    actuator = ActuatorListSerializer()

    class Meta:
        model = ManualTile
        fields = ['id', 'title', 'actuator', 'order', 'lock', 'active']


class UpdateAutomaticTileSerializer(serializers.ModelSerializer):
    alarm = serializers.SerializerMethodField()
    condition_content_type = ContentTypeSerializer()
    condition_object = GenericRelatedField()
    actuator = ActuatorListSerializer()

    class Meta:
        model = AutomaticTile
        fields = ['id', 'title', 'condition_content_type', 'condition_object', 'type', 'output', 'actuator', 'alarm',
                  'delay', 'delay_status', 'active', 'lock', 'order']
        # depth = 1

    def validate(self, attrs):
        delay = attrs.get('delay', None)
        if delay:
            if len(delay) > 1:
                if not bool(re.fullmatch("[0-9]*m", delay)):
                    raise ValidationError(["error"])
        return super().validate(attrs)

    def get_alarm(self, tile):
        request = self.context.get("request")
        ctype = ContentType.objects.get(model='automatictile')
        alarm = NotificationManager.objects.filter(action_object_content_type=ctype, action_object_id=tile.id)
        if alarm.exists():
            alarm = alarm.first()
            return {'id': alarm.id, 'condition': alarm.condition, 'set_point': alarm.set_point, 'following': alarm in following(request.user)}
        return None


class ListSmartTileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmartTile
        fields = ['id', 'title', 'active']


class RetrieveSmartTileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmartTile
        fields = ['id', 'title', 'active']


class UpdateSmartTileSerializer(serializers.ModelSerializer):
    title = serializers.CharField(read_only=True)

    class Meta:
        model = SmartTile
        fields = ['id', 'title', 'active']
