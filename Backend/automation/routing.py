from django.urls import re_path
from automation.consumers import AutomationConsumer

# test.angizehco.com/api/monitoring/tabs/1/

automation_route = [
    re_path(r'ws/automation/(?P<token>\w.*)/$', AutomationConsumer.as_asgi()),
]
