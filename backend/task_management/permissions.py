from rest_framework import permissions


class IsTaskOwnerOrAdmin(permissions.BasePermission):
    """
    Allows access to admin/staff users, the task's assignee, or the user
    who created the task.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.assignee == request.user or obj.created_by == request.user