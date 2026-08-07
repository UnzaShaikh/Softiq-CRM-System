from rest_framework import serializers
from .models import Deal


class DealSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    created_by_name = serializers.CharField(
        source="created_by.username",
        read_only=True
    )

    def validate_probability(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Probability must be between 0 and 100."
            )
        return value

    def validate_value(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Deal value must be greater than zero."
            )
        return value

    class Meta:
        model = Deal
        fields = [
            "id",
            "name",
            "customer",
            "customer_name",
            "value",
            "stage",
            "expected_close_date",
            "probability",
            "notes",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_by",
            "created_at",
            "updated_at",
            "customer_name",
            "created_by_name",
        ]