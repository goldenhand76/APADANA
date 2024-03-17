''' Django notification urls file '''
# -*- coding: utf-8 -*-
from distutils.version import StrictVersion  # pylint: disable=no-name-in-module,import-error
from django import get_version
from . import views
from django.urls import path
from notifications.views import NotificationManagerListView, NotificationManagerUpdateView, ContentTypeListView, \
    NotificationManagerCreateView, follow_notification, unfollow_notification, NotificationManagerDestroyView, \
    NotificationManagerRetrieveView

if StrictVersion(get_version()) >= StrictVersion('2.0'):
    from django.urls import re_path as pattern
else:
    from django.conf.urls import url as pattern

urlpatterns = [
    path('', views.AllNotificationsList.as_view(), name='all'),
    path('unread/', views.UnreadNotificationsList.as_view(), name='unread'),
    path('mark-all-as-read/', views.mark_all_as_read, name='mark_all_as_read'),
    path('mark-as-read/<int:pk>/', views.mark_as_read, name='mark_as_read'),
    path('mark-as-unread/<int:pk>/', views.mark_as_unread, name='mark_as_unread'),
    path('delete/<int:pk>/', views.delete, name='delete'),
    path('unread_count/', views.live_unread_notification_count, name='live_unread_notification_count'),
    path('all_count/', views.live_all_notification_count, name='live_all_notification_count'),
    # pattern(r'^api/unread_list/$', views.live_unread_notification_list, name='live_unread_notification_list'),
    # pattern(r'^api/all_list/', views.live_all_notification_list, name='live_all_notification_list'),

    path('manager/content-types/', ContentTypeListView.as_view(), name='list-content-types'),
    path('manager/', NotificationManagerListView.as_view(), name='list-notification-manager'),
    path('manager/add', NotificationManagerCreateView.as_view(), name='create-notification'),
    path('manager/<int:id>/', NotificationManagerRetrieveView.as_view(), name='retrieve-notification-manager'),
    path('manager/<int:id>/edit', NotificationManagerUpdateView.as_view(), name='edit-notification-manager'),
    path('manager/<int:id>/delete', NotificationManagerDestroyView.as_view(), name='delete-notification-manager'),
    path('manager/<int:pk>/follow', follow_notification, name='follow-notification'),
    path('manager/<int:pk>/unfollow', unfollow_notification, name='unfollow-notification'),
]

app_name = 'notifications'
