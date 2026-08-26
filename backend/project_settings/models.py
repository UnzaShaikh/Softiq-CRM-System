from django.db import models


def project_logo_upload_to(instance, filename):
    return "project_logos/{filename}".format(filename=filename)


class ProjectSettings(models.Model):
    """
    Singleton model holding all Project Settings configuration
    (General, Company, Localization, Email and Security sections).
    """

    # ---------- General ----------
    TIME_FORMAT_CHOICES = [
        ("12 Hour (AM/PM)", "12 Hour (AM/PM)"),
        ("24 Hour", "24 Hour"),
    ]
    CURRENCY_CHOICES = [
        ("PKR - Pakistani Rupee (Rs.)", "PKR - Pakistani Rupee (Rs.)"),
        ("USD - US Dollar ($)", "USD - US Dollar ($)"),
        ("EUR - Euro (€)", "EUR - Euro (€)"),
        ("GBP - British Pound (£)", "GBP - British Pound (£)"),
        ("AED - UAE Dirham (د.إ)", "AED - UAE Dirham (د.إ)"),
    ]
    WEEK_START_CHOICES = [
        ("Monday", "Monday"),
        ("Sunday", "Sunday"),
        ("Saturday", "Saturday"),
    ]
    DATE_FORMAT_CHOICES = [
        ("MM/DD/YYYY", "MM/DD/YYYY"),
        ("DD/MM/YYYY", "DD/MM/YYYY"),
        ("YYYY-MM-DD", "YYYY-MM-DD"),
    ]

    project_name = models.CharField(max_length=150, blank=True, default="")
    project_code = models.CharField(max_length=20, blank=True, default="", db_index=True)
    project_description = models.TextField(blank=True, default="", max_length=1000)
    project_timezone = models.CharField(max_length=100, blank=True, default="UTC")
    logo = models.FileField(upload_to=project_logo_upload_to, null=True, blank=True)
    logo_uploaded_at = models.DateTimeField(null=True, blank=True)

    # ---------- Company Information ----------
    company_name = models.CharField(max_length=255, blank=True, default="")
    website = models.URLField(blank=True, default="")
    tagline = models.CharField(max_length=255, blank=True, default="")
    industry = models.CharField(max_length=150, blank=True, default="")
    address = models.TextField(blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    state = models.CharField(max_length=100, blank=True, default="")
    postal_code = models.CharField(max_length=20, blank=True, default="")
    country = models.CharField(max_length=100, blank=True, default="")
    phone = models.CharField(max_length=30, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    tax_number = models.CharField(max_length=50, blank=True, default="")
    currency = models.CharField(
        max_length=50, choices=CURRENCY_CHOICES,
        blank=True, default="PKR - Pakistani Rupee (Rs.)",
    )
    company_description = models.TextField(blank=True, default="", max_length=500)

    # ---------- Localization ----------
    language = models.CharField(max_length=50, blank=True, default="English (en)")
    region = models.CharField(max_length=100, blank=True, default="Pakistan")
    timezone = models.CharField(max_length=100, blank=True, default="(GMT+05:00) Asia/Karachi")
    week_starts_on = models.CharField(
        max_length=10, choices=WEEK_START_CHOICES, default="Monday"
    )
    fiscal_year_start = models.CharField(max_length=20, blank=True, default="January")
    date_format = models.CharField(
        max_length=20, choices=DATE_FORMAT_CHOICES, default="DD/MM/YYYY"
    )
    time_format = models.CharField(
        max_length=20, choices=TIME_FORMAT_CHOICES, default="12 Hour (AM/PM)"
    )
    datetime_format = models.CharField(
        max_length=40, blank=True, default="DD/MM/YYYY hh:mm A"
    )
    localization_currency = models.CharField(
        max_length=50, choices=CURRENCY_CHOICES,
        blank=True, default="PKR - Pakistani Rupee (Rs.)",
    )
    currency_position = models.CharField(
        max_length=50, blank=True, default="Before Amount (Rs. 1,234.56)"
    )
    decimal_separator = models.CharField(max_length=1, blank=True, default=".")
    thousands_separator = models.CharField(max_length=1, blank=True, default=",")
    decimal_places = models.PositiveSmallIntegerField(default=2)

    # ---------- Email Settings ----------
    from_name = models.CharField(max_length=150, blank=True, default="")
    from_email = models.EmailField(blank=True, default="")
    reply_to_email = models.EmailField(blank=True, default="")
    email_signature = models.TextField(blank=True, default="", max_length=2000)
    smtp_host = models.CharField(max_length=255, blank=True, default="")
    smtp_port = models.PositiveIntegerField(default=587)
    SMTP_ENCRYPTION_CHOICES = [
        ("STARTTLS", "STARTTLS"),
        ("SSL/TLS", "SSL/TLS"),
        ("None", "None"),
    ]
    smtp_encryption = models.CharField(
        max_length=20, choices=SMTP_ENCRYPTION_CHOICES, default="STARTTLS"
    )
    smtp_username = models.CharField(max_length=255, blank=True, default="")
    smtp_password = models.CharField(max_length=255, blank=True, default="")

    enable_email_tracking = models.BooleanField(default=True)
    enable_link_tracking = models.BooleanField(default=True)
    log_emails_to_activity = models.BooleanField(default=False)
    attach_email_signature = models.BooleanField(default=True)

    # ---------- Security ----------
    two_factor_auth = models.BooleanField(default=False)
    login_notifications = models.BooleanField(default=True)
    session_timeout = models.PositiveIntegerField(default=30)
    max_login_attempts = models.PositiveIntegerField(default=5)
    password_expiry_days = models.PositiveIntegerField(default=90)
    require_uppercase = models.BooleanField(default=True)
    require_numbers = models.BooleanField(default=True)
    require_special_chars = models.BooleanField(default=False)
    min_password_length = models.PositiveSmallIntegerField(default=8)
    ip_whitelist = models.TextField(blank=True, default="")
    force_https = models.BooleanField(default=True)
    audit_log = models.BooleanField(default=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Project Settings"
        verbose_name_plural = "Project Settings"

    def __str__(self):
        return self.project_name or "Project Settings"

    @classmethod
    def load(cls):
        """Return the single settings row, creating it if missing."""
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class Role(models.Model):
    """CRM role with per-module view/create/edit/delete permissions."""

    ACCESS_LEVELS = [
        ("full", "Full system access"),
        ("team", "Manage team and data"),
        ("sales", "Manage leads, opportunities, and deals"),
        ("view", "View-only access"),
        ("custom", "Custom access"),
    ]

    MODULES = [
        "dashboard",
        "customers",
        "contacts",
        "leads",
        "opportunities",
        "deals",
        "activities",
        "companies",
        "notes",
        "followups",
        "tasks",
        "email_templates",
        "reports",
        "settings",
    ]
    ACTIONS = ["view", "create", "edit", "delete"]

    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True, default="")
    access_level = models.CharField(
        max_length=20, choices=ACCESS_LEVELS, default="custom"
    )
    color = models.CharField(max_length=20, blank=True, default="#4f46e5")
    bg_color = models.CharField(max_length=20, blank=True, default="#eef2ff")
    permissions = models.JSONField(default=dict, blank=True)
    is_system = models.BooleanField(default=False)
    users_assigned = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return self.name

    def clean_permissions(self, raw):
        """
        Normalize/validate a submitted permissions payload.
        Unknown modules/actions are dropped; values coerced to bool.
        Raises ValueError if the payload shape is invalid.
        """
        if not isinstance(raw, dict):
            raise ValueError("permissions must be an object keyed by module.")
        cleaned = {}
        for module in self.MODULES:
            module_perms = raw.get(module, {})
            if module_perms is None:
                module_perms = {}
            if not isinstance(module_perms, dict):
                raise ValueError(f"Permissions for '{module}' must be an object.")
            cleaned[module] = {
                action: bool(module_perms.get(action, False))
                for action in self.ACTIONS
            }
        return cleaned

    def save(self, *args, **kwargs):
        if not isinstance(self.permissions, dict):
            raise ValueError("permissions must be an object keyed by module.")
        self.permissions = {
            m: {a: bool(self.permissions.get(m, {}).get(a, False))
                for a in self.ACTIONS}
            for m in self.MODULES
        }
        super().save(*args, **kwargs)
