from django.core.mail import get_connection, send_mail
from rest_framework import status, viewsets, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import HasRolePermission
from .models import ProjectSettings, Role
from .serializers import (
    CompanyInfoSerializer,
    EmailSettingsSerializer,
    GeneralSettingsSerializer,
    LocalizationSerializer,
    RoleSerializer,
    SecuritySettingsSerializer,
)

# Allowed logo types / max size (2 MB)
ALLOWED_LOGO_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"}
MAX_LOGO_SIZE = 2 * 1024 * 1024


class SettingsAPIView(APIView):
    """Base class providing the shared ProjectSettings singleton row."""

    permission_classes = [IsAuthenticated]
    serializer_class = None

    def get_settings(self):
        return ProjectSettings.load()

    def get(self, request, *args, **kwargs):
        serializer = self.serializer_class(self.get_settings(), context={"request": request})
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        settings_obj = self.get_settings()
        serializer = self.serializer_class(
            settings_obj, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ---------- General ----------

class GeneralSettingsView(SettingsAPIView):
    serializer_class = GeneralSettingsSerializer


class ProjectLogoView(APIView):
    """
    Upload (POST) or remove (DELETE) the project logo.
    POST accepts multipart/form-data with a "logo" file field.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        settings_obj = ProjectSettings.load()
        file = request.FILES.get("logo")

        if not file:
            return Response(
                {"logo": "No logo file was provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if getattr(file, "content_type", "") not in ALLOWED_LOGO_TYPES:
            return Response(
                {"logo": "Unsupported file type. Allowed: PNG, JPG, WEBP or SVG."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if file.size > MAX_LOGO_SIZE:
            return Response(
                {"logo": "Logo file must be 2MB or smaller."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Replacing an existing logo deletes the old file first.
        if settings_obj.logo:
            settings_obj.logo.delete(save=False)

        from django.utils import timezone

        settings_obj.logo = file
        settings_obj.logo_uploaded_at = timezone.now()
        settings_obj.save(update_fields=["logo", "logo_uploaded_at", "updated_at"])

        serializer = GeneralSettingsSerializer(settings_obj, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        settings_obj = ProjectSettings.load()
        if settings_obj.logo:
            settings_obj.logo.delete(save=False)
            settings_obj.logo = None
            settings_obj.save(update_fields=["logo", "updated_at"])
        serializer = GeneralSettingsSerializer(settings_obj, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


# ---------- Company ----------

class CompanyInfoView(SettingsAPIView):
    serializer_class = CompanyInfoSerializer


# ---------- Localization ----------

class LocalizationView(SettingsAPIView):
    serializer_class = LocalizationSerializer


# ---------- Email ----------

class EmailSettingsView(SettingsAPIView):
    serializer_class = EmailSettingsSerializer


class SendTestEmailView(APIView):
    """Sends a test email using the SMTP configuration saved in Email Settings."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        recipient = (request.data.get("email") or "").strip()
        if not recipient:
            return Response(
                {"email": "Enter an email address."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cfg = ProjectSettings.load()
        if not cfg.smtp_host:
            return Response(
                {"detail": "SMTP host is not configured. Save your email settings first."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not cfg.from_email:
            return Response(
                {"detail": "From email address is not configured."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        encryption_map = {
            "SSL/TLS": ("ssl", 465),
            "STARTTLS": ("tls", int(cfg.smtp_port or 587)),
            "None": (None, int(cfg.smtp_port or 25)),
        }
        security, default_port = encryption_map.get(cfg.smtp_encryption, ("tls", 587))

        subject = "Softiq CRM - Test Email"
        message = (
            f"This is a test email sent from Softiq CRM.\n\n"
            f"If you received this message, your email configuration is working correctly."
        )

        try:
            connection = get_connection(
                host=cfg.smtp_host,
                port=int(cfg.smtp_port or default_port),
                username=cfg.smtp_username or None,
                password=cfg.smtp_password or None,
                use_ssl=(security == "ssl"),
                use_tls=(security == "tls"),
                fail_silently=False,
            )
            send_mail(
                subject=subject,
                message=message,
                from_email=cfg.from_email,
                recipient_list=[recipient],
                connection=connection,
            )
        except Exception as exc:
            return Response(
                {"detail": f"Failed to send test email: {exc}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({"detail": f"Test email sent successfully to {recipient}."})


# ---------- Security ----------

class SecuritySettingsView(SettingsAPIView):
    serializer_class = SecuritySettingsSerializer


# ---------- Roles & Permissions ----------

def _default_permissions(view=False, create=False, edit=False, delete=False,
                        overrides=None):
    perms = {m: {"view": view, "create": create, "edit": edit, "delete": delete}
             for m in Role.MODULES}
    for module, actions in (overrides or {}).items():
        perms[module] = {**perms[module], **actions}
    return perms


DEFAULT_ROLES = [
    {
        "name": "Administrator",
        "description": "Full system access",
        "access_level": "full",
        "color": "#4f46e5",
        "bg_color": "#eef2ff",
        "is_system": True,
        "permissions": _default_permissions(True, True, True, True),
    },
    {
        "name": "Manager",
        "description": "Manage team and data",
        "access_level": "team",
        "color": "#0891b2",
        "bg_color": "#ecfeff",
        "is_system": True,
        "permissions": _default_permissions(
            True, True, True, False,
            {"settings": {"view": False, "create": False, "edit": False, "delete": False}},
        ),
    },
    {
        "name": "Sales Representative",
        "description": "Manage leads and deals",
        "access_level": "sales",
        "color": "#16a34a",
        "bg_color": "#f0fdf4",
        "is_system": False,
        "permissions": _default_permissions(
            False, False, False, False,
            {
                m: {"view": True, "create": True, "edit": True}
                for m in ("leads", "opportunities", "deals", "customers", "contacts", "activities")
            }
            | {
                "dashboard": {"view": True},
                "reports": {"view": True},
            },
        ),
    },
    {
        "name": "Viewer",
        "description": "View only access",
        "access_level": "view",
        "color": "#d97706",
        "bg_color": "#fefce8",
        "is_system": True,
        "permissions": _default_permissions(
            True, False, False, False,
            {"settings": {"view": False, "create": False, "edit": False, "delete": False}},
        ),
    },
]


class RoleViewSet(viewsets.ModelViewSet):
    """CRUD for CRM roles including per-module permissions."""

    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [HasRolePermission]
    permission_module = "settings"

    def get_queryset(self):
        # Seed the standard system roles once so a fresh install has defaults.
        if not Role.objects.exists():
            Role.objects.bulk_create([Role(**r) for r in DEFAULT_ROLES])
        return Role.objects.all().order_by("created_at")

    def list(self, request, *args, **kwargs):
        """Return all roles in one response to avoid client-side pagination waterfalls."""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "count": queryset.count(),
            "next": None,
            "previous": None,
            "results": serializer.data,
        })

    def destroy(self, request, *args, **kwargs):
        role = self.get_object()
        if role.is_system:
            return Response(
                {"detail": "System roles cannot be deleted."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import viewsets, permissions

from .serializers import RegisterSerializer, UserSerializer, UserUpdateSerializer, AdminUserSerializer

User = get_user_model()


# ---------- Permissions endpoint ----------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_permissions_view(request):
    """
    Return the logged-in user's resolved permission matrix.
    """
    user = request.user
    role_name = None
    permissions_data = {}
    is_staff = getattr(user, "is_staff", False)

    try:
        profile = user.profile
        role_id = getattr(profile, "role", None)
        if role_id:
            from project_settings.models import Role

            role = Role.objects.get(pk=int(role_id))
            role_name = role.name
            permissions_data = role.permissions
    except Exception:
        pass

    return Response({
        "role": role_name,
        "permissions": permissions_data,
        "is_staff": is_staff,
    })


# ---------- Registration ----------
@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    """
    Register a new user.
    Expects: username, email, password, password2 (and optional first_name, last_name)
    Returns: user data + JWT tokens (access & refresh)
    """
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        },
        status=status.HTTP_201_CREATED,
    )


# ---------- Email‑based login (instead of username) ----------
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer that looks up the user by email instead of username.
    The frontend sends the email in the 'username' field.
    """
    def validate(self, attrs):
        email = attrs.get("username")  # frontend sends email as "username"
        try:
            user = User.objects.get(email=email)
            attrs["username"] = user.username   # replace with the actual username
        except User.DoesNotExist:
            pass   # let default validation fail with "No active account found"
        return super().validate(attrs)


class EmailTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view that accepts an email in the 'username' field.
    Use this instead of the default TokenObtainPairView.
    """
    serializer_class = EmailTokenObtainPairSerializer


# ---------- User self‑management (from upstream) ----------
@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def me_view(request):
    user = request.user

    if request.method == "GET":
        data = UserSerializer(user).data
        # Enrich with role and staff status
        data["is_staff"] = getattr(user, "is_staff", False)
        try:
            profile = user.profile
            role_id = getattr(profile, "role", None)
            if role_id:
                from project_settings.models import Role
                role = Role.objects.get(pk=int(role_id))
                data["role"] = role.name
                data["role_id"] = role.id
        except Exception:
            pass
        return Response(data)

    if request.method == "DELETE":
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = UserUpdateSerializer(
        user,
        data=request.data,
        partial=True,
        context={"request": request},
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(UserSerializer(user).data)
class AdminUserPagination(PageNumberPagination):
    """Small, predictable pages for the Admin Users table."""

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Admin-only user management API.

    The list endpoint is paginated so the frontend never has to download
    every user before rendering the first page.
    """

    queryset = User.objects.select_related("profile").all().order_by("-date_joined")
    serializer_class = AdminUserSerializer
    pagination_class = AdminUserPagination
    filter_backends = [filters.SearchFilter]

    permission_classes = [
        permissions.IsAuthenticated,
        permissions.IsAdminUser,
    ]

    search_fields = [
        "username",
        "email",
        "first_name",
        "last_name",
    ]

    def get_queryset(self):
        queryset = super().get_queryset()

        is_active = self.request.query_params.get("is_active")

        if is_active in ["true", "false"]:
            queryset = queryset.filter(is_active=is_active == "true")

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Global counts are returned once so the frontend does not need
        # separate requests or all user records just to calculate them.
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()

        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)

        response = self.get_paginated_response(serializer.data)
        response.data["total_users"] = total_users
        response.data["active_users"] = active_users
        response.data["inactive_users"] = inactive_users
        return response
