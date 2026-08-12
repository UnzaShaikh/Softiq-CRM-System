from rest_framework import serializers
from .models import Note, NoteCategory


class NoteCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NoteCategory
        fields = ["id", "name", "created_by", "created_at"]
        read_only_fields = ["created_by", "created_at"]


class NoteSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, default=None)
    related_to = serializers.SerializerMethodField()
    related_type = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)
    tags = serializers.ListField(child=serializers.CharField(max_length=50), required=False)

    class Meta:
        model = Note
        fields = [
            "id", "title", "content",
            "category", "category_name",
            "tags", "pinned", "archived",
            "customer", "lead", "deal",
            "related_to", "related_type",
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

    def validate_tags(self, value):
        cleaned = [t.strip() for t in value if t.strip()]
        if len(cleaned) != len(set(cleaned)):
            raise serializers.ValidationError("Duplicate tags are not allowed.")
        return cleaned

    def validate(self, attrs):
        customer = attrs.get("customer", getattr(self.instance, "customer", None))
        lead = attrs.get("lead", getattr(self.instance, "lead", None))
        deal = attrs.get("deal", getattr(self.instance, "deal", None))
        linked = [customer, lead, deal]
        if sum(1 for x in linked if x) > 1:
            raise serializers.ValidationError(
                "Note can only be related to one of Customer, Lead, or Deal at a time."
            )
        return attrs