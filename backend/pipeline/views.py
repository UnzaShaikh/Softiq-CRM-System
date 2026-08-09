from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from calendar import month_name
import csv
from django.http import HttpResponse
from openpyxl import Workbook
from reportlab.platypus import SimpleDocTemplate, Table

from deals.models import Deal
from .serializers import (
    PipelineSummarySerializer,
    StageDistributionSerializer,
    RecentDealSerializer,
    PipelinePerformanceSerializer,
    PipelineTrendSerializer,
    PipelineStageDealSerializer,
)


ACTIVE_STAGES = [
    "lead",
    "qualified",
    "proposal",
    "negotiation",
]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pipeline_summary(request):

    """
    Return pipeline summary metrics: total deals, total pipeline value,
    active deals, closed won, closed lost. Falls back to placeholder
    data if no deals exist.
    """
    queryset = Deal.objects.select_related("customer")

    start_date = request.query_params.get("start_date")
    end_date = request.query_params.get("end_date")

    if start_date and end_date:
        queryset = queryset.filter(
            created_at__date__range=[start_date, end_date]
        )

    total_deals = queryset.count()

    total_pipeline_value = (
        queryset.aggregate(total=Sum("value"))["total"] or 0
    )

    active_deals = queryset.filter(
        stage__in=ACTIVE_STAGES
    ).count()

    closed_won = queryset.filter(stage="closed_won").count()

    closed_lost = queryset.filter(stage="closed_lost").count()

    data = {
        "total_deals": total_deals,
        "total_pipeline_value": total_pipeline_value,
        "active_deals": active_deals,
        "closed_won": closed_won,
        "closed_lost": closed_lost,
    }

    serializer = PipelineSummarySerializer(data)

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stage_distribution(request):
    """
    Return deal distribution across pipeline stages (deal count,
    total value, percentage). Falls back to placeholder data if
    no deals exist.
    """
    queryset = Deal.objects.all()

    # Date Range Filter
    start_date = request.query_params.get("start_date")
    end_date = request.query_params.get("end_date")
    month = request.query_params.get("month")

    if start_date and end_date:
        queryset = queryset.filter(
            created_at__date__range=[start_date, end_date]
        )

    if month:
        queryset = queryset.filter(created_at__month=month)

    queryset = (
        queryset.values("stage")
        .annotate(
            deal_count=Count("id"),
            total_value=Sum("value")
        )
        .order_by("stage")
    )

    total_deals = sum(item["deal_count"] for item in queryset)

    stage_labels = dict(Deal.STAGE_CHOICES)

    data = [
        {
            "stage": stage_labels.get(item["stage"], item["stage"]),
            "deal_count": item["deal_count"],
            "total_value": item["total_value"] or 0,
            "percentage": (
                round((item["deal_count"] / total_deals) * 100)
                if total_deals > 0
                else 0
            ),
        }
        for item in queryset
    ]

    serializer = StageDistributionSerializer(data, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_deals(request):
    """
    Return the most recently created deals with customer, company,
    value, status, and expected closing date. Falls back to
    placeholder data if no deals exist.
    """
    queryset = Deal.objects.select_related("customer")

    # Date Range Filter
    start_date = request.query_params.get("start_date")
    end_date = request.query_params.get("end_date")

    if start_date and end_date:
        queryset = queryset.filter(
            created_at__date__range=[start_date, end_date]
        )

    queryset = queryset.order_by("-created_at")[:10]

    stage_labels = dict(Deal.STAGE_CHOICES)

    data = [
    {
        "customer": (
            f"{deal.customer.first_name} {deal.customer.last_name}"
            if deal.customer
            else "Unknown"
        ),
        "company": (
            deal.customer.company
            if deal.customer and deal.customer.company
            else "N/A"
        ),
        "deal_value": deal.value,
        "stage": stage_labels.get(deal.stage, deal.stage),
        "expected_closing_date": deal.expected_close_date,
    }
    for deal in queryset
]
    serializer = RecentDealSerializer(data, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pipeline_performance(request):
    """
    Return monthly pipeline performance: deals created, deals closed,
    and revenue generated. Falls back to placeholder data if no
    deals exist for the year.
    """
        # Validate year parameter
    try:
        year = int(request.query_params.get("year", timezone.now().year))
    except (TypeError, ValueError):
        return Response(
            {"error": "Invalid year parameter"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    months = [m[:3] for m in list(month_name)[1:]]

    deals_created = []
    deals_closed = []
    revenue_generated = []

    for month in range(1, 13):
        created_count = Deal.objects.filter(
            created_at__year=year,
            created_at__month=month
        ).count()

        closed_qs = Deal.objects.filter(
            stage="closed_won",
            expected_close_date__year=year,
            expected_close_date__month=month,
        )

        closed_count = closed_qs.count()

        revenue = (
            closed_qs.aggregate(total=Sum("value"))["total"]
            or 0
        )

        deals_created.append(created_count)
        deals_closed.append(closed_count)
        revenue_generated.append(float(revenue))

    data = {
        "months": months,
        "deals_created": deals_created,
        "deals_closed": deals_closed,
        "revenue_generated": revenue_generated,
    }

    serializer = PipelinePerformanceSerializer(data)

    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pipeline_trends(request):
    """
    Compare current month's pipeline performance with the previous month.
    """
    today = timezone.now()

    try:
        current_year = int(
            request.query_params.get("year", today.year)
        )

        current_month = int(
            request.query_params.get("month", today.month)
        )

    except (TypeError, ValueError):
        return Response(
            {
                "error": "Invalid year or month."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validate month
    if current_month < 1 or current_month > 12:
        return Response(
        {
            "error": "Month must be between 1 and 12."
        },
        status=status.HTTP_400_BAD_REQUEST,
    )

    # Calculate previous month
    if current_month == 1:
        previous_month = 12
        previous_year = current_year - 1
    else:
        previous_month = current_month - 1
        previous_year = current_year

    current_queryset = Deal.objects.filter(
        created_at__year=current_year,
        created_at__month=current_month,
    )

    previous_queryset = Deal.objects.filter(
        created_at__year=previous_year,
        created_at__month=previous_month,
    )

    # -----------------------------
    # Current Month Statistics
    # -----------------------------

    current_total_deals = current_queryset.count()
    previous_total_deals = previous_queryset.count()

    current_pipeline_value = (
        current_queryset.aggregate(total=Sum("value"))["total"] or 0
    )

    previous_pipeline_value = (
        previous_queryset.aggregate(total=Sum("value"))["total"] or 0
    )

    current_active = current_queryset.filter(
        stage__in=ACTIVE_STAGES
    ).count()

    previous_active = previous_queryset.filter(
        stage__in=ACTIVE_STAGES
    ).count()

    current_won = current_queryset.filter(
        stage="closed_won"
    ).count()

    previous_won = previous_queryset.filter(
        stage="closed_won"
    ).count()

    current_lost = current_queryset.filter(
        stage="closed_lost"
    ).count()

    previous_lost = previous_queryset.filter(
        stage="closed_lost"
    ).count()

    # -----------------------------
    # Helper Function
    # -----------------------------

    def calculate_growth(current, previous):
        if previous == 0:
            return 0

        return round(
            ((float(current) - float(previous)) / float(previous)) * 100,
            2,
        )

    # -----------------------------
    # Response
    # -----------------------------

    data = {
        "total_deals": {
            "current": current_total_deals,
            "previous": previous_total_deals,
            "growth": calculate_growth(
                current_total_deals,
                previous_total_deals,
            ),
        },

        "pipeline_value": {
            "current": current_pipeline_value,
            "previous": previous_pipeline_value,
            "growth": calculate_growth(
                current_pipeline_value,
                previous_pipeline_value,
            ),
        },

        "active_deals": {
            "current": current_active,
            "previous": previous_active,
            "growth": calculate_growth(
                current_active,
                previous_active,
            ),
        },

        "closed_won": {
            "current": current_won,
            "previous": previous_won,
            "growth": calculate_growth(
                current_won,
                previous_won,
            ),
        },

        "closed_lost": {
            "current": current_lost,
            "previous": previous_lost,
            "growth": calculate_growth(
                current_lost,
                previous_lost,
            ),
        },
    }

    serializer = PipelineTrendSerializer(data)

    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pipeline_stage_deals(request, stage):

    valid_stages = [
        choice[0]
        for choice in Deal.STAGE_CHOICES
    ]

    if stage not in valid_stages:
        return Response(
            {
                "error": "Invalid pipeline stage."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    queryset = (
        Deal.objects
        .select_related("customer")
        .filter(stage=stage)
        .order_by("-created_at")
    )

    stage_labels = dict(Deal.STAGE_CHOICES)

    data = []

    for deal in queryset:

        data.append(
            {
                "id": deal.id,
                "name": deal.name,
                "customer": (
                f"{deal.customer.first_name} {deal.customer.last_name}"
                    if deal.customer else ""
                    ),
                "company": deal.customer.company,
                "value": deal.value,
                "stage": stage_labels.get(deal.stage),
                "expected_close_date": deal.expected_close_date,
                "probability": deal.probability,
            }
        )

    serializer = PipelineStageDealSerializer(data, many=True)

    return Response(serializer.data)