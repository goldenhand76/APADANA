from django.urls import re_path
from notifications.consumers import NotificationConsumer

notification_route = [
    re_path(r'ws/notification/(?P<token>\w.*)/$', NotificationConsumer.as_asgi()),
]
