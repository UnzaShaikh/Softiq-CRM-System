from datetime import datetime, date
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import FollowUp

User = get_user_model()


class FollowUpSerializer(serializers.ModelSerializer):
    related_to = serializers.SerializerMethodField()
    related_type = serializers.SerializerMethodField()
    company_name = serializers.CharField(source="company.name", read_only=True, default=None)
    assigned_to_name = serializers.CharField(source="assigned_to.username", read_only=True, default=None)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True, default=None)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = FollowUp
        fields = [
            "id", "followup_id",
            "subject", "notes",
            "customer", "lead", "deal", "related_to", "related_type",
            "company", "company_name",
            "type", "priority", "status", "is_overdue",
            "due_date", "due_time",
            "assigned_to", "assigned_to_name",
            "created_by", "created_by_name",
            "created_at", "updated_at",
        ]
        read_only_fields = ["followup_id", "created_by", "created_at", "updated_at"]

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

    def get_is_overdue(self, obj):
        if obj.status in ("completed", "cancelled"):
            return False
        if not obj.due_date:
            return False
        now = datetime.now()
        if obj.due_time:
            due_dt = datetime.combine(obj.due_date, obj.due_time)
            return due_dt < now
        return obj.due_date < date.today()

    def validate_subject(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Subject cannot be empty.")
        return value

    def validate_due_date(self, value):
        if value is None:
            raise serializers.ValidationError("Due date is required.")
        return value

    def validate_assigned_to(self, value):
        if value is not None and not User.objects.filter(pk=value.pk).exists():
            raise serializers.ValidationError("Assigned user does not exist.")
        return value

    def validate(self, attrs):
        customer = attrs.get("customer", getattr(self.instance, "customer", None))
        lead = attrs.get("lead", getattr(self.instance, "lead", None))
        deal = attrs.get("deal", getattr(self.instance, "deal", None))
        linked = [customer, lead, deal]
        if sum(1 for x in linked if x) > 1:
            raise serializers.ValidationError(
                "Follow-up can only be related to one of Customer, Lead, or Deal at a time."
            )
        return attrs