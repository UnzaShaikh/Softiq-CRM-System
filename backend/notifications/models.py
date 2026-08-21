from django.conf import settings
from django.db import models


class Notification(models.Model):
    """
    Represents an individual in-app notification for a user.
    """

    TYPE_CHOICES = [
        ("new_lead", "New Lead"),
        ("lead_assigned", "Lead Assigned"),
        ("deal_created", "Deal Created"),
        ("deal_won", "Deal Won"),
        ("deal_lost", "Deal Lost"),
        ("task_due", "Task Due"),
        ("task_assigned", "Task Assigned"),
        ("followup_due", "Follow-up Due"),
        ("customer_added", "Customer Added"),
        ("opportunity_created", "Opportunity Created"),
        ("login_alert", "Login Alert"),
        ("backup_done", "Backup Completed"),
        ("system_error", "System Error"),
        ("weekly_report", "Weekly Report"),
        ("monthly_report", "Monthly Report"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    notification_type = models.CharField(
        max_length=30,
        choices=TYPE_CHOICES,
    )

    title = models.CharField(
        max_length=255,
    )

    message = models.TextField()

    is_read = models.BooleanField(
        default=False,
    )

    # Generic reference to the object that generated the notification.
    # Example:
    # source_type = "followup"
    # source_id = 5
    source_type = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    source_id = models.PositiveIntegerField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]

        indexes = [
            models.Index(
                fields=["user", "is_read"],
                name="notif_user_read_idx",
            ),
            models.Index(
                fields=["user", "-created_at"],
                name="notif_user_created_idx",
            ),
            models.Index(
                fields=["source_type", "source_id"],
                name="notif_source_idx",
            ),
        ]

    def __str__(self):
        return f"{self.title} - {self.user}"