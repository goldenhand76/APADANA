import logging

from django.contrib.contenttypes.models import ContentType
from django.db.models import F, Q
from rest_framework import generics, mixins, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from swapper import load_model

from monitoring.models import Tile
from automation.models import ManualTile, AutomaticTile
from authentication.models import Organization
from notifications.models import NotificationManager
from settings.serializers import AutomationBoxSerializer, ManageDeviceListSerializer, \
    ManageNotificationSerializer, ManageDeviceSerializer, ManageSensorSerializer, ManageActuatorSerializer
from django.contrib.auth import get_user_model
from device.models import Sensor, Actuator
from settings.permissions import IsAdminUser
User = get_user_model()
logger = logging.getLogger('django')


class ManageDeviceListView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Organization.objects.all()
    serializer_class = ManageDeviceListSerializer
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        self.kwargs.update({"id": request.user.organization_id})
        return self.retrieve(request, *args, **kwargs)


class ManageSensorView(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ManageSensorSerializer
    queryset = Sensor.objects.all()
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


class ManageActuatorView(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ManageActuatorSerializer
    queryset = Actuator.objects.all()
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


class ManageDeviceUpdateView(APIView):
    permission_classes = (permissions.IsAuthenticated, IsAdminUser)
    serializer_class = ManageDeviceSerializer

    def patch(self, request, *args, **kwargs):
        request.data["organization"] = request.user.organization
        request.data["method"] = "PATCH"
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            part_number = serializer.validated_data["part_number"].replace("_", "-").replace(" ", "-").lower()
            # title = serializer.validated_data["title"]
            Sensor.objects.filter(part_number__iexact=part_number).update(organization=request.user.organization)
            Actuator.objects.filter(part_number__iexact=part_number).update(organization=request.user.organization)
        return Response(data=serializer.validated_data, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        request.data["organization"] = request.user.organization
        request.data["method"] = "DELETE"
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            notifications = load_model('notifications', 'Notification')

            sensors = Sensor.objects.filter(part_number=serializer.validated_data["part_number"])
            if sensors.exists():
                sensor_type = ContentType.objects.get(model='sensor')
                for s in sensors:
                    Tile.objects.filter(sensor=s).delete()
                    NotificationManager.objects.filter(action_object_content_type=sensor_type, action_object_id=s.id).delete()
                    notifications.objects.filter(actor_content_type=sensor_type, actor_object_id=s.id).delete()
                none_organization = Organization.objects.get(name='None')
                sensors.update(organization=none_organization)

            actuators = Actuator.objects.filter(part_number=serializer.validated_data["part_number"])
            if actuators.exists():
                manual_type = ContentType.objects.get(model='manualtile')
                automatic_type = ContentType.objects.get(model='automatictile')
                for a in actuators:
                    manual_tiles = ManualTile.objects.filter(actuator=a)
                    for m in manual_tiles:
                        NotificationManager.objects.filter(action_object_content_type=manual_type, action_object_id=m.id).delete()
                        notifications.objects.filter(actor_content_type=manual_type, actor_object_id=m.id).delete()
                    manual_tiles.delete()
                    automatic_tiles = AutomaticTile.objects.filter(actuator=a)
                    for au in automatic_tiles:
                        NotificationManager.objects.filter(action_object_content_type=automatic_type, action_object_id=au.id).delete()
                        notifications.objects.filter(actor_content_type=automatic_type, actor_object_id=au.id).delete()
                    automatic_tiles.delete()
                none_organization = Organization.objects.get(name='None')
                actuators.update(organization=none_organization, manual_selected=False, automatic_selected=False)

            return Response(status=status.HTTP_204_NO_CONTENT)


class ManageNotificationView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Organization.objects.all()
    serializer_class = ManageNotificationSerializer
    lookup_field = 'id'

    def patch(self, request, *args, **kwargs):
        self.kwargs.update({"id": request.user.organization_id})
        return self.partial_update(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        self.kwargs.update({"id": request.user.organization_id})
        return self.retrieve(request, *args, **kwargs)


class AutomationBoxView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Organization.objects.all()
    serializer_class = AutomationBoxSerializer
    lookup_field = 'id'

    def patch(self, request, *args, **kwargs):
        self.kwargs.update({"id": request.user.organization_id})
        return self.partial_update(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        self.kwargs.update({"id": request.user.organization_id})
        return self.retrieve(request, *args, **kwargs)