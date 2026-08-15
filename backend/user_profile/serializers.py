import re
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from .models import UserProfile, UserPreferences, NotificationSettings, ActivityLog

User = get_user_model()

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ProfileSerializer(serializers.ModelSerializer):
    # Pulled from the User model, editable through this serializer
    first_name = serializers.CharField(source="user.first_name", required=False, allow_blank=True)
    last_name = serializers.CharField(source="user.last_name", required=False, allow_blank=True)
    email = serializers.EmailField(source="user.email", required=False)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "username", "first_name", "last_name", "email",
            "phone_number", "role", "department", "location",
            "timezone", "language", "date_format", "about",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]

    def validate_email(self, value):
        # Note: DRF nested source fields don't auto-route validate_email;
        # kept here for clarity, uniqueness enforced in validate() below instead.
        return value

    def validate(self, attrs):
        user_data = attrs.get("user", {})
        email = user_data.get("email")
        if email:
            if not EMAIL_REGEX.match(email):
                raise serializers.ValidationError({"email": "Enter a valid email address."})
            existing = User.objects.filter(email__iexact=email).exclude(pk=self.instance.user.pk)
            if existing.exists():
                raise serializers.ValidationError({"email": "This email is already in use."})
        return attrs

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        user = instance.user
        for field in ("first_name", "last_name", "email"):
            if field in user_data:
                setattr(user, field, user_data[field])
        user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        if attrs["current_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                {"new_password": "New password must be different from current password."}
            )
        user = self.context["request"].user
        try:
            validate_password(attrs["new_password"], user=user)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"new_password": list(e.messages)})
        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = [
            "timezone", "date_format", "time_format", "currency",
            "theme", "items_per_page", "compact_sidebar", "sound_notifications",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]

    def validate_items_per_page(self, value):
        if value < 5 or value > 200:
            raise serializers.ValidationError("Items per page must be between 5 and 200.")
        return value


class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = [
            "email_notifications", "push_notifications", "sms_notifications",
            "activity_notifications",
            "new_lead", "deal_updates", "task_reminders", "weekly_report", "system_alerts",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]


class ActivityLogSerializer(serializers.ModelSerializer):
    activity_type_display = serializers.CharField(source="get_activity_type_display", read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            "id", "activity_type", "activity_type_display", "description",
            "ip_address", "timestamp",
        ]