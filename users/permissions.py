from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    يسمح فقط للمسؤولين (Admin) بالوصول.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsManager(permissions.BasePermission):
    """
    يسمح للمدير (Branch Manager) والمسؤول (Admin).
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'manager']


class IsSupervisor(permissions.BasePermission):
    """
    يسمح للمشرفين، المديرين، والمسؤولين.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'manager', 'supervisor']


class IsInstitution(permissions.BasePermission):
    """
    يسمح لحسابات المؤسسات التدريبية فقط.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'institution'


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    يسمح للشخص بتعديل بياناته الخاصة فقط، أو القراءة فقط للآخرين.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj == request.user