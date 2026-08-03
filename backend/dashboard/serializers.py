from rest_framework import serializers


class DashboardSummarySerializer(serializers.Serializer):
    total_customers = serializers.IntegerField()
    total_leads = serializers.IntegerField()
    opportunities = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    tasks_due = serializers.IntegerField()