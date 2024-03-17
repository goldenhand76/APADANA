from django.urls import path
from history.views import HistoryView

urlpatterns = [
    path('', HistoryView.as_view(), name='history-data'),
]
