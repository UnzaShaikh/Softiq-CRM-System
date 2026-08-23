from datetime import date

from followups.models import FollowUp
from user_profile.models import NotificationSettings

from .models import Notification


NOTIFICATION_PREFERENCE_MAP = {
    "new_lead": "new_lead",
    "lead_assigned": "lead_assigned",
    "task_due": "task_reminders",
    "task_assigned": "task_assigned",
    "followup_due": "followup_due",
    "customer_added": "customer_added",
    "activity": "activity_notifications",
    "login_alert": "login_alert",
    "backup_done": "backup_done",
    "system_error": "system_alerts",
    "weekly_report": "weekly_report",
    "monthly_report": "monthly_report",
}


def create_notification(
    user,
    title,
    message,
    notification_type="system_error",
    source_type=None,
    source_id=None,
):
    """
    Create a notification for a specific user.

    The user's notification settings are checked before creating
    the notification. If the corresponding notification preference
    is disabled, no notification is created.

    source_type and source_id identify the CRM object that generated
    the notification.
    """

    if not user:
        return None

    settings, _ = NotificationSettings.objects.get_or_create(
        user=user
    )

    preference_field = NOTIFICATION_PREFERENCE_MAP.get(
        notification_type
    )

    if (
        preference_field
        and not getattr(settings, preference_field, True)
    ):
        return None

    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        source_type=source_type,
        source_id=source_id,
    )

    return notification


def create_due_followup_notifications():
    """
    Create notifications for Follow-ups that are due today.

    Only upcoming Follow-ups with an assigned user are considered.
    Duplicate notifications for the same Follow-up are prevented.
    """

    today = date.today()

    followups = FollowUp.objects.filter(
        due_date=today,
        status="upcoming",
        assigned_to__isnull=False,
    )

    created_count = 0

    for followup in followups:

        already_exists = Notification.objects.filter(
            user=followup.assigned_to,
            notification_type="followup_due",
            source_type="followup",
            source_id=followup.id,
        ).exists()

        if already_exists:
            continue

        notification = create_notification(
            user=followup.assigned_to,
            title="Follow-up Due",
            message=(
                f'Your follow-up "{followup.subject}" '
                f"is due today."
            ),
            notification_type="followup_due",
            source_type="followup",
            source_id=followup.id,
        )

        if notification:
            created_count += 1

    return created_count