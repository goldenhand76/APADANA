from rest_framework import filters
from device.models import Type


class IsOwnerFilterBackend(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        return queryset.filter(organization=request.user.organization)


class HasType(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        return queryset.filter(sensor__organization=request.user.organization).order_by('title').distinct('title')
