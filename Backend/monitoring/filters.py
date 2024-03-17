from rest_framework import filters
from monitoring.models import Tab
from django.shortcuts import get_object_or_404
import logging

logger = logging.getLogger('django')


class IsOwnerFilterBackend(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        return queryset.filter(field=request.user.organization)


class TabFilterBackend(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        tab = get_object_or_404(Tab, id=view.kwargs.get('id'))
        return queryset.filter(tab=tab)
