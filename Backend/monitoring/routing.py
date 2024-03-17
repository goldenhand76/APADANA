from django.urls import re_path
from monitoring.consumers import DashboardConsumer, MonitoringConsumer

# test.angizehco.com/api/monitoring/tabs/1/

dashboard_route = [
    re_path(r'ws/dashboard/(?P<token>\w.*)/$', DashboardConsumer.as_asgi()),
]

monitoring_route = [
    re_path(r'ws/monitoring/(?P<token>\w.*)/$', MonitoringConsumer.as_asgi()),
]