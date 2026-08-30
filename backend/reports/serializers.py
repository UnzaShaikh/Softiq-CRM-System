from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):

    generated_by_name = serializers.SerializerMethodField()
    type = serializers.CharField(
        source="get_report_type_display",
        read_only=True,
    )

    class Meta:
        model = Report
        fields = [
            "id",
            "name",
            "report_type",
            "type",
            "status",
            "generated_at",
            "generated_by",
            "generated_by_name",
            "views",
            "last_viewed_at",
            "data",
        ]
        read_only_fields = [
            "generated_by",
            "generated_at",
            "views",
            "last_viewed_at",
        ]

    def get_generated_by_name(self, obj):
        if not obj.generated_by:
            return "System"

        return (
            obj.generated_by.get_full_name()
            or obj.generated_by.username
        )