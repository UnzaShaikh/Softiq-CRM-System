from rest_framework import serializers

from .models import Notification
from user_profile.models import NotificationSettings


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "notification_type",
            "title",
            "message",
            "is_read",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "notification_type",
            "title",
            "message",
            "created_at",
        ]


class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = [
            # Channels
            "email_notifications",
            "push_notifications",
            "sms_notifications",
            "activity_notifications",
            "slack_notifications",

            # CRM events
            "new_lead",
            "lead_assigned",
            "deal_updates",
            "deal_created",
            "deal_won",
            "deal_lost",
            "task_reminders",
            "task_assigned",
            "followup_due",
            "customer_added",

            # System notifications
            "login_alert",
            "backup_done",
            "system_alerts",
            "weekly_report",
            "monthly_report",

            # Digest
            "digest_enabled",
            "digest_frequency",

            # Quiet hours
            "quiet_hours_enabled",
            "quiet_start",
            "quiet_end",

            "updated_at",
        ]
        read_only_fields = ["updated_at"]