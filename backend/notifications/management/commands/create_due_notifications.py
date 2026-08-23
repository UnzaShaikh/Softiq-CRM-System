from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone

from activities.models import Activity
from notifications.models import Notification
from notifications.services import (
    create_due_followup_notifications,
    create_notification,
)
from task_management.models import Task


def create_due_activity_notifications():
    """
    Create in-app notifications for activities that are due today or overdue.

    Only scheduled/overdue activities with an assigned user are considered.
    Duplicate notifications for the same activity are prevented.
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

        if (
            activity.date < today
            or activity.status == "overdue"
        ):
            title = "Activity Overdue"
            message = (
                f"Your activity '{activity.title}' "
                f"is overdue."
            )
        else:
            title = "Activity Due"
            message = (
                f"Your activity '{activity.title}' "
                f"is due today."
            )

        # IMPORTANT:
        # Always use create_notification() so the user's
        # activity/task reminder preference is respected.
        notification = create_notification(
            user=activity.assigned_to,
            title=title,
            message=message,
            notification_type="task_due",
            source_type="activity",
            source_id=activity.id,
        )

        if notification:
            created_count += 1

    return created_count


def create_due_task_notifications():
    """
    Create in-app notifications for assigned Tasks.

    Handles:
    - Task reminders
    - Tasks due now
    - Tasks that are overdue

    Completed and cancelled tasks are ignored.

    Duplicate notifications are prevented separately
    for reminder, due, and overdue events.
    """

    now = timezone.now()

    tasks = Task.objects.filter(
        assignee__isnull=False,
    ).exclude(
        status__in=[
            "completed",
            "cancelled",
        ],
    ).filter(
        Q(
            due_date__isnull=False,
            due_date__lte=now,
        )
        |
        Q(
            reminder__isnull=False,
            reminder__lte=now,
        )
    )

    created_count = 0

    for task in tasks:

        # =====================================================
        # OVERDUE
        # =====================================================

        if (
            task.due_date
            and task.due_date < now
        ):
            title = "Task Overdue"

            message = (
                f'Your task "{task.title}" '
                f"is overdue."
            )

            notification_exists = Notification.objects.filter(
                user=task.assignee,
                notification_type="task_due",
                source_type="task",
                source_id=task.id,
                title="Task Overdue",
            ).exists()

            if notification_exists:
                continue

            notification = create_notification(
                user=task.assignee,
                title=title,
                message=message,
                notification_type="task_due",
                source_type="task",
                source_id=task.id,
            )

            if notification:
                created_count += 1

            continue

        # =====================================================
        # REMINDER
        # =====================================================

        if (
            task.reminder
            and task.reminder <= now
            and (
                not task.due_date
                or task.reminder < task.due_date
            )
        ):
            title = "Task Reminder"

            message = (
                f'Reminder: your task '
                f'"{task.title}" is coming due.'
            )

            notification_exists = Notification.objects.filter(
                user=task.assignee,
                notification_type="task_due",
                source_type="task",
                source_id=task.id,
                title="Task Reminder",
            ).exists()

            if not notification_exists:

                notification = create_notification(
                    user=task.assignee,
                    title=title,
                    message=message,
                    notification_type="task_due",
                    source_type="task",
                    source_id=task.id,
                )

                if notification:
                    created_count += 1

        # =====================================================
        # DUE
        # =====================================================

        if (
            task.due_date
            and task.due_date <= now
        ):
            title = "Task Due"

            message = (
                f'Your task "{task.title}" '
                f"is due."
            )

            notification_exists = Notification.objects.filter(
                user=task.assignee,
                notification_type="task_due",
                source_type="task",
                source_id=task.id,
                title="Task Due",
            ).exists()

            if notification_exists:
                continue

            notification = create_notification(
                user=task.assignee,
                title=title,
                message=message,
                notification_type="task_due",
                source_type="task",
                source_id=task.id,
            )

            if notification:
                created_count += 1

    return created_count


class Command(BaseCommand):
    help = (
        "Create notifications for Tasks, "
        "Follow-ups, and Activities that are due."
    )

    def handle(self, *args, **options):

        followup_count = (
            create_due_followup_notifications()
        )

        activity_count = (
            create_due_activity_notifications()
        )

        task_count = (
            create_due_task_notifications()
        )

        total_count = (
            followup_count
            + activity_count
            + task_count
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Created "
                f"{followup_count} due Follow-up "
                f"notification(s), "
                f"{activity_count} due Activity "
                f"notification(s), "
                f"{task_count} due Task "
                f"notification(s). "
                f"Total: {total_count}."
            )
        )