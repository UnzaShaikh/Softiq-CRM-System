from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from user_profile.models import NotificationSettings

from .models import Notification
from .serializers import (
    NotificationSerializer,
    NotificationSettingsSerializer,
)


class NotificationListView(APIView):
    """
    Return notifications belonging to the authenticated user.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(
            user=request.user
        ).order_by("-created_at")

        serializer = NotificationSerializer(
            notifications,
            many=True,
        )

        return Response(serializer.data)


class NotificationUnreadCountView(APIView):
    """
    Return the number of unread notifications for the authenticated user.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        unread_count = Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).count()

        return Response({
            "unread_count": unread_count,
        })


class NotificationMarkReadView(APIView):
    """
    Mark one notification as read.
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id,
                user=request.user,
            )
        except Notification.DoesNotExist:
            return Response(
                {"detail": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        notification.is_read = True
        notification.save(update_fields=["is_read"])

        serializer = NotificationSerializer(notification)

        return Response(serializer.data)


class NotificationMarkAllReadView(APIView):
    """
    Mark all notifications belonging to the authenticated user as read.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated_count = Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).update(is_read=True)

        return Response({
            "message": "All notifications marked as read.",
            "updated_count": updated_count,
        })


class NotificationSettingsView(APIView):
    """
    Get or update notification settings for the authenticated user.
    """

    permission_classes = [IsAuthenticated]

    def get_settings(self, user):
        settings, created = NotificationSettings.objects.get_or_create(
            user=user
        )

        return settings

    def get(self, request):
        settings = self.get_settings(request.user)

        serializer = NotificationSettingsSerializer(settings)

        return Response(serializer.data)

    def patch(self, request):
        settings = self.get_settings(request.user)

        serializer = NotificationSettingsSerializer(
            settings,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )