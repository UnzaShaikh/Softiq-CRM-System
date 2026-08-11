from django.db import models
from django.contrib.auth import get_user_model
from customers.models import Customer
from leads.models import Lead
from deals.models import Deal  # confirm actual app/model name matches your codebase

User = get_user_model()


class Activity(models.Model):
    TYPE_CHOICES = [
        ("call", "Call"),
        ("meeting", "Meeting"),
        ("email", "Email"),
        ("task", "Task"),
        ("follow_up", "Follow-up"),
    ]
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("overdue", "Overdue"),
    ]
    PRIORITY_CHOICES = [
        ("high", "High"),
        ("medium", "Medium"),
        ("low", "Low"),
    ]

    title = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="scheduled")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="medium")

    date = models.DateField()
    time = models.TimeField()
    duration = models.PositiveIntegerField(help_text="Duration in minutes")

    assigned_to = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_activities"
    )

    # Related-to: mirrors dashboard.Activity's pattern of separate nullable FKs
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name="activities")
    lead = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True, related_name="activities")
    deal = models.ForeignKey(Deal, on_delete=models.SET_NULL, null=True, blank=True, related_name="activities")

    description = models.TextField(blank=True)
    location = models.CharField(max_length=150, blank=True)

    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="created_activities"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-time"]
        verbose_name_plural = "activities"

    def __str__(self):
        return f"{self.title} ({self.get_type_display()})"

    def clean(self):
        from django.core.exceptions import ValidationError
        linked = [self.customer_id, self.lead_id, self.deal_id]
        if sum(1 for x in linked if x) > 1:
            raise ValidationError("Activity can only be related to one of Customer, Lead, or Deal at a time.")