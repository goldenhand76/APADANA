from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_admin)


class TabOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.organization == obj.field


class TileOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.organization == obj.tab.field
