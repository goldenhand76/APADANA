from django.urls import path
from activity.views import ActivityStreamListView

urlpatterns = [
    path('', ActivityStreamListView.as_view(), name='list-activity'),
]
