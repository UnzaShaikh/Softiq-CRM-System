from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone

from activities.models import Activity
from notifications.models import Notification
from notifications.services import create_due_followup_notifications


def create_due_activity_notifications():
    """
    Create in-app notifications for activities that are due today or overdue.

    Only scheduled/overdue activities with an assigned user are considered.
    The source reference prevents the same activity from generating duplicate
    notifications when this management command is run repeatedly.
    """
    today = timezone.localdate()

    activities = Activity.objects.filter(
        assigned_to__isnull=False
    ).filter(
        Q(status="overdue")
        | Q(status="scheduled", date__lte=today)
    )

    created_count = 0

    for activity in activities:
        if Notification.objects.filter(
            user=activity.assigned_to,
            notification_type="task_due",
            source_type="activity",
            source_id=activity.id,
        ).exists():
            continue

        if activity.date < today or activity.status == "overdue":
            title = "Activity Overdue"
            message = f"Your activity '{activity.title}' is overdue."
        else:
            title = "Activity Due"
            message = f"Your activity '{activity.title}' is due today."

        Notification.objects.create(
            user=activity.assigned_to,
            title=title,
            message=message,
            notification_type="task_due",
            source_type="activity",
            source_id=activity.id,
        )
        created_count += 1

    return created_count


class Command(BaseCommand):
    help = "Create notifications for Follow-ups and Activities that are due."

    def handle(self, *args, **options):
        followup_count = create_due_followup_notifications()
        activity_count = create_due_activity_notifications()
        total_count = followup_count + activity_count

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {followup_count} due Follow-up notification(s), "
                f"{activity_count} due Activity notification(s). "
                f"Total: {total_count}."
            )
        )