import re
from django.db import models
from django.conf import settings
from django.core.validators import RegexValidator

phone_validator = RegexValidator(
    regex=r"^\+?[0-9\s\-()]{7,20}$",
    message="Enter a valid phone number.",
)


class UserProfile(models.Model):
    """Extends the built-in User model with CRM-specific profile fields."""

    LANGUAGE_CHOICES = [
        ("en", "English"),
        ("ne", "Nepali"),
        ("es", "Spanish"),
        ("fr", "French"),
    ]
    DATE_FORMAT_CHOICES = [
        ("MM/DD/YYYY", "MM/DD/YYYY"),
        ("DD/MM/YYYY", "DD/MM/YYYY"),
        ("YYYY-MM-DD", "YYYY-MM-DD"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    phone_number = models.CharField(
        max_length=20, blank=True, validators=[phone_validator]
    )
    role = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=150, blank=True)
    timezone = models.CharField(max_length=50, blank=True, default="UTC")
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default="en")
    date_format = models.CharField(max_length=20, choices=DATE_FORMAT_CHOICES, default="MM/DD/YYYY")
    about = models.TextField(blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile: {self.user.username}"


class UserPreferences(models.Model):
    THEME_CHOICES = [
        ("light", "Light"),
        ("dark", "Dark"),
        ("system", "System"),
    ]
    TIME_FORMAT_CHOICES = [
        ("12h", "12-hour"),
        ("24h", "24-hour"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="preferences"
    )
    timezone = models.CharField(max_length=50, blank=True, default="UTC")
    date_format = models.CharField(max_length=20, blank=True, default="MM/DD/YYYY")
    time_format = models.CharField(max_length=5, choices=TIME_FORMAT_CHOICES, default="12h")
    currency = models.CharField(max_length=10, blank=True, default="USD")
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default="system")
    items_per_page = models.PositiveIntegerField(default=25)
    compact_sidebar = models.BooleanField(default=False)
    sound_notifications = models.BooleanField(default=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferences: {self.user.username}"


class NotificationSettings(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notification_settings",
    )

    # Channel-level toggles
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    activity_notifications = models.BooleanField(default=True)
    slack_notifications = models.BooleanField(default=False)

    # CRM Event Notifications
    new_lead = models.BooleanField(default=True)
    deal_updates = models.BooleanField(default=True)
    lead_assigned = models.BooleanField(default=True)

    deal_created = models.BooleanField(default=True)
    deal_won = models.BooleanField(default=True)
    deal_lost = models.BooleanField(default=False)

    task_reminders = models.BooleanField(default=True)
    task_assigned = models.BooleanField(default=True)

    followup_due = models.BooleanField(default=True)
    customer_added = models.BooleanField(default=False)

    # System Notifications
    login_alert = models.BooleanField(default=True)
    backup_done = models.BooleanField(default=True)
    system_alerts = models.BooleanField(default=True)
    weekly_report = models.BooleanField(default=True)
    monthly_report = models.BooleanField(default=False)

    # Notification Digest
    digest_enabled = models.BooleanField(default=False)

    DIGEST_FREQUENCY_CHOICES = [
        ("daily", "Daily"),
        ("weekly", "Weekly"),
        ("every_4_hours", "Every 4 hours"),
    ]

    digest_frequency = models.CharField(
        max_length=20,
        choices=DIGEST_FREQUENCY_CHOICES,
        default="daily",
    )

    # Quiet Hours
    quiet_hours_enabled = models.BooleanField(default=False)

    quiet_start = models.TimeField(
        null=True,
        blank=True,
    )

    quiet_end = models.TimeField(
        null=True,
        blank=True,
    )

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Notification Settings: {self.user.username}"


class ActivityLog(models.Model):
    ACTIVITY_TYPE_CHOICES = [
        ("login", "Login"),
        ("logout", "Logout"),
        ("profile_update", "Profile Update"),
        ("password_change", "Password Change"),
        ("preferences_update", "Preferences Update"),
        ("notification_update", "Notification Settings Update"),
        ("record_created", "Record Created"),
        ("record_updated", "Record Updated"),
        ("record_deleted", "Record Deleted"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="activity_logs"
    )
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPE_CHOICES, default="other")
    description = models.CharField(max_length=500, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["user", "-timestamp"]),
            models.Index(fields=["activity_type"]),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.get_activity_type_display()} - {self.timestamp}"

    @staticmethod
    def log(user, activity_type, description="", request=None):
        """Convenience helper to create an activity log entry, optionally pulling IP from request."""
        ip = None
        if request is not None:
            xff = request.META.get("HTTP_X_FORWARDED_FOR")
            ip = xff.split(",")[0].strip() if xff else request.META.get("REMOTE_ADDR")
        return ActivityLog.objects.create(
            user=user, activity_type=activity_type, description=description, ip_address=ip
        )