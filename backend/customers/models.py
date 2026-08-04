from django.db import models


class Customer(models.Model):
    STATUS_CHOICES = [
        ("lead", "Lead"),
        ("active", "Active"),
        ("inactive", "Inactive"),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    company = models.CharField(max_length=150, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="lead",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
