from django.urls import path
from .views import (
    ProfileView,
    ChangePasswordView,
    UserPreferencesView,
    NotificationSettingsView,
    ActivityLogListView,
    ActivityLogExportView,
    ActivityLogSummaryView,
)

urlpatterns = [
    path("profile/", ProfileView.as_view(), name="profile"),
    path("profile/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("profile/preferences/", UserPreferencesView.as_view(), name="preferences"),
    path("profile/notifications/", NotificationSettingsView.as_view(), name="notification-settings"),
    path("profile/activity/", ActivityLogListView.as_view(), name="activity-log"),
    path("profile/activity/export/", ActivityLogExportView.as_view(), name="activity-log-export"),
    path("profile/activity/summary/", ActivityLogSummaryView.as_view(), name="activity-log-summary"),
]