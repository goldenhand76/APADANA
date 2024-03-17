from actstream.actions import follow, unfollow
from django.contrib.contenttypes.models import ContentType
from django.db.models import F
from django.shortcuts import get_object_or_404
from rest_framework import generics, mixins, permissions
from automation.filters import IsOwnerFilterBackend
from condition.models import Continues, Schedule, Binary
from monitoring.permissions import TabOwner
from automation.models import ManualTile, AutomaticTile, SmartTile
from automation.serializers import ListManualTileSerializer, CreateManualTileSerializer, \
    ListAutomaticTileSerializer, UpdateAutomaticTileSerializer, UpdateManualTileSerializer, \
    ListSmartTileSerializer, UpdateSmartTileSerializer, ContentTypeSerializer
from django.db import transaction
from actstream import action
import logging

from notifications.models import NotificationManager

logger = logging.getLogger('django')


class ListManualTileView(mixins.ListModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None
    queryset = ManualTile.objects.filter(deleted_at=None)
    serializer_class = ListManualTileSerializer
    filter_backends = [IsOwnerFilterBackend]

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class RetrieveManualTileView(mixins.RetrieveModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, TabOwner)
    queryset = ManualTile.objects.filter(deleted_at=None)
    serializer_class = UpdateManualTileSerializer
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class UpdateManualTileView(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, TabOwner)
    queryset = ManualTile.objects.filter(deleted_at=None)
    serializer_class = UpdateManualTileSerializer
    lookup_field = 'id'

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def perform_update(self, serializer):
        tile_instance = self.get_object()
        tile = serializer.save()
        if tile.active != tile_instance.active:
            if tile.active:
                action.send(sender=self.request.user, action_object=tile, target=tile.field, verb="Turned On")
            else:
                action.send(sender=self.request.user, action_object=tile, target=tile.field, verb="Turned Off")
        NotificationManager.update_manual_tile_alarm(self.request, tile)


class CreateManualTileView(mixins.CreateModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = ManualTile.objects.prefetch_related('actuator').all()
    serializer_class = CreateManualTileSerializer

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def perform_create(self, serializer):
        tile = serializer.save(field=self.request.user.organization)
        tile.actuator.manual_selected = True
        tile.actuator.save()
        action.send(sender=self.request.user, action_object=tile, target=tile.field, verb="Created")
        NotificationManager.save_manual_tile_alarm(self.request, tile)


class DestroyManualTileView(mixins.DestroyModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, TabOwner)
    queryset = ManualTile.objects.prefetch_related('actuator').filter(deleted_at=None)
    lookup_field = 'id'
    serializer_class = UpdateManualTileSerializer

    def delete(self, request, *args, **kwargs):
        with transaction.atomic():
            tile = get_object_or_404(ManualTile, id=kwargs.get('id'))
            ManualTile.objects.filter(order__gt=tile.order).exclude(pk=kwargs.get('id')).update(order=F('order') - 1)
        return self.destroy(request, *args, **kwargs)

    def perform_destroy(self, instance):
        action.send(sender=self.request.user, action_object=instance, target=instance.field, verb="Deleted")
        content_type = ContentType.objects.get(model='manualtile')
        NotificationManager.objects.filter(action_object_content_type=content_type, action_object_id=instance.id).delete()
        instance.delete()


class ListAutomaticTileView(mixins.ListModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None
    queryset = AutomaticTile.objects.filter(deleted_at=None)
    serializer_class = ListAutomaticTileSerializer
    filter_backends = [IsOwnerFilterBackend]

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class RetrieveAutomaticTileView(mixins.RetrieveModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, TabOwner)
    queryset = AutomaticTile.objects.filter(deleted_at=None)
    serializer_class = UpdateAutomaticTileSerializer
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class UpdateAutomaticTileView(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, TabOwner)
    queryset = AutomaticTile.objects.filter(deleted_at=None)
    serializer_class = UpdateAutomaticTileSerializer
    lookup_field = 'id'

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def perform_update(self, serializer):
        tile_instance = self.get_object()
        tile = serializer.save()
        if tile_instance.condition_object_id != tile.condition_object_id:
            if tile_instance.condition_content_type.model == "schedule":
                Schedule.objects.filter(id=tile_instance.condition_object_id).delete()
            elif tile_instance.condition_content_type.model == "continues":
                Continues.objects.filter(id=tile_instance.condition_object_id).delete()
            elif tile_instance.condition_content_type.model == "binary":
                Binary.objects.filter(id=tile_instance.condition_object_id).delete()
        if tile.active != tile_instance.active:
            if tile.active:
                action.send(sender=self.request.user, action_object=tile, target=tile.field, verb="Turned On")
            else:
                action.send(sender=self.request.user, action_object=tile, target=tile.field, verb="Turned Off")
        NotificationManager.update_automatic_tile_alarm(self.request, tile)


class CreateAutomaticTileView(mixins.CreateModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = AutomaticTile.objects.all()
    serializer_class = UpdateAutomaticTileSerializer

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def perform_create(self, serializer):
        tile = serializer.save(field=self.request.user.organization)
        tile.actuator.automatic_selected = True
        tile.actuator.save()
        action.send(sender=self.request.user, action_object=tile, target=tile.field, verb="Created")
        NotificationManager.save_automatic_tile_alarm(self.request, tile)


class DestroyAutomaticTileView(mixins.DestroyModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, TabOwner)
    queryset = AutomaticTile.objects.filter(deleted_at=None)
    lookup_field = 'id'
    serializer_class = UpdateAutomaticTileSerializer

    def delete(self, request, *args, **kwargs):
        with transaction.atomic():
            tile = get_object_or_404(AutomaticTile, id=kwargs.get('id'))
            AutomaticTile.objects.filter(order__gt=tile.order).exclude(pk=kwargs.get('id')).update(order=F('order') - 1)
        return self.destroy(request, *args, **kwargs)

    def perform_destroy(self, instance):
        action.send(sender=self.request.user, action_object=instance, target=instance.field, verb="Deleted")
        content_type = ContentType.objects.get(model='automatictile')
        NotificationManager.objects.filter(action_object_content_type=content_type, action_object_id=instance.id).delete()
        if instance.condition_content_type.model == "schedule":
            Schedule.objects.filter(id=instance.condition_object_id).delete()
        elif instance.condition_content_type.model == "continues":
            Continues.objects.filter(id=instance.condition_object_id).delete()
        elif instance.condition_content_type.model == "binary":
            Binary.objects.filter(id=instance.condition_object_id).delete()
        instance.delete()


class ListSmartTileView(mixins.ListModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None
    queryset = SmartTile.objects.filter(deleted_at=None)
    serializer_class = ListSmartTileSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class RetrieveSmartTileView(mixins.RetrieveModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = SmartTile.objects.filter(deleted_at=None)
    serializer_class = UpdateSmartTileSerializer
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class UpdateSmartTileView(mixins.ListModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = SmartTile.objects.filter(deleted_at=None)
    serializer_class = UpdateSmartTileSerializer
    lookup_field = 'id'

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


class ConditionContentTypeSerializer(mixins.ListModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = ContentType.objects.filter(app_label="condition", model__in=("continues", "binary", "schedule"))
    serializer_class = ContentTypeSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class IfContentTypeSerializer(mixins.ListModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = ContentType.objects.filter(app_label="device", model__in=("sensor", "actuator"))
    serializer_class = ContentTypeSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
