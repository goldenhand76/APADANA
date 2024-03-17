from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, mixins, permissions, status
from rest_framework.response import Response
from device.models import Type, Sensor, Actuator
from device.serializers import TypeListSerializer, SensorListSerializer, ActuatorListSerializer
from device.filters import IsOwnerFilterBackend, HasType


class TypeListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None
    queryset = Type.objects.all()
    serializer_class = TypeListSerializer
    filter_backends = [DjangoFilterBackend, HasType]
    filterset_fields = ['value']

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class SensorListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None
    queryset = Sensor.objects.all()
    serializer_class = SensorListSerializer
    filter_backends = [DjangoFilterBackend, IsOwnerFilterBackend]
    filterset_fields = ['type']

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class ActuatorListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None
    queryset = Actuator.objects.all()
    serializer_class = ActuatorListSerializer
    filter_backends = [IsOwnerFilterBackend, ]
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
