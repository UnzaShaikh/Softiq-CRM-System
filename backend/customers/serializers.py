from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"

    def validate_email(self, value):
        """
        Ensure customer email is unique.
        """
        queryset = Customer.objects.filter(email=value)

        # Ignore the current object during updates
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "A customer with this email already exists."
            )

        return value
