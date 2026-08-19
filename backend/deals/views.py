from django.utils import timezone

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
        "closed_date",
    ]

    ordering = ["-created_at"]

    def perform_create(self, serializer):
        deal = serializer.save(
            created_by=self.request.user
        )

        # If a deal is created directly as Closed Won,
        # record today's actual closing date.
        if deal.stage == "closed_won" and not deal.closed_date:
            deal.closed_date = timezone.localdate()
            deal.save(update_fields=["closed_date"])

    def perform_update(self, serializer):
        old_deal = self.get_object()
        old_stage = old_deal.stage

        deal = serializer.save()

        # Deal has changed to Closed Won
        if (
            old_stage != "closed_won"
            and deal.stage == "closed_won"
            and not deal.closed_date
        ):
            deal.closed_date = timezone.localdate()
            deal.save(update_fields=["closed_date"])

        # Deal was moved away from Closed Won
        elif (
            old_stage == "closed_won"
            and deal.stage != "closed_won"
        ):
            deal.closed_date = None
            deal.save(update_fields=["closed_date"])