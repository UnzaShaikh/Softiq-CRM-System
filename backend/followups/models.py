from django.db import models
from django.conf import settings
from django.db import transaction


class FollowUp(models.Model):
    TYPE_CHOICES = [
        ("call", "Call"),
        ("email", "Email"),
        ("meeting", "Meeting"),
        ("task", "Task"),
        ("follow_up", "Follow-up"),
    ]

    PRIORITY_CHOICES = [
        ("high", "High"),
        ("medium", "Medium"),
        ("low", "Low"),
    ]

    STATUS_CHOICES = [
        ("upcoming", "Upcoming"),
        ("completed", "Completed"),
        ("overdue", "Overdue"),
        ("cancelled", "Cancelled"),
    ]

    followup_id = models.CharField(max_length=20, unique=True, editable=False)

    subject = models.CharField(max_length=255)
    notes = models.TextField(blank=True)

    # Related To — mutually exclusive, same pattern as Activity/Note
    customer = models.ForeignKey(
        "customers.Customer", on_delete=models.CASCADE, null=True, blank=True,
        related_name="followups"
    )
    lead = models.ForeignKey(
        "leads.Lead", on_delete=models.CASCADE, null=True, blank=True,
        related_name="followups"
    )
    deal = models.ForeignKey(
        "deals.Deal", on_delete=models.CASCADE, null=True, blank=True,
        related_name="followups"
    )

    company = models.ForeignKey(
        "companies.Company", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="followups"
    )

    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="medium")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="upcoming")

    due_date = models.DateField()
    due_time = models.TimeField(null=True, blank=True)

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="assigned_followups"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="created_followups"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["due_date", "due_time"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["due_date"]),
            models.Index(fields=["assigned_to"]),
        ]

    def __str__(self):
        return f"{self.followup_id} - {self.subject}"

    def save(self, *args, **kwargs):
        if not self.followup_id:
            with transaction.atomic():
                last = FollowUp.objects.select_for_update().order_by("-id").first()
                next_num = (last.id + 1) if last else 1
                candidate = f"FU{next_num:03d}"
                while FollowUp.objects.filter(followup_id=candidate).exists():
                    next_num += 1
                    candidate = f"FU{next_num:03d}"
                self.followup_id = candidate
        super().save(*args, **kwargs)