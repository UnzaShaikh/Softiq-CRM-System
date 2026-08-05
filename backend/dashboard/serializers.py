from rest_framework import serializers
from .models import Customer, Lead, Deal, Activity, DealStage, User

class DashboardSummarySerializer(serializers.Serializer):
    total_customers = serializers.IntegerField()
    active_customers = serializers.IntegerField()
    total_deals = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    recent_customers = serializers.ListField(child=serializers.DictField())
    recent_leads = serializers.ListField(child=serializers.DictField())

class SalesOverviewSerializer(serializers.Serializer):
    months = serializers.ListField(child=serializers.CharField())
    revenue = serializers.ListField(child=serializers.IntegerField())
    deals_closed = serializers.ListField(child=serializers.IntegerField())

class LeadSourceSerializer(serializers.Serializer):
    source = serializers.CharField()
    count = serializers.IntegerField()
    percentage = serializers.IntegerField()

class DealsPipelineSerializer(serializers.Serializer):
    stage = serializers.CharField()
    count = serializers.IntegerField()
    total_value = serializers.DecimalField(max_digits=12, decimal_places=2)
    deals = serializers.ListField(child=serializers.DictField())

class RecentActivitySerializer(serializers.Serializer):
    type = serializers.CharField()
    customer = serializers.CharField()
    time = serializers.CharField()

class RecentCustomerSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    company = serializers.CharField()
    status = serializers.CharField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    joined_date = serializers.DateField()

class RecentLeadSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    company = serializers.CharField()
    source = serializers.CharField()
    status = serializers.CharField()
    score = serializers.IntegerField()
    date_added = serializers.DateField()

class TopPerformerSerializer(serializers.Serializer):
    name = serializers.CharField()
    role = serializers.CharField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    closed_deals = serializers.IntegerField()
    performance_percentage = serializers.IntegerField()