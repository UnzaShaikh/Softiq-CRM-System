from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers

from user_profile.models import UserProfile

from .models import ProjectSettings, Role


User = get_user_model()


def _validate_timezone(value):
    """
    Accepts either an IANA timezone ("Asia/Karachi") or the frontend's
    display format ("(GMT+05:00) Asia/Karachi") and validates the zone part.

    Returns the original submitted value.
    """
    if not value:
        raise serializers.ValidationError("Timezone is required.")

    zone = (
        value.split(")", 1)[1].strip()
        if value.startswith("(") and ")" in value
        else value.strip()
    )

    try:
        ZoneInfo(zone)
    except ZoneInfoNotFoundError:
        raise serializers.ValidationError(
            f"Unsupported timezone: {value}"
        )

    return value


# ============================================================
# USER / AUTHENTICATION SERIALIZERS
# ============================================================


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
    )

    password2 = serializers.CharField(
        write_only=True,
        required=True,
    )

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "password2",
        )

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with that email already exists."
            )

        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {
                    "password2": "Password fields did not match."
                }
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")

        user = User.objects.create_user(
            **validated_data
        )

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "date_joined",
        )


class UserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,
        validators=[validate_password],
    )

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
        )

        extra_kwargs = {
            "username": {"required": False},
            "email": {"required": False},
        }

    def validate_email(self, value):
        user = self.context["request"].user

        if User.objects.exclude(pk=user.pk).filter(
            email=value
        ).exists():
            raise serializers.ValidationError(
                "A user with that email already exists."
            )

        return value

    def update(self, instance, validated_data):
        password = validated_data.pop(
            "password",
            None,
        )

        user = super().update(
            instance,
            validated_data,
        )

        if password:
            user.set_password(password)
            user.save()

        return user


