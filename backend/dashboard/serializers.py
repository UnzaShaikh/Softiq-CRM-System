from rest_framework import serializers

class DashboardSummarySerializer(serializers.Serializer):
    total_customers = serializers.IntegerField()
    active_customers = serializers.IntegerField()
    total_deals = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    recent_customers = serializers.ListField(child=serializers.DictField())
    recent_leads = serializers.ListField(child=serializers.DictField())