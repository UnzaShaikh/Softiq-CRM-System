from rest_framework import serializers


class GlobalSearchResultSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    module = serializers.CharField()
    title = serializers.CharField()
    subtitle = serializers.CharField(
        allow_blank=True,
        required=False
    )
    status = serializers.CharField(
        allow_blank=True,
        required=False
    )
    url = serializers.CharField()


class GlobalSearchResponseSerializer(serializers.Serializer):
    query = serializers.CharField()
    count = serializers.IntegerField()
    results = GlobalSearchResultSerializer(many=True)