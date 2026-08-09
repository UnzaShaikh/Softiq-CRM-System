from rest_framework import serializers


class OpportunityStatisticsSerializer(serializers.Serializer):
    total_opportunities = serializers.IntegerField()
    active_opportunities = serializers.IntegerField()
    closed_won = serializers.IntegerField()
    pipeline_value = serializers.DecimalField(max_digits=14, decimal_places=2)
    average_probability = serializers.IntegerField()


class StatusOptionSerializer(serializers.Serializer):
    value = serializers.CharField()
    label = serializers.CharField()


class OpportunityFiltersSerializer(serializers.Serializer):
    statuses = StatusOptionSerializer(many=True)
    stages = StatusOptionSerializer(many=True)
    total_records = serializers.IntegerField()


class CustomerDropdownSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    company = serializers.CharField(allow_blank=True)


class CompanyDropdownSerializer(serializers.Serializer):
    company = serializers.CharField()


class OpportunitySummarySerializer(serializers.Serializer):
    total_opportunities = serializers.IntegerField()
    active_opportunities = serializers.IntegerField()
    closed_won = serializers.IntegerField()
    pipeline_value = serializers.DecimalField(max_digits=14, decimal_places=2)
    average_probability = serializers.IntegerField()

from .models import Opportunity


class OpportunitySerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    company = serializers.SerializerMethodField()

    class Meta:
        model = Opportunity

        fields = [
            "id",
            "name",
            "customer",
            "customer_name",
            "company",
            "value",
            "stage",
            "status",
            "probability",
            "expected_close_date",
            "notes",
            "created_by",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "customer_name",
            "company",
            "created_by",
            "created_at",
            "updated_at",
        ]

    def get_customer_name(self, obj):
        if not obj.customer:
            return ""

        return (
            f"{obj.customer.first_name} "
            f"{obj.customer.last_name}"
        ).strip()

    def get_company(self, obj):
        if not obj.customer:
            return ""

        return obj.customer.company or ""

    def validate_probability(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Probability must be between 0 and 100."
            )

        return value

    def validate_value(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Opportunity value cannot be negative."
            )

        return value