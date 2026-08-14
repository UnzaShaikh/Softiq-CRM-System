from rest_framework import serializers
from .models import EmailTemplate, TemplateActivity


class TemplateActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True, default=None)
    action_display = serializers.CharField(source="get_action_display", read_only=True)

    class Meta:
        model = TemplateActivity
        fields = ["id", "action", "action_display", "user", "user_name", "detail", "timestamp"]


class EmailTemplateListSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = [
            "id", "name", "subject", "category", "status", "template_type", "updated_at",
        ]


class EmailTemplateDetailSerializer(serializers.ModelSerializer):
    variables_used = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(source="created_by.username", read_only=True, default=None)
    updated_by_name = serializers.CharField(source="updated_by.username", read_only=True, default=None)

    class Meta:
        model = EmailTemplate
        fields = [
            "id", "name", "subject", "content", "description",
            "category", "template_type", "status", "language",
            "variables_used",
            "created_by", "created_by_name",
            "updated_by", "updated_by_name",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_by", "updated_by", "created_at", "updated_at"]


class EmailTemplateWriteSerializer(serializers.ModelSerializer):
    variables_used = serializers.ReadOnlyField()

    class Meta:
        model = EmailTemplate
        fields = [
            "id", "name", "subject", "content", "description",
            "category", "template_type", "status", "language",
            "variables_used",
        ]
        read_only_fields = ["id"]

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Template name cannot be empty.")
        if len(value) > 255:
            raise serializers.ValidationError("Template name is too long.")
        return value

    def validate_subject(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Subject cannot be empty.")
        return value

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Email content cannot be empty.")
        return value

    def validate_description(self, value):
        if value and len(value) > 1000:
            raise serializers.ValidationError("Description is too long.")
        return value


class TemplatePreviewSerializer(serializers.Serializer):
    sample_values = serializers.DictField(child=serializers.CharField(), required=False)