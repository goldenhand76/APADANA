from django.shortcuts import get_object_or_404

from notifications.models import Notification
from rest_framework import serializers
from automation.models import ManualTile, AutomaticTile
from device.models import Sensor, Actuator
from authentication.models import User
from device.models import Actuator
from actstream.models import Action, following
from notifications.models import NotificationManager
from django.contrib.contenttypes.models import ContentType


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'photo')


class ManualTileSerializer(serializers.ModelSerializer):
    app = serializers.ReadOnlyField(default='Automation')
    type = serializers.ReadOnlyField(default='ManualTile')

    class Meta:
        model = ManualTile
        fields = ('id', 'title', 'app', 'type')
        depth = 1


class AutomaticTileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomaticTile
        fields = ('id', 'title')
        depth = 1


class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = ('id', 'type', 'title', 'part_number')
        depth = 1


class ActuatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actuator
        fields = ('id', 'type', 'title', 'part_number')
        depth = 1

class GenericRelatedField(serializers.Field):
    def to_representation(self, value):
        if isinstance(value, ContentType):
            return ContentTypeListSerializer(value).data
        if isinstance(value, User):
            return UserSerializer(value).data
        if isinstance(value, Sensor):
            return SensorSerializer(value).data
        if isinstance(value, Actuator):
            return ActuatorSerializer(value).data
        if isinstance(value, ManualTile):
            return ManualTileSerializer(value).data
        if isinstance(value, AutomaticTile):
            return AutomaticTileSerializer(value).data
        return str(value)


class AllNotificationsListSerializer(serializers.ModelSerializer):
    recipient = GenericRelatedField(read_only=True)
    actor = GenericRelatedField(read_only=True)
    actor_content_type = GenericRelatedField(read_only=True)
    target = GenericRelatedField(read_only=True)
    action_object = GenericRelatedField(read_only=True)

    class Meta:
        model = Notification
        fields = ('id', 'recipient', 'actor_content_type', 'actor', 'target', 'action_object', 'verb', 'description', 'unread', 'public', 'timestamp')


class RetrieveActuator(serializers.ModelSerializer):
    class Meta:
        model = Actuator
        fields = ['id', 'title']


class ContentTypeListSerializer(serializers.ModelSerializer):
    app_label_fa = serializers.SerializerMethodField()
    model_fa = serializers.SerializerMethodField()

    class Meta:
        model = ContentType
        fields = ["id", "app_label", "app_label_fa", "model", "model_fa"]
        depth = 1

    def get_model_fa(self, content):
        if content.model == "sensor":
            return 'سنسور'
        elif content.model == "actuator":
            return 'عملگر'
        elif content.model == "manualtile":
            return 'اتوماسیون دستی'
        elif content.model == "automatictile":
            return 'اتوماسیون اتوماتیک'
        else:
            return None

    def get_app_label_fa(self, content):
        if content.app_label == "automation":
            return 'اتوماسیون'
        if content.app_label == "device":
            return 'دستگاه'
        else:
            return None


class NotificationManagerListSerializer(serializers.ModelSerializer):
    content_type = ContentTypeListSerializer(source='action_object_content_type')
    action_object = GenericRelatedField(read_only=True)
    condition_fa = serializers.SerializerMethodField()
    following = serializers.SerializerMethodField()

    class Meta:
        model = NotificationManager
        fields = ['id', 'title', 'content_type', 'action_object', 'condition', 'condition_fa', 'set_point', 'following']

    def get_following(self, notification):
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user
            return notification in following(user)

    def get_condition_fa(self, notification):
        if notification.condition == "LT":
            return "کمتر از"
        if notification.condition == "HT":
            return "بیشتر از"
        if notification.condition == "ON":
            return "روشن"
        if notification.condition == "OFF":
            return "خاموش"
        if notification.condition == "SWITCH":
            return "تغییر وضعیت"


class NotificationManagerUpdateSerializer(serializers.ModelSerializer):
    content_type = ContentTypeListSerializer(source='action_object_content_type', required=False)
    action_object = GenericRelatedField(required=False)
    condition_fa = serializers.SerializerMethodField()
    following = serializers.SerializerMethodField()

    class Meta:
        model = NotificationManager
        fields = ['id', 'title', 'content_type', 'action_object', 'condition', 'condition_fa', 'set_point', 'following']

    def get_following(self, notification):
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user
            return notification in following(user)

    def get_condition_fa(self, notification):
        if notification.condition == "LT":
            return "کمتر از"
        if notification.condition == "HT":
            return "بیشتر از"
        if notification.condition == "ON":
            return "روشن"
        if notification.condition == "OFF":
            return "خاموش"
        if notification.condition == "SWITCH":
            return "تغییر وضعیت"


class NotificationManagerRetrieveSerializer(serializers.ModelSerializer):
    content_type_id = serializers.IntegerField(source="action_object_content_type_id")
    action_object_id = serializers.IntegerField()

    class Meta:
        model = NotificationManager
        fields = ['id', 'title', 'content_type_id', 'action_object_id', 'condition', 'set_point']


class NotificationManagerCreateSerializer(serializers.ModelSerializer):
    content_type_id = serializers.IntegerField(source="action_object_content_type_id")
    action_object_id = serializers.IntegerField()

    class Meta:
        model = NotificationManager
        fields = ['title', 'content_type_id', 'action_object_id', 'condition', 'set_point']

    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user
        ctype = get_object_or_404(ContentType, pk=validated_data.pop('action_object_content_type_id'))
        instance = get_object_or_404(ctype.model_class(), pk=validated_data.pop('action_object_id'))
        alarm = NotificationManager.objects.create(action_object=instance, organization=user.organization,
                                                   **validated_data)
        return alarm
