"""
ASGI config for Angizeh_2 project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/howto/deployment/asgi/
"""

import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Angizeh_2.settings')
from django.core.asgi import get_asgi_application

wsgi_handler = get_asgi_application()

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from monitoring.routing import dashboard_route, monitoring_route
from notifications.routing import notification_route
from activity.routing import activity_route
from device.consumers import MyMqttConsumer
from automation.routing import automation_route

application = ProtocolTypeRouter({
    "http": wsgi_handler,
    "websocket": AuthMiddlewareStack(
        URLRouter(dashboard_route + monitoring_route + automation_route),  # notification_route + activity_route
    ),
    'mqtt': MyMqttConsumer.as_asgi(),
})
