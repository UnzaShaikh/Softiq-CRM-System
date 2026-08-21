from datetime import date

from followups.models import FollowUp

from .models import Notification


def create_notification(
    user,
    title,
    message,
    notification_type="system",
    source_type=None,
    source_id=None,
):
    """
    Create a notification for a specific user.

    source_type and source_id identify the CRM object
    that generated the notification.
    """

    if not user:
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

        create_notification(
            user=followup.assigned_to,
            title="Follow-up Due",
            message=f'Your follow-up "{followup.subject}" is due today.',
            notification_type="followup_due",
            source_type="followup",
            source_id=followup.id,
        )

        created_count += 1

    return created_count