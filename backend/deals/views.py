from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Deal
from .serializers import DealSerializer


class DealViewSet(viewsets.ModelViewSet):
    serializer_class = DealSerializer
    permission_classes = [IsAuthenticated]

    queryset = Deal.objects.select_related(
        "customer",
        "created_by"
    ).all()

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        "stage",
        "customer",
    ]

    search_fields = [
    "name",
    "customer__first_name",
    "customer__last_name",
    "customer__email",
    "customer__company",
    "notes",
]

    ordering_fields = [
        "value",
        "created_at",
        "expected_close_date",
    ]

    ordering = ["-created_at"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)