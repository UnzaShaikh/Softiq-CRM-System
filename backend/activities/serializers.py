from rest_framework import serializers
from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    related_to = serializers.SerializerMethodField()
    related_type = serializers.SerializerMethodField()
    assigned_to_name = serializers.CharField(source="assigned_to.username", read_only=True)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = Activity
        fields = [
            "id", "title", "type", "status", "priority",
            "date", "time", "duration",
            "assigned_to", "assigned_to_name",
            "customer", "lead", "deal",
            "related_to", "related_type",
            "description", "location",
            "created_by", "created_by_name",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def get_related_to(self, obj):
        if obj.customer:
            return f"{obj.customer.first_name} {obj.customer.last_name}"
        if obj.lead:
            return f"{obj.lead.first_name} {obj.lead.last_name}"
        if obj.deal:
            return obj.deal.name
        return None

    def get_related_type(self, obj):
        if obj.customer:
            return "Customer"
        if obj.lead:
            return "Lead"
        if obj.deal:
            return "Deal"
        return None

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title cannot be empty.")
        return value

    def validate_duration(self, value):
        if value <= 0:
            raise serializers.ValidationError("Duration must be greater than 0 minutes.")
        return value

    def validate(self, attrs):
        customer = attrs.get("customer", getattr(self.instance, "customer", None))
        lead = attrs.get("lead", getattr(self.instance, "lead", None))
        deal = attrs.get("deal", getattr(self.instance, "deal", None))
        linked = [customer, lead, deal]
        if sum(1 for x in linked if x) > 1:
            raise serializers.ValidationError(
                "Activity can only be related to one of Customer, Lead, or Deal at a time."
            )
        return attrs


class ActivityStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ["status"]

    def validate_status(self, value):
        valid = dict(Activity.STATUS_CHOICES)
        if value not in valid:
            raise serializers.ValidationError(f"Status must be one of {list(valid.keys())}.")
        return value