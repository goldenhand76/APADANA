from rest_framework import filters
import logging

logger = logging.getLogger('django')


class IsOwnerFilterBackend(filters.BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        return queryset.filter(field=request.user.organization).order_by('id')
