from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Avg, Count
from core.permissions import HasRolePermission
from notifications.services import create_notification

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import (
    api_view,
    permission_classes,
)

from .models import Opportunity

from customers.models import Customer
from .serializers import (
    OpportunityStatisticsSerializer,
    OpportunityFiltersSerializer,
    CustomerDropdownSerializer,
    CompanyDropdownSerializer,
    OpportunitySummarySerializer,
    OpportunitySerializer,
)


CLOSED_STAGES = ["closed_won", "closed_lost"]
ACTIVE_STAGES = ["lead", "qualified", "proposal", "negotiation"]

STATUS_OPTIONS = [
    {"value": "active", "label": "Active"},
    {"value": "on_hold", "label": "On Hold"},
    {"value": "inactive", "label": "Inactive"},
    {"value": "closed_won", "label": "Closed Won"},
    {"value": "closed_lost", "label": "Closed Lost"},
]


def _build_stats():
    """Shared aggregation logic used by both statistics and summary endpoints."""
    total = Opportunity.objects.count()

    if not total:
        return {
            "total_opportunities": 0,
            "active_opportunities": 0,
            "closed_won": 0,
            "pipeline_value": 0,
            "average_probability": 0,
        }

    active = Opportunity.objects.filter(
        status="active"
    ).count()

    closed_won = Opportunity.objects.filter(
        stage="closed_won"
    ).count()

    pipeline_value = Opportunity.objects.aggregate(
        total=Sum("value")
    )["total"] or 0

    avg_probability = Opportunity.objects.aggregate(
        avg=Avg("probability")
    )["avg"] or 0

    return {
        "total_opportunities": total,
        "active_opportunities": active,
        "closed_won": closed_won,
        "pipeline_value": pipeline_value,
        "average_probability": round(avg_probability),
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def opportunity_statistics(request):
    """
    Return opportunity statistics: total, active, closed won,
    pipeline value, average probability. Falls back to placeholder
    data if no deals exist.
    """
    serializer = OpportunityStatisticsSerializer(_build_stats())
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def opportunity_summary(request):
    """
    Return aggregated data for the Opportunity page cards and
    overview section. Falls back to placeholder data if no deals exist.
    """
    serializer = OpportunitySummarySerializer(_build_stats())
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def opportunity_filters(request):
    """
    Return available status options, pipeline stage options, and
    total record count for filtering the Opportunity list.
    Falls back to placeholder data if no deals exist.
    """
    total_records = Opportunity.objects.count()

    stages = [{"value": v, "label": l} for v, l in Opportunity.STAGE_CHOICES]

    data = {
        "statuses": STATUS_OPTIONS,
        "stages": stages,
        "total_records": total_records,
    }
    serializer = OpportunityFiltersSerializer(data)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customers_dropdown(request):
    """
    Return a lightweight list of customers for populating dropdowns.
    Falls back to placeholder data if no customers exist.
    """
    queryset = Customer.objects.all().order_by("first_name")

    if not queryset:
        data = [{"company": name} for name in queryset]
    else:
        data = [
            {
                "id": customer.id,
                "name": f"{customer.first_name} {customer.last_name}".strip(),
                "company": customer.company or "",
            }
            for customer in queryset
        ]

    serializer = CustomerDropdownSerializer(data, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def companies_dropdown(request):
    """
    Return a distinct list of company names for populating dropdowns.
    Falls back to placeholder data if no companies exist.
    """
    queryset = (
        Customer.objects.exclude(company="")
        .values_list("company", flat=True)
        .distinct()
        .order_by("company")
    )

    if not queryset:
        data = [{"company": "Global Solutions"}, {"company": "Innovatech Ltd"}]
    else:
        data = [{"company": name} for name in queryset]

    serializer = CompanyDropdownSerializer(data, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

class OpportunityViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Opportunities.
    """

    queryset = Opportunity.objects.select_related(
        "customer",
        "created_by",
    ).all()

    serializer_class = OpportunitySerializer

    permission_classes = [HasRolePermission]
    permission_module = "opportunities"

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "status",
        "stage",
        "customer",
    ]

    search_fields = [
        "name",
        "customer__first_name",
        "customer__last_name",
        "customer__company",
    ]

    ordering_fields = [
        "name",
        "value",
        "stage",
        "status",
        "probability",
        "expected_close_date",
        "created_at",
        "updated_at",
    ]

    ordering = ["-created_at"]

    def perform_create(self, serializer):
        """
        Create an opportunity and generate a notification.
        """

        opportunity = serializer.save(
            created_by=self.request.user
        )

        create_notification(
            user=self.request.user,
            title="New Opportunity Created",
            message=(
                f"A new opportunity has been created: "
                f"{opportunity.name}."
            ),
            notification_type="opportunity",
            source_type="opportunity",
            source_id=opportunity.id,
        )

    def perform_update(self, serializer):
        """
        Update an opportunity and generate a notification.
        """

        opportunity = serializer.save()

        create_notification(
            user=self.request.user,
            title="Opportunity Updated",
            message=(
                f"The opportunity '{opportunity.name}' "
                f"has been updated."
            ),
            notification_type="opportunity",
            source_type="opportunity",
            source_id=opportunity.id,
        )