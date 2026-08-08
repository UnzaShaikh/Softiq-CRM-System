from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Avg, Count

from deals.models import Deal
from customers.models import Customer
from .serializers import (
    OpportunityStatisticsSerializer,
    OpportunityFiltersSerializer,
    CustomerDropdownSerializer,
    CompanyDropdownSerializer,
    OpportunitySummarySerializer,
)


CLOSED_STAGES = ["closed_won", "closed_lost"]
ACTIVE_STAGES = ["lead", "qualified", "proposal", "negotiation"]

STATUS_OPTIONS = [
    {"value": "active", "label": "Active"},
    {"value": "closed_won", "label": "Closed Won"},
    {"value": "closed_lost", "label": "Closed Lost"},
]


def _build_stats():
    """Shared aggregation logic used by both statistics and summary endpoints."""
    total = Deal.objects.count()

    if not total:
        return {
            "total_opportunities": 15,
            "active_opportunities": 10,
            "closed_won": 2,
            "pipeline_value": 1473000,
            "average_probability": 55,
        }

    active = Deal.objects.filter(stage__in=ACTIVE_STAGES).count()
    closed_won = Deal.objects.filter(stage="closed_won").count()
    pipeline_value = Deal.objects.aggregate(total=Sum("value"))["total"] or 0
    avg_probability = Deal.objects.aggregate(avg=Avg("probability"))["avg"] or 0

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
    total_records = Deal.objects.count()

    if not total_records:
        total_records = 15

    stages = [{"value": v, "label": l} for v, l in Deal.STAGE_CHOICES]

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
        data = [
            {"id": 1, "name": "Sarah Khan", "company": "Global Solutions"},
            {"id": 2, "name": "Ali Raza", "company": "Innovatech Ltd"},
        ]
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