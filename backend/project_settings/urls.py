from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CompanyInfoView,
    EmailSettingsView,
    GeneralSettingsView,
    LocalizationView,
    ProjectLogoView,
    RoleViewSet,
    SecuritySettingsView,
    SendTestEmailView,
)

router = DefaultRouter()
router.register(r"roles", RoleViewSet, basename="roles")

urlpatterns = [
    path("settings/project/general/", GeneralSettingsView.as_view(), name="general-settings"),
    path("settings/project/general/logo/", ProjectLogoView.as_view(), name="project-logo"),
    path("settings/project/company/", CompanyInfoView.as_view(), name="company-info"),
    path("settings/project/localization/", LocalizationView.as_view(), name="localization-settings"),
    path("settings/project/email/", EmailSettingsView.as_view(), name="email-settings"),
    path("settings/project/email/test/", SendTestEmailView.as_view(), name="send-test-email"),
    path("settings/project/security/", SecuritySettingsView.as_view(), name="security-settings"),
    path("settings/", include(router.urls)),
]
