from django.urls import path
from device.views import TypeListView, SensorListView, ActuatorListView

urlpatterns = [
    path('types/', TypeListView.as_view(), name='list-type'),
    path('sensors/', SensorListView.as_view(), name='list-sensor'),
    path('actuators/', ActuatorListView.as_view(), name='list-actuator')
]
