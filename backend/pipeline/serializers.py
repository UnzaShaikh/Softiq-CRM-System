from rest_framework import serializers


class PipelineSummarySerializer(serializers.Serializer):
    total_deals = serializers.IntegerField()
    total_pipeline_value = serializers.DecimalField(max_digits=14, decimal_places=2)
    active_deals = serializers.IntegerField()
    closed_won = serializers.IntegerField()
    closed_lost = serializers.IntegerField()


class StageDistributionSerializer(serializers.Serializer):
    stage = serializers.CharField()
    deal_count = serializers.IntegerField()
    total_value = serializers.DecimalField(max_digits=14, decimal_places=2)
    percentage = serializers.IntegerField()


class RecentDealSerializer(serializers.Serializer):
    customer = serializers.CharField()
    company = serializers.CharField()
    deal_value = serializers.DecimalField(max_digits=14, decimal_places=2)
    stage = serializers.CharField()
    expected_closing_date = serializers.DateField(allow_null=True)


class PipelinePerformanceSerializer(serializers.Serializer):
    months = serializers.ListField(child=serializers.CharField())
    deals_created = serializers.ListField(child=serializers.IntegerField())
    deals_closed = serializers.ListField(child=serializers.IntegerField())
    revenue_generated = serializers.ListField(child=serializers.FloatField())