class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,
        min_length=8,
    )

    role = serializers.CharField(
        source="profile.role",
        read_only=True,
    )

    role_id = serializers.IntegerField(
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "is_active",
            "date_joined",
            "role",
            "role_id",
        ]

        read_only_fields = [
            "id",
            "date_joined",
            "role",
        ]

    def validate_username(self, value):
        user = self.instance

        queryset = User.objects.filter(
            username__iexact=value
        )

        if user:
            queryset = queryset.exclude(
                pk=user.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "A user with this username already exists."
            )

        return value

    def validate_email(self, value):
        user = self.instance

        queryset = User.objects.filter(
            email__iexact=value
        )

        if user:
            queryset = queryset.exclude(
                pk=user.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def create(self, validated_data):
        password = validated_data.pop(
            "password",
            None,
        )

        role_id = validated_data.pop(
            "role_id",
            None,
        )

        if not password:
            raise serializers.ValidationError(
                {
                    "password": (
                        "Password is required when creating a user."
                    )
                }
            )

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        if role_id is not None:
            profile, _ = UserProfile.objects.get_or_create(
                user=user
            )

            profile.role = role_id
            profile.save()

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop(
            "password",
            None,
        )

        role_id = validated_data.pop(
            "role_id",
            None,
        )

        for attr, value in validated_data.items():
            setattr(
                instance,
                attr,
                value,
            )

        if password:
            instance.set_password(password)

        instance.save()

        if role_id is not None:
            profile, _ = UserProfile.objects.get_or_create(
                user=instance
            )

            profile.role = role_id
            profile.save()

        return instance


# ============================================================
# PROJECT SETTINGS SERIALIZERS
# ============================================================


class GeneralSettingsSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = ProjectSettings

        fields = [
            "project_name",
            "project_code",
            "project_description",
            "project_timezone",
            "logo_url",
        ]

        read_only_fields = [
            "logo_url"
        ]

    def get_logo_url(self, obj):
        request = self.context.get("request")

        if not obj.logo:
            return None

        url = obj.logo.url

        return (
            request.build_absolute_uri(url)
            if request
            else url
        )

    def validate_project_name(self, value):
        value = (value or "").strip()

        if not value:
            raise serializers.ValidationError(
                "Project name is required."
            )

        if len(value) > 150:
            raise serializers.ValidationError(
                "Project name must be 150 characters or fewer."
            )

        return value

    def validate_project_code(self, value):
        value = (value or "").strip().upper()

        if not value:
            raise serializers.ValidationError(
                "Project code is required."
            )

        import re

        if not re.fullmatch(
            r"[A-Z0-9_-]{1,20}",
            value,
        ):
            raise serializers.ValidationError(
                "Project code may only contain uppercase letters, "
                "numbers, hyphens and underscores (max 20 characters)."
            )

        qs = ProjectSettings.objects.filter(
            project_code=value
        )

        if self.instance:
            qs = qs.exclude(
                pk=self.instance.pk
            )

        if qs.exists():
            raise serializers.ValidationError(
                "This project code is already in use."
            )

        return value

    def validate_project_description(self, value):
        value = (value or "").strip()

        if len(value) > 1000:
            raise serializers.ValidationError(
                "Project description must be 1000 characters or fewer."
            )

        return value

    def validate_project_timezone(self, value):
        return _validate_timezone(value)


class CompanyInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectSettings

        fields = [
            "company_name",
            "website",
            "tagline",
            "industry",
            "address",
            "city",
            "state",
            "postal_code",
            "country",
            "phone",
            "email",
            "tax_number",
            "currency",
            "company_description",
        ]

    def validate_company_name(self, value):
        value = (value or "").strip()

        if not value:
            raise serializers.ValidationError(
                "Company name is required."
            )

        return value

    def validate_email(self, value):
        # EmailField already validates format;
        # empty stays allowed.
        return (value or "").strip()

    def validate_phone(self, value):
        value = (value or "").strip()

        import re

        if value and not re.fullmatch(
            r"\+?[0-9\s\-()]{7,30}",
            value,
        ):
            raise serializers.ValidationError(
                "Enter a valid phone number."
            )

        return value

    def validate_company_description(self, value):
        value = (value or "").strip()

        if len(value) > 500:
            raise serializers.ValidationError(
                "Company description must be 500 characters or fewer."
            )

        return value


class LocalizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectSettings

        fields = [
            "language",
            "region",
            "timezone",
            "week_starts_on",
            "fiscal_year_start",
            "date_format",
            "time_format",
            "datetime_format",
            "localization_currency",
            "currency_position",
            "decimal_separator",
            "thousands_separator",
            "decimal_places",
        ]

    def validate_timezone(self, value):
        return _validate_timezone(value)

    def validate_decimal_separator(self, value):
        if value not in (".", ","):
            raise serializers.ValidationError(
                "Decimal separator must be '.' or ','."
            )

        return value

    def validate_thousands_separator(self, value):
        if value not in (
            ",",
            ".",
            " ",
            "",
        ):
            raise serializers.ValidationError(
                "Thousands separator must be ',', '.', ' ' or empty."
            )

        return value

    def validate_decimal_places(self, value):
        if value > 6:
            raise serializers.ValidationError(
                "Decimal places must be between 0 and 6."
            )

        return value


class EmailSettingsSerializer(serializers.ModelSerializer):
    """
    SMTP password is write-only;
    the API only reports whether it is set.
    """

    has_smtp_password = serializers.SerializerMethodField()

    class Meta:
        model = ProjectSettings

        fields = [
            "from_name",
            "from_email",
            "reply_to_email",
            "email_signature",
            "smtp_host",
            "smtp_port",
            "smtp_encryption",
            "smtp_username",
            "smtp_password",
            "has_smtp_password",
            "enable_email_tracking",
            "enable_link_tracking",
            "log_emails_to_activity",
            "attach_email_signature",
        ]

        extra_kwargs = {
            "smtp_password": {
                "write_only": True
            },
        }

    def get_has_smtp_password(self, obj):
        return bool(obj.smtp_password)

    def validate_from_name(self, value):
        value = (value or "").strip()

        if not value:
            raise serializers.ValidationError(
                "From name is required."
            )

        return value

    def validate_from_email(self, value):
        value = (value or "").strip()

        if not value:
            raise serializers.ValidationError(
                "From email address is required."
            )

        return value

    def validate_smtp_host(self, value):
        value = (value or "").strip()

        if not value:
            raise serializers.ValidationError(
                "SMTP host is required."
            )

        return value

    def validate_smtp_port(self, value):
        if not (
            1 <= int(value) <= 65535
        ):
            raise serializers.ValidationError(
                "SMTP port must be between 1 and 65535."
            )

        return value

    def update(self, instance, validated_data):
        # Never overwrite an existing SMTP password
        # with an empty/placeholder value.
        password = validated_data.pop(
            "smtp_password",
            None,
        )

        instance = super().update(
            instance,
            validated_data,
        )

        if password:
            instance.smtp_password = password

            instance.save(
                update_fields=["smtp_password"]
            )

        elif (
            password is not None
            and not password
            and "smtp_password" in self.initial_data
        ):
            # Empty string sent explicitly:
            # keep stored password untouched.
            pass

        return instance


class SecuritySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectSettings

        fields = [
            "two_factor_auth",
            "login_notifications",
            "session_timeout",
            "max_login_attempts",
            "password_expiry_days",
            "require_uppercase",
            "require_numbers",
            "require_special_chars",
            "min_password_length",
            "ip_whitelist",
            "force_https",
            "audit_log",
        ]

    def validate_session_timeout(self, value):
        # 0 means "never expire"
        if value != 0 and not (
            5 <= int(value) <= 1440
        ):
            raise serializers.ValidationError(
                "Session timeout must be 0 (never) or between "
                "5 and 1440 minutes."
            )

        return value

    def validate_max_login_attempts(self, value):
        # 0 means unlimited attempts
        if value != 0 and not (
            3 <= int(value) <= 10
        ):
            raise serializers.ValidationError(
                "Maximum login attempts must be 0 (unlimited) "
                "or between 3 and 10."
            )

        return value

    def validate_password_expiry_days(self, value):
        if not (
            0 <= int(value) <= 365
        ):
            raise serializers.ValidationError(
                "Password expiry must be between 0 and 365 days."
            )

        return value

    def validate_min_password_length(self, value):
        if not (
            6 <= int(value) <= 64
        ):
            raise serializers.ValidationError(
                "Minimum password length must be between 6 and 64."
            )

        return value

    def validate_ip_whitelist(self, value):
        import re

        ip_pattern = re.compile(
            r"^(\d{1,3}\.){3}\d{1,3}(/\d{1,2})?$"
        )

        for part in [
            p.strip()
            for p in (value or "").split(",")
            if p.strip()
        ]:
            if not ip_pattern.match(part):
                raise serializers.ValidationError(
                    f"Invalid IP address or CIDR entry: '{part}'. "
                    "Separate multiple entries with commas."
                )

        return value or ""


class RoleSerializer(serializers.ModelSerializer):
    permissions = serializers.JSONField(
        required=False
    )

    users_assigned = serializers.IntegerField(
        read_only=True
    )

    class Meta:
        model = Role

        fields = [
            "id",
            "name",
            "description",
            "access_level",
            "color",
            "bg_color",
            "permissions",
            "is_system",
            "users_assigned",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "is_system",
            "created_at",
            "updated_at",
        ]

    def validate_name(self, value):
        value = (value or "").strip()

        if not value:
            raise serializers.ValidationError(
                "Role name is required."
            )

        qs = Role.objects.filter(
            name__iexact=value
        )

        if self.instance:
            qs = qs.exclude(
                pk=self.instance.pk
            )

        if qs.exists():
            raise serializers.ValidationError(
                "A role with this name already exists."
            )

        return value

    def validate_access_level(self, value):
        valid = [
            choice[0]
            for choice in Role.ACCESS_LEVELS
        ]

        if value not in valid:
            raise serializers.ValidationError(
                f"Access level must be one of: {valid}."
            )

        return value

    def validate_permissions(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "permissions must be an object keyed by module."
            )

        return Role().clean_permissions(value)

    def create(self, validated_data):
        validated_data["permissions"] = validated_data.get(
            "permissions",
            Role().clean_permissions({})
        )

        return super().create(
            validated_data
        )