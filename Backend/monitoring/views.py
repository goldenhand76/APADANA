from django.db.models import F
from django.shortcuts import get_object_or_404
from django.utils import translation
from rest_framework import generics, mixins, permissions, status
import channels.layers
from rest_framework.response import Response
from asgiref.sync import async_to_sync
from monitoring.filters import IsOwnerFilterBackend, TabFilterBackend
from monitoring.permissions import TabOwner, TileOwner
from monitoring.models import Tab, Tile
from monitoring.serializers import ListTabSerializer, UpdateTabSerializer, ListTilesSerializer, UpdateTileSerializer, \
    DataTileSerializer, CreateTabSerializer, GaugeSerializer, GraphSerializer
from django.db import transaction
from monitoring.permissions import IsAdminUser
import logging

logger = logging.getLogger('django')


class ListTabView(mixins.ListModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None
    queryset = Tab.objects.all()
    serializer_class = ListTabSerializer
    filter_backends = [IsOwnerFilterBackend]

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class RetrieveTabView(mixins.RetrieveModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, TabOwner)
    queryset = Tab.objects.all()
    serializer_class = UpdateTabSerializer
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class UpdateTabView(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, TabOwner)
    queryset = Tab.objects.all()
    serializer_class = UpdateTabSerializer
    lookup_field = 'id'

    def patch(self, request, *args, **kwargs):
        tab = self.queryset.get(id=kwargs.get('id'))
        if request.data.get('order'):
            Tab.objects.move(tab, request.data.get('order'))
        return self.partial_update(request, *args, **kwargs)


class CreateTabView(mixins.CreateModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Tab.objects.all()
    serializer_class = CreateTabSerializer
    translation.activate('fa')

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(field=self.request.user.organization)


class DestroyTabView(mixins.DestroyModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, TabOwner)
    queryset = Tab.objects.all()
    lookup_field = 'id'
    serializer_class = UpdateTabSerializer

    def delete(self, request, *args, **kwargs):
        with transaction.atomic():
            tab = get_object_or_404(Tab, id=kwargs.get('id'))
            Tab.objects.filter(order__gt=tab.order).exclude(pk=kwargs.get('id')).update(order=F('order') - 1)
        return self.destroy(request, *args, **kwargs)


class ListTileView(mixins.ListModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None
    queryset = Tile.objects.all()
    serializer_class = ListTilesSerializer
    filter_backends = [TabFilterBackend]
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class RetrieveTileView(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, TileOwner)
    queryset = Tile.objects.all()
    serializer_class = UpdateTileSerializer
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class UpdateTileView(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, TileOwner, IsAdminUser)
    queryset = Tile.objects.all()
    serializer_class = UpdateTileSerializer
    lookup_field = 'id'

    def patch(self, request, *args, **kwargs):
        tile = get_object_or_404(Tile, id=kwargs.get('id'))
        if request.data.get('order'):
            try:
                Tile.objects.move(tile, request.data.get('order'))
            except KeyError:
                return Response(data={'error': 'order is greater than max order'}, status=status.HTTP_400_BAD_REQUEST, )

        response = self.partial_update(request, *args, **kwargs)
        channel_layer = channels.layers.get_channel_layer()
        route = f"tab_{tile.tab_id}"
        async_to_sync(channel_layer.group_send)(route, {"type": "get_tile", "tile": tile.id})
        return response


class CreateTileView(mixins.CreateModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, IsAdminUser)
    queryset = Tab.objects.all()
    serializer_class = UpdateTileSerializer
    lookup_field = 'id'

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def perform_create(self, serializer):
        tab = self.queryset.get(id=self.kwargs.get('id'))
        serializer.save(tab=tab)


class DestroyTileView(mixins.DestroyModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, TileOwner, IsAdminUser)
    queryset = Tile.objects.all()
    lookup_field = 'id'
    serializer_class = UpdateTileSerializer

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class DataTileView(mixins.RetrieveModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, TileOwner)
    queryset = Tile.objects.all()
    serializer_class = DataTileSerializer
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class GaugeView(mixins.RetrieveModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, TileOwner)
    queryset = Tile.objects.all()
    serializer_class = GaugeSerializer
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class GraphView(mixins.RetrieveModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, TileOwner)
    queryset = Tile.objects.all()
    serializer_class = GraphSerializer
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)