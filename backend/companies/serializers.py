from rest_framework import serializers
from .models import Company
from contacts.models import Contact

# Adjust this import to match your actual deals/pipeline app + model name
from deals.models import Deal


class CompanySerializer(serializers.ModelSerializer):
    contacts_count = serializers.SerializerMethodField()
    deals_count = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = Company
        fields = [
            "id", "name", "industry", "website", "phone", "email",
            "address", "size", "status", "description",
            "contacts_count", "deals_count",
            "created_by", "created_by_name", "created_at", "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def get_contacts_count(self, obj):
        return getattr(obj, "_contacts_count", None) or Contact.objects.filter(company=obj.name).count()

    def get_deals_count(self, obj):
        return getattr(obj, "_deals_count", None) or Deal.objects.filter(customer__company=obj.name).count()

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Company name cannot be empty.")
        qs = Company.objects.filter(name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A company with this name already exists.")
        return value

    def validate_website(self, value):
        if value and not (value.startswith("http://") or value.startswith("https://")):
            raise serializers.ValidationError("Website must start with http:// or https://")
        return value