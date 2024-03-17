from django.urls import re_path
from activity.consumers import ActivityConsumer

activity_route = [
    re_path(r'ws/activity/(?P<token>\w.*)/$', ActivityConsumer.as_asgi()),
]
