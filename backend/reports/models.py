from django.db import models
from django.contrib.auth import get_user_model


User = get_user_model()


class Report(models.Model):

    TYPE_CHOICES = [
        ("sales", "Sales"),
        ("pipeline", "Pipeline"),
        ("activity", "Activity"),
        ("customer", "Customer"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("generated", "Generated"),
        ("scheduled", "Scheduled"),
        ("failed", "Failed"),
    ]

    name = models.CharField(max_length=255)

    report_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="generated",
    )

    generated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="generated_reports",
    )

    generated_at = models.DateTimeField(
        auto_now_add=True
    )

    views = models.PositiveIntegerField(
        default=0
    )

    last_viewed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    # Optional JSON data for storing generated report configuration/results.
    data = models.JSONField(
        default=dict,
        blank=True,
    )

    class Meta:
        ordering = ["-generated_at"]

    def __str__(self):
        return self.name