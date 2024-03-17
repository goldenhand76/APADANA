from rest_framework import serializers
from automation.models import ManualTile, AutomaticTile
from authentication.models import User
from actstream.models import Action


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'photo')


class ManualTileSerializer(serializers.ModelSerializer):
    app = serializers.ReadOnlyField(default='Automation')
    type = serializers.ReadOnlyField(default='ManualTile')

    class Meta:
        model = ManualTile
        fields = ('id', 'title', 'app', 'type')


class AutomaticTileSerializer(serializers.ModelSerializer):
    app = serializers.ReadOnlyField(default='Automation')
    type = serializers.ReadOnlyField(default='AutomaticTile')

    class Meta:
        model = AutomaticTile
        fields = ('id', 'title', 'app', 'type')


class GenericRelatedField(serializers.Field):
    def to_representation(self, value):
        if isinstance(value, User):
            return UserSerializer(value).data
        if isinstance(value, ManualTile):
            return ManualTileSerializer(value).data
        if isinstance(value, AutomaticTile):
            return AutomaticTileSerializer(value).data
        return str(value)


class ActionSerializer(serializers.ModelSerializer):
    actor = GenericRelatedField(read_only=True)
    target = GenericRelatedField(read_only=True)
    action_object = GenericRelatedField(read_only=True)

    class Meta:
        model = Action
        fields = ('id', 'actor', 'target', 'action_object', 'verb', 'description', 'public', 'timestamp')
