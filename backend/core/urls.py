"""
URL configuration for core project.
"""

from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)

from users.views import (
    me_view,
    register_view,
)

from users.authentication import (
    EmailTokenObtainPairView,
)


urlpatterns = [
    path(
        "admin/",
        admin.site.urls,
    ),

    # =========================================================
    # JWT Authentication
    # =========================================================

    path(
        "api/auth/login/",
        EmailTokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),

    path(
        "api/auth/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

    path(
        "api/auth/verify/",
        TokenVerifyView.as_view(),
        name="token_verify",
    ),

    path(
        "api/auth/register/",
        register_view,
        name="register",
    ),

    # =========================================================
    # Users
    # =========================================================

    # Current logged-in user
    path(
        "api/users/me/",
        me_view,
        name="me",
    ),

    # Admin user management
    path(
        "api/users/",
        include("users.urls"),
    ),

    # =========================================================
    # Dashboard
    # =========================================================

    path(
        "api/",
        include("dashboard.urls"),
    ),

    # =========================================================
    # Customers
    # =========================================================

    path(
        "api/",
        include("customers.urls"),
    ),

    # =========================================================
    # Leads
    # =========================================================

    path(
        "api/",
        include("leads.urls"),
    ),

    # =========================================================
    # Deals
    # =========================================================

    path(
        "api/deals/",
        include("deals.urls"),
    ),

    # =========================================================
    # Opportunities
    # =========================================================

    path(
        "api/",
        include("opportunities.urls"),
    ),

    # =========================================================
    # Contacts
    # =========================================================

    path(
        "api/",
        include("contacts.urls"),
    ),

    # =========================================================
    # Companies
    # =========================================================

    path(
        "api/",
        include("companies.urls"),
    ),

    # =========================================================
    # Activities
    # =========================================================

    path(
        "api/",
        include("activities.urls"),
    ),

    # =========================================================
    # Notes
    # =========================================================

    path(
        "api/",
        include("notes.urls"),
    ),

    # =========================================================
    # Follow-ups
    # =========================================================

    path(
        "api/",
        include("followups.urls"),
    ),

    # =========================================================
    # Email Templates
    # =========================================================

    path(
        "api/",
        include("email_templates.urls"),
    ),

    # =========================================================
    # User Profile
    # =========================================================

    path(
        "api/",
        include("user_profile.urls"),
    ),

    # =========================================================
    # Tasks
    # =========================================================

    path(
        "api/",
        include("task_management.urls"),
    ),

    # =========================================================
    # Pipeline
    # =========================================================

    path(
        "api/",
        include("pipeline.urls"),
    ),

    # =========================================================
    # Global Search
    # =========================================================

    path(
        "api/",
        include("search.urls"),
    ),

    # =========================================================
    # Notifications
    # =========================================================

    path(
        "api/",
        include("notifications.urls"),
    ),

    # =========================================================
    # Project Settings
    # General / Company / Localization /
    # Email / Security / Roles
    # =========================================================

    path(
        "api/",
        include("project_settings.urls"),
    ),
]


# =============================================================
# Media files during development
# =============================================================

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )