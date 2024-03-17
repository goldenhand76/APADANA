# -*- coding: utf-8 -*-
''' Django Notifications example views '''
from distutils.version import \
    StrictVersion  # pylint: disable=no-name-in-module,import-error
from actstream.actions import follow, unfollow
from django import get_version
from django.contrib.auth.decorators import login_required
from django.forms import model_to_dict
from django.shortcuts import get_object_or_404, redirect, reverse
from django.views.decorators.cache import never_cache
from datetime import datetime
from notifications import settings
from notifications.filters import IsOwnerFilterBackend
from notifications.settings import get_config
from notifications.utils import id2slug
from swapper import load_model
from rest_framework import generics, permissions, mixins
from notifications.models import NotificationManager
from rest_framework.generics import ListAPIView
from notifications.serializers import AllNotificationsListSerializer, \
    NotificationManagerListSerializer, NotificationManagerUpdateSerializer, ContentTypeListSerializer, \
    NotificationManagerCreateSerializer, NotificationManagerRetrieveSerializer
from actstream.models import following
from django.contrib.contenttypes.models import ContentType
from django.http.response import HttpResponse
import logging

logger = logging.getLogger('django')

Notification = load_model('notifications', 'Notification')

if StrictVersion(get_version()) >= StrictVersion('1.7.0'):
    from django.http import JsonResponse  # noqa
else:
    # Django 1.6 doesn't have a proper JsonResponse
    import json
    from django.http import HttpResponse  # noqa


    def date_handler(obj):
        return obj.isoformat() if hasattr(obj, 'isoformat') else obj


    def JsonResponse(data):  # noqa
        return HttpResponse(
            json.dumps(data, default=date_handler),
            content_type="application/json")


