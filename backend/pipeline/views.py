from calendar import month_name

import csv

from django.db.models import Count, Q, Sum
from django.db.models.functions import ExtractMonth
from django.http import HttpResponse
from django.utils import timezone

from openpyxl import Workbook
from reportlab.platypus import SimpleDocTemplate, Table

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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


def _apply_created_date_filter(queryset, request):
    start_date = request.query_params.get("start_date")
    end_date = request.query_params.get("end_date")

    if start_date and end_date:
        queryset = queryset.filter(
            created_at__date__range=[start_date, end_date]
        )

    return queryset


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pipeline_summary(request):
    """
    Return pipeline summary metrics.

    Optimized from multiple COUNT/AGGREGATE queries to one database
    aggregate query.
    """
    queryset = _apply_created_date_filter(
        Deal.objects.all(),
        request,
    )

    metrics = queryset.aggregate(
        total_deals=Count("id"),
        total_pipeline_value=Sum("value"),
        active_deals=Count(
            "id",
            filter=Q(stage__in=ACTIVE_STAGES),
        ),
        closed_won=Count(
            "id",
            filter=Q(stage="closed_won"),
        ),
        closed_lost=Count(
            "id",
            filter=Q(stage="closed_lost"),
        ),
    )

    data = {
        "total_deals": metrics["total_deals"] or 0,
        "total_pipeline_value": metrics["total_pipeline_value"] or 0,
        "active_deals": metrics["active_deals"] or 0,
        "closed_won": metrics["closed_won"] or 0,
        "closed_lost": metrics["closed_lost"] or 0,
    }

    serializer = PipelineSummarySerializer(data)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def stage_distribution(request):
    """
    Return deal distribution across pipeline stages.

    This endpoint already uses grouped aggregation, so keep it as one
    grouped database query.
    """
    queryset = Deal.objects.all()

    queryset = _apply_created_date_filter(
        queryset,
        request,
    )

    month = request.query_params.get("month")

    if month:
        queryset = queryset.filter(
            created_at__month=month
        )

    grouped = list(
        queryset
        .values("stage")
        .annotate(
            deal_count=Count("id"),
            total_value=Sum("value"),
        )
        .order_by("stage")
    )

    total_deals = sum(
        item["deal_count"] or 0
        for item in grouped
    )

    stage_labels = dict(Deal.STAGE_CHOICES)

    data = [
        {
            "stage": stage_labels.get(
                item["stage"],
                item["stage"],
            ),
            "deal_count": item["deal_count"] or 0,
            "total_value": item["total_value"] or 0,
            "percentage": (
                round(
                    (item["deal_count"] / total_deals) * 100
                )
                if total_deals > 0
                else 0
            ),
        }
        for item in grouped
    ]

    serializer = StageDistributionSerializer(
        data,
        many=True,
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recent_deals(request):
    """
    Return the 10 most recently created deals.
    """
    queryset = Deal.objects.select_related(
        "customer"
    )

    queryset = _apply_created_date_filter(
        queryset,
        request,
    )

    queryset = queryset.order_by(
        "-created_at"
    )[:10]

    stage_labels = dict(
        Deal.STAGE_CHOICES
    )

    data = [
        {
            "id": deal.id,
            "name": deal.name,
            "customer": (
                f"{deal.customer.first_name} "
                f"{deal.customer.last_name}"
                if deal.customer
                else "Unknown"
            ),
            "company": (
                deal.customer.company
                if deal.customer
                and deal.customer.company
                else "N/A"
            ),
            "deal_value": deal.value,
            "stage": stage_labels.get(
                deal.stage,
                deal.stage,
            ),
            "expected_closing_date": (
                deal.expected_close_date
            ),
        }
        for deal in queryset
    ]

    serializer = RecentDealSerializer(
        data,
        many=True,
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pipeline_performance(request):
    """
    Return monthly pipeline performance.

    Previous implementation executed up to 36 database queries:
      12 COUNT queries for created deals +
      12 COUNT queries for closed deals +
      12 SUM queries for revenue.

    This implementation uses two grouped aggregate queries:
      1. created deals grouped by month
      2. closed-won deals grouped by month

    The response shape remains unchanged.
    """
    try:
        year = int(
            request.query_params.get(
                "year",
                timezone.now().year,
            )
        )
    except (TypeError, ValueError):
        return Response(
            {"error": "Invalid year parameter"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    months = [m[:3] for m in list(month_name)[1:]]

    created_rows = (
        Deal.objects
        .filter(
            created_at__year=year
        )
        .annotate(
            month=ExtractMonth("created_at")
        )
        .values("month")
        .annotate(
            count=Count("id")
        )
        .order_by("month")
    )

    closed_rows = (
        Deal.objects
        .filter(
            stage="closed_won",
            expected_close_date__year=year,
        )
        .annotate(
            month=ExtractMonth(
                "expected_close_date"
            )
        )
        .values("month")
        .annotate(
            count=Count("id"),
            revenue=Sum("value"),
        )
        .order_by("month")
    )

    created_by_month = {
        int(row["month"]): row["count"] or 0
        for row in created_rows
    }

    closed_by_month = {
        int(row["month"]): {
            "count": row["count"] or 0,
            "revenue": float(
                row["revenue"] or 0
            ),
        }
        for row in closed_rows
    }

    deals_created = [
        created_by_month.get(month, 0)
        for month in range(1, 13)
    ]

    deals_closed = [
        closed_by_month.get(
            month,
            {"count": 0},
        )["count"]
        for month in range(1, 13)
    ]

    revenue_generated = [
        closed_by_month.get(
            month,
            {"revenue": 0},
        )["revenue"]
        for month in range(1, 13)
    ]

    data = {
        "months": months,
        "deals_created": deals_created,
        "deals_closed": deals_closed,
        "revenue_generated": revenue_generated,
    }

    serializer = PipelinePerformanceSerializer(
        data
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pipeline_trends(request):
    """
    Compare current month's pipeline statistics with the previous month.

    Previous implementation performed many individual COUNT/SUM queries.
    This version performs one aggregate query per month.
    """
    today = timezone.now()

    try:
        current_year = int(
            request.query_params.get(
                "year",
                today.year,
            )
        )

        current_month = int(
            request.query_params.get(
                "month",
                today.month,
            )
        )
    except (TypeError, ValueError):
        return Response(
            {
                "error": "Invalid year or month."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if current_month < 1 or current_month > 12:
        return Response(
            {
                "error": "Month must be between 1 and 12."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if current_month == 1:
        previous_month = 12
        previous_year = current_year - 1
    else:
        previous_month = current_month - 1
        previous_year = current_year

    def monthly_metrics(year, month):
        queryset = Deal.objects.filter(
            created_at__year=year,
            created_at__month=month,
        )

        return queryset.aggregate(
            total_deals=Count("id"),
            pipeline_value=Sum("value"),
            active_deals=Count(
                "id",
                filter=Q(
                    stage__in=ACTIVE_STAGES
                ),
            ),
            closed_won=Count(
                "id",
                filter=Q(
                    stage="closed_won"
                ),
            ),
            closed_lost=Count(
                "id",
                filter=Q(
                    stage="closed_lost"
                ),
            ),
        )

    current = monthly_metrics(
        current_year,
        current_month,
    )

    previous = monthly_metrics(
        previous_year,
        previous_month,
    )

    current_total_deals = (
        current["total_deals"] or 0
    )
    previous_total_deals = (
        previous["total_deals"] or 0
    )

    current_pipeline_value = (
        current["pipeline_value"] or 0
    )
    previous_pipeline_value = (
        previous["pipeline_value"] or 0
    )

    current_active = (
        current["active_deals"] or 0
    )
    previous_active = (
        previous["active_deals"] or 0
    )

    current_won = (
        current["closed_won"] or 0
    )
    previous_won = (
        previous["closed_won"] or 0
    )

    current_lost = (
        current["closed_lost"] or 0
    )
    previous_lost = (
        previous["closed_lost"] or 0
    )

    def calculate_growth(
        current_value,
        previous_value,
    ):
        if previous_value == 0:
            return 0

        return round(
            (
                (
                    float(current_value)
                    - float(previous_value)
                )
                / float(previous_value)
            )
            * 100,
            2,
        )

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

    return Response(
        serializer.data,
        status=status.HTTP_200_OK,
    )


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

    stage_labels = dict(
        Deal.STAGE_CHOICES
    )

    data = []

    for deal in queryset:
        data.append(
            {
                "id": deal.id,
                "name": deal.name,
                "customer": (
                    f"{deal.customer.first_name} "
                    f"{deal.customer.last_name}"
                    if deal.customer
                    else ""
                ),
                "company": (
                    deal.customer.company
                    if deal.customer
                    else "N/A"
                ),
                "value": deal.value,
                "stage": stage_labels.get(
                    deal.stage
                ),
                "expected_close_date": (
                    deal.expected_close_date
                ),
                "probability": deal.probability,
            }
        )

    serializer = PipelineStageDealSerializer(
        data,
        many=True,
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK,
    )
