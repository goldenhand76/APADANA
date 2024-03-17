import json
from django.core.validators import ValidationError
from django.utils.translation import gettext_lazy as _
from django.db.models import Q
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from django.contrib.auth import get_user_model
from automation.models import ManualTile, AutomaticTile, SmartTile
from device.models import Sensor, Actuator
from device.serializers import SensorListSerializer, ActuatorListSerializer
from authentication.models import Organization
from authentication.serializers import OrganizationSerializer
import logging

User = get_user_model()
logger = logging.getLogger('django')


class AutomationBoxSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['automation']

    def validate(self, attrs):
        automation = attrs.get('automation', None)

        return attrs

    def to_internal_value(self, data):
        type = data.get("type", None)
        automation = data.get("automation")
        request = self.context.get("request")
        if type:
            if type == "last":
                pass
            elif type == "active":
                if automation == 'automatic':
                    AutomaticTile.objects.filter(field=request.user.organization).update(active=True)
                if automation == 'manual':
                    ManualTile.objects.filter(field=request.user.organization, lock=False).update(active=True)
            elif type == "deactive":
                if automation == 'automatic':
                    AutomaticTile.objects.filter(field=request.user.organization).update(active=False)
                if automation == 'manual':
                    ManualTile.objects.filter(field=request.user.organization, lock=False).update(active=False)
        return super().to_internal_value(data)


class ManageSensorSerializer(serializers.ModelSerializer):
    part_number = serializers.CharField(read_only=True)

    class Meta:
        model = Sensor
        fields = ["id", "title", "part_number"]


class ManageActuatorSerializer(serializers.ModelSerializer):
    part_number = serializers.CharField(read_only=True)

    class Meta:
        model = Actuator
        fields = ["id", "title", "part_number"]


class ManageDeviceListSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=False)
    sensors = serializers.SerializerMethodField()
    actuators = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = "__all__"

    def get_sensors(self, organization):
        sensors = Sensor.objects.filter(organization_id=organization)
        serializer = SensorListSerializer(instance=sensors, many=True)
        return serializer.data

    def get_actuators(self, organization):
        actuators = Actuator.objects.filter(organization_id=organization)
        serializer = ActuatorListSerializer(instance=actuators, many=True)
        return serializer.data


class ManageDeviceSerializer(serializers.Serializer):
    part_number = serializers.CharField(max_length=64, required=False)
    title = serializers.CharField(max_length=64, required=False)

    def validate(self, attrs):
        organization = self.initial_data["organization"]
        method = self.initial_data["method"]
        none_organization = Organization.objects.get(name='None')
        part_number = attrs.get('part_number').replace("_", "-").replace(" ", "-").lower()

        sensor = Sensor.objects.filter(part_number__iexact=part_number)
        actuator = Actuator.objects.filter(part_number__iexact=part_number)
        if not (sensor.exists() | actuator.exists()):
            raise ValidationError(_("Device Not Found"), code="not_found_device")

        self_occupied_sensor = sensor.filter(organization=organization)
        self_occupied_actuator = actuator.filter(organization=organization)
        if self_occupied_sensor.exists() | self_occupied_actuator.exists():
            if method == "PATCH":
                raise ValidationError(_("Device has been occupied before."), code="occupied_device")

        other_occupied_sensor = sensor.filter(Q(organization=none_organization) | Q(organization=organization))
        other_occupied_actuator = actuator.filter(Q(organization=none_organization) | Q(organization=organization))
        if not (other_occupied_sensor.exists() | other_occupied_actuator.exists()):
            raise ValidationError(_("Device has been occupied by another organization before."), code="3rd_occupied_device")

        return super().validate(attrs)


class ManageNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ('email', 'message', 'telegram')