class AllNotificationsList(ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Notification.objects.all()
    serializer_class = AllNotificationsListSerializer

    def get_queryset(self):
        logger.debug(self.request.META)
        timestamp = self.request.query_params.get('timestamp', None)
        actor_content_type_id = self.request.query_params.get('actor_content_type_id', None)
        actor_object_ids = self.request.query_params.get('actor_object_ids', None)

        qs = self.request.user.notifications.order_by('-timestamp')
        if actor_content_type_id:
            content_type = ContentType.objects.get(id=actor_content_type_id)
            logger.debug(content_type)
            qs = qs.filter(actor_content_type=content_type)
            if actor_object_ids:
                ids = [int(x) for x in actor_object_ids.split(',')]
                qs = qs.filter(actor_object_id__in=ids)

        if timestamp:
            timestamp = datetime.strptime(timestamp, '%Y-%m-%d')
            filtered_count = qs.filter(timestamp__lte=timestamp.date()).count()
            total_count = qs.count()
            page = int((total_count - filtered_count)/10)
            if self.request.query_params.get('page', None) is None:
                self.request.query_params._mutable = True
                self.request.query_params['page'] = page
                self.request.query_params._mutable = False

        return qs


class UnreadNotificationsList(ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Notification.objects.all()
    serializer_class = AllNotificationsListSerializer

    def get_queryset(self):
        return self.request.user.notifications.unread()


@login_required
def mark_all_as_read(request):
    request.user.notifications.mark_all_as_read()
    _next = request.GET.get('next')

    # if _next:
    #     return redirect(_next)
    return HttpResponse(status=200)


@login_required
def mark_as_read(request, pk=None):
    # what the hell is this.
    # notification_id = slug2id(slug)

    notification = get_object_or_404(
        Notification, recipient=request.user, id=pk)
    notification.mark_as_read()

    _next = request.GET.get('next')

    # if _next:
    #     return redirect(_next)

    return HttpResponse(status=200)  # redirect('notifications:unread')


@login_required
def mark_as_unread(request, pk=None):
    # notification_id = slug2id(slug)

    notification = get_object_or_404(
        Notification, recipient=request.user, id=pk)
    notification.mark_as_unread()

    _next = request.GET.get('next')

    if _next:
        return redirect(_next)

    return redirect('notifications:unread')


@login_required
def delete(request, pk=None):
    # notification_id = slug2id(slug)

    notification = get_object_or_404(
        Notification, recipient=request.user, id=pk)

    if settings.get_config()['SOFT_DELETE']:
        notification.deleted = True
        notification.save()
    else:
        notification.delete()

    _next = request.GET.get('next')

    if _next:
        return redirect(_next)

    return redirect('notifications:all')


@never_cache
def live_unread_notification_count(request):
    try:
        user_is_authenticated = request.user.is_authenticated()
    except TypeError:  # Django >= 1.11
        user_is_authenticated = request.user.is_authenticated

    if not user_is_authenticated:
        data = {
            'unread_count': 0
        }
    else:
        data = {
            'unread_count': request.user.notifications.unread().count(),
        }
    return JsonResponse(data)


@never_cache
def live_unread_notification_list(request):
    ''' Return a json with a unread notification list '''
    try:
        user_is_authenticated = request.user.is_authenticated()
    except TypeError:  # Django >= 1.11
        user_is_authenticated = request.user.is_authenticated

    if not user_is_authenticated:
        data = {
            'unread_count': 0,
            'unread_list': []
        }
        return JsonResponse(data)

    default_num_to_fetch = get_config()['NUM_TO_FETCH']
    try:
        # If they don't specify, make it 5.
        num_to_fetch = request.GET.get('max', default_num_to_fetch)
        num_to_fetch = int(num_to_fetch)
        if not (1 <= num_to_fetch <= 100):
            num_to_fetch = default_num_to_fetch
    except ValueError:  # If casting to an int fails.
        num_to_fetch = default_num_to_fetch

    unread_list = []

    for notification in request.user.notifications.unread()[0:num_to_fetch]:
        struct = model_to_dict(notification)
        struct['slug'] = id2slug(notification.id)
        if notification.actor:
            struct['actor'] = str(notification.actor)
        if notification.target:
            struct['target'] = str(notification.target)
        if notification.action_object:
            struct['action_object'] = str(notification.action_object)
        if notification.data:
            struct['data'] = notification.data
        unread_list.append(struct)
        if request.GET.get('mark_as_read'):
            notification.mark_as_read()
    data = {
        'unread_count': request.user.notifications.unread().count(),
        'unread_list': unread_list
    }
    return JsonResponse(data)


@never_cache
def live_all_notification_list(request):
    ''' Return a json with a unread notification list '''
    try:
        user_is_authenticated = request.user.is_authenticated()
    except TypeError:  # Django >= 1.11
        user_is_authenticated = request.user.is_authenticated

    if not user_is_authenticated:
        data = {
            'all_count': 0,
            'all_list': []
        }
        return JsonResponse(data)

    default_num_to_fetch = get_config()['NUM_TO_FETCH']
    try:
        # If they don't specify, make it 5.
        num_to_fetch = request.GET.get('max', default_num_to_fetch)
        num_to_fetch = int(num_to_fetch)
        if not (1 <= num_to_fetch <= 100):
            num_to_fetch = default_num_to_fetch
    except ValueError:  # If casting to an int fails.
        num_to_fetch = default_num_to_fetch

    all_list = []

    for notification in request.user.notifications.all()[0:num_to_fetch]:
        struct = model_to_dict(notification)
        struct['slug'] = id2slug(notification.id)
        if notification.actor:
            struct['actor'] = str(notification.actor)
        if notification.target:
            struct['target'] = str(notification.target)
        if notification.action_object:
            struct['action_object'] = str(notification.action_object)
        if notification.data:
            struct['data'] = notification.data
        all_list.append(struct)
        if request.GET.get('mark_as_read'):
            notification.mark_as_read()
    data = {
        'all_count': request.user.notifications.count(),
        'all_list': all_list
    }
    return JsonResponse(data)


def live_all_notification_count(request):
    try:
        user_is_authenticated = request.user.is_authenticated()
    except TypeError:  # Django >= 1.11
        user_is_authenticated = request.user.is_authenticated

    if not user_is_authenticated:
        data = {
            'all_count': 0
        }
    else:
        data = {
            'all_count': request.user.notifications.count(),
        }
    return JsonResponse(data)


class ContentTypeListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None
    queryset = ContentType.objects.filter(model__in=("sensor", "actuator", "manualtile", "automatictile"))
    serializer_class = ContentTypeListSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class NotificationManagerRetrieveView(mixins.RetrieveModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = NotificationManager.objects.all()
    serializer_class = NotificationManagerRetrieveSerializer
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class NotificationManagerCreateView(mixins.CreateModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = NotificationManager.objects.all()
    serializer_class = NotificationManagerCreateSerializer
    lookup_field = 'id'

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save()


class NotificationManagerUpdateView(mixins.UpdateModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = NotificationManager.objects.all()
    serializer_class = NotificationManagerCreateSerializer
    lookup_field = 'id'

    def patch(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)


class NotificationManagerListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None
    queryset = NotificationManager.objects.all()
    filter_backends = [IsOwnerFilterBackend]
    serializer_class = NotificationManagerListSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


@login_required
def follow_notification(request, pk=None):
    notification = get_object_or_404(NotificationManager, organization=request.user.organization, id=pk)
    follow(request.user, notification)
    return HttpResponse(status=200)


@login_required
def unfollow_notification(request, pk=None):
    notification = get_object_or_404(NotificationManager, organization=request.user.organization, id=pk)
    unfollow(request.user, notification)
    return HttpResponse(status=200)


class NotificationManagerDestroyView(mixins.DestroyModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)  # TODO add owner permissions to delete the notifications
    queryset = NotificationManager.objects.all()
    lookup_field = 'id'
    serializer_class = NotificationManagerUpdateSerializer

    def delete(self, request, *args, **kwargs):
        # with transaction.atomic():
        #     tile = get_object_or_404(Tile, id=kwargs.get('id'))
        #     Tile.objects.filter(order__gt=tile.).exclude(pk=kwargs.get('id')).update(order=F('order') - 1)
        return self.destroy(request, *args, **kwargs)
