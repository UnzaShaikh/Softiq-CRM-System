import re
from django.db import models
from django.conf import settings

SUPPORTED_VARIABLES = [
    "company_name",
    "contact_name",
    "first_name",
    "last_name",
    "email",
    "date",
]

VARIABLE_PATTERN = re.compile(r"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}")


class EmailTemplateManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)


class EmailTemplate(models.Model):
    CATEGORY_CHOICES = [
        ("onboarding", "Onboarding"),
        ("follow_up", "Follow-up"),
        ("proposal", "Proposal"),
        ("thank_you", "Thank You"),
        ("general", "General"),
        ("newsletter", "Newsletter"),
        ("support", "Support"),
    ]

    TEMPLATE_TYPE_CHOICES = [
        ("public", "Public"),
        ("private", "Private"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
    ]

    name = models.CharField(max_length=255)
    subject = models.CharField(max_length=500)
    content = models.TextField()
    description = models.CharField(max_length=1000, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="general")
    template_type = models.CharField(max_length=10, choices=TEMPLATE_TYPE_CHOICES, default="private")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")
    language = models.CharField(max_length=50, blank=True, default="en")

    is_deleted = models.BooleanField(default=False)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="email_templates"
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="updated_email_templates"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = EmailTemplateManager()      # excludes soft-deleted by default
    all_objects = models.Manager()        # includes soft-deleted, for admin/ownership checks

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["category"]),
            models.Index(fields=["status"]),
            models.Index(fields=["template_type"]),
        ]

    def __str__(self):
        return self.name

    @property
    def variables_used(self):
        return sorted(set(VARIABLE_PATTERN.findall(self.content or "")))

    def render_preview(self, sample_values=None):
        """Return content with variables substituted for preview only — never persisted."""
        defaults = {
            "first_name": "John",
            "last_name": "Doe",
            "company_name": "Softiq Tech",
            "contact_name": "Ahmed",
            "email": "john.doe@example.com",
            "date": "2026-08-14",
        }
        values = {**defaults, **(sample_values or {})}

        def replace(match):
            key = match.group(1)
            return str(values.get(key, match.group(0)))

        return VARIABLE_PATTERN.sub(replace, self.content or "")


class TemplateActivity(models.Model):
    ACTION_CHOICES = [
        ("created", "Template Created"),
        ("updated", "Template Updated"),
        ("duplicated", "Template Duplicated"),
        ("status_changed", "Template Status Changed"),
        ("deleted", "Template Deleted"),
    ]

    template = models.ForeignKey(
        EmailTemplate, on_delete=models.CASCADE, related_name="activities"
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    detail = models.CharField(max_length=500, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.get_action_display()} - {self.template_id}"