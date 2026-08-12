from django.db import models
from django.conf import settings


class NoteCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="note_categories"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Note categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Note(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    category = models.ForeignKey(
        NoteCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="notes"
    )
    tags = models.JSONField(default=list, blank=True)  # e.g. ["urgent", "follow-up"]

    pinned = models.BooleanField(default=False)
    archived = models.BooleanField(default=False)

    # Optional association with CRM records — mutually exclusive, same pattern as Activity
    customer = models.ForeignKey(
        "customers.Customer", on_delete=models.CASCADE, null=True, blank=True, related_name="notes"
    )
    lead = models.ForeignKey(
        "leads.Lead", on_delete=models.CASCADE, null=True, blank=True, related_name="notes"
    )
    deal = models.ForeignKey(
        "deals.Deal", on_delete=models.CASCADE, null=True, blank=True, related_name="related_notes"
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="notes"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-pinned", "-created_at"]

    def __str__(self):
        return self.title