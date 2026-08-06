from django.db import models
from django.contrib.auth import get_user_model
from customers.models import Customer

User = get_user_model()


class Deal(models.Model):

    STAGE_CHOICES = [
        ("lead", "Lead"),
        ("qualified", "Qualified"),
        ("proposal", "Proposal"),
        ("negotiation", "Negotiation"),
        ("closed_won", "Closed Won"),
        ("closed_lost", "Closed Lost"),
    ]

    name = models.CharField(max_length=255)

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="deals"
    )

    value = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    stage = models.CharField(
        max_length=30,
        choices=STAGE_CHOICES,
        default="lead"
    )

    expected_close_date = models.DateField()

    probability = models.PositiveIntegerField(default=50)

    notes = models.TextField(blank=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_deals"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name
