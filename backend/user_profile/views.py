import csv
from django.http import HttpResponse
from django.utils.dateparse import parse_date
from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend

from .models import UserProfile, UserPreferences, NotificationSettings, ActivityLog
from .serializers import (
    ProfileSerializer,
    ChangePasswordSerializer,
    UserPreferencesSerializer,
    NotificationSettingsSerializer,
    ActivityLogSerializer,
)


def _get_or_create(model, user):
    obj, _ = model.objects.get_or_create(user=user)
    return obj


# ---------- Profile ----------

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    def get_object(self):
        return _get_or_create(UserProfile, self.request.user)

    def perform_update(self, serializer):
        serializer.save()
        ActivityLog.log(
            self.request.user, "profile_update", "Profile information updated.", self.request
        )


# ---------- Change Password ----------

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        ActivityLog.log(request.user, "password_change", "Password changed.", request)
        return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)


# ---------- Preferences ----------

class UserPreferencesView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserPreferencesSerializer

    def get_object(self):
        return _get_or_create(UserPreferences, self.request.user)

    def perform_update(self, serializer):
        serializer.save()
        ActivityLog.log(
            self.request.user, "preferences_update", "Preferences updated.", self.request
        )


# ---------- Notification Settings ----------

class NotificationSettingsView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSettingsSerializer

    def get_object(self):
        return _get_or_create(NotificationSettings, self.request.user)

    def perform_update(self, serializer):
        serializer.save()
        ActivityLog.log(
            self.request.user, "notification_update", "Notification settings updated.", self.request
        )


# ---------- Activity Log ----------

class ActivityLogPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class ActivityLogListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ActivityLogSerializer
    pagination_class = ActivityLogPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ["description", "activity_type"]

    def get_queryset(self):
        qs = ActivityLog.objects.filter(user=self.request.user)

        activity_type = self.request.query_params.get("activity_type")
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if activity_type:
            qs = qs.filter(activity_type=activity_type)
        if start_date:
            parsed = parse_date(start_date)
            if parsed:
                qs = qs.filter(timestamp__date__gte=parsed)
        if end_date:
            parsed = parse_date(end_date)
            if parsed:
                qs = qs.filter(timestamp__date__lte=parsed)

        return qs


class ActivityLogExportView(APIView):
    """Exports the current user's activity log as CSV."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = ActivityLog.objects.filter(user=request.user)

        activity_type = request.query_params.get("activity_type")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        if activity_type:
            qs = qs.filter(activity_type=activity_type)
        if start_date:
            parsed = parse_date(start_date)
            if parsed:
                qs = qs.filter(timestamp__date__gte=parsed)
        if end_date:
            parsed = parse_date(end_date)
            if parsed:
                qs = qs.filter(timestamp__date__lte=parsed)

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="activity_log.csv"'
        writer = csv.writer(response)
        writer.writerow(["Activity Type", "Description", "IP Address", "Timestamp"])
        for log in qs:
            writer.writerow([
                log.get_activity_type_display(), log.description,
                log.ip_address or "", log.timestamp.isoformat(),
            ])
        return response


class ActivityLogSummaryView(APIView):
    """Summary stats for the Activity tab (counts by type, total, last 7/30 days)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Count

        qs = ActivityLog.objects.filter(user=request.user)
        now = timezone.now()

        by_type = list(qs.values("activity_type").annotate(count=Count("id")).order_by("-count"))

        return Response({
            "total": qs.count(),
            "last_7_days": qs.filter(timestamp__gte=now - timedelta(days=7)).count(),
            "last_30_days": qs.filter(timestamp__gte=now - timedelta(days=30)).count(),
            "by_type": by_type,
        })