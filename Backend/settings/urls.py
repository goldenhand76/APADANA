from django.urls import path
from settings.views import AutomationBoxView, ManageDeviceListView, ManageDeviceUpdateView, \
    ManageNotificationView, ManageSensorView, ManageActuatorView

urlpatterns = [
    path('automation/', AutomationBoxView.as_view(), name='automation-box'),
    path('manage-devices/', ManageDeviceListView.as_view(), name='manage-device-box'),
    path('manage-devices/sensor/<int:id>', ManageSensorView.as_view(), name='get-sensor'),
    path('manage-devices/actuator/<int:id>', ManageActuatorView.as_view(), name='get-actuator'),
    path('manage-devices/add-sensor', ManageDeviceUpdateView.as_view(), name='add-device'),
    path('notification/type/', ManageNotificationView.as_view(), name='notification-type'),
]
