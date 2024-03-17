from rest_framework.permissions import BasePermission
from django.contrib.auth import get_user_model
from accounting.exceptions import ServiceUnavailable

User = get_user_model()


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_admin)


class LimitedSubUser(BasePermission):
    def has_permission(self, request, view):
        return bool(len(User.objects.filter(organization=request.user.organization)) > 5)
