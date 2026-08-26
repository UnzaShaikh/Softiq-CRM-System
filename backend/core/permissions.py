from rest_framework.permissions import BasePermission


# Map HTTP methods → required permission actions
_METHOD_ACTION_MAP = {
    "GET": "view",
    "HEAD": "view",
    "OPTIONS": "view",
    "POST": "create",
    "PUT": "edit",
    "PATCH": "edit",
    "DELETE": "delete",
}


class HasRolePermission(BasePermission):
    """
    Role-based permission class.

    Reads the user's ``UserProfile.role`` (a CharField storing the Role PK
    as a string), resolves it to a ``project_settings.Role`` object, and
    checks ``Role.permissions[module][action]``.

    Each ViewSet must declare ``permission_module = "<module>"``.

    Django ``is_staff`` users bypass all checks.
    """

    def has_permission(self, request, view):
        # Admin / staff users always pass
        if getattr(request.user, "is_staff", False):
            return True

        module = getattr(view, "permission_module", None)
        if module is None:
            # No module declared → default to allow (backward compat)
            return True

        action = _METHOD_ACTION_MAP.get(request.method, "view")

        perms = self._resolve_permissions(request.user)
        if perms is None:
            # No role assigned → deny
            return False

        module_perms = perms.get(module, {})
        return bool(module_perms.get(action, False))

    @staticmethod
    def _resolve_permissions(user):
        """
        Fetch the Role permissions dict for the given user.

        Returns the permissions dict or None if the user has no valid role.
        """
        try:
            profile = user.profile
        except Exception:
            return None

        role_id = getattr(profile, "role", None)
        if not role_id:
            return None

        try:
            from project_settings.models import Role

            role = Role.objects.get(pk=int(role_id))
            return role.permissions
        except (Role.DoesNotExist, ValueError, TypeError):
            return None
