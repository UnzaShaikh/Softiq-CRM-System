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