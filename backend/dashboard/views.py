from decimal import Decimal

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from calendar import month_name

from customers.models import Customer
from leads.models import Lead
from deals.models import Deal

from .serializers import (
    DashboardSummarySerializer,
    SalesOverviewSerializer,
    LeadSourceSerializer,
    DealsPipelineSerializer,
    RecentActivitySerializer,
    RecentCustomerSerializer,
    RecentLeadSerializer,
    TopPerformerSerializer,
)


User = get_user_model()

OPEN_DEAL_STAGES = [
    "lead",
    "qualified",
    "proposal",
    "negotiation",
    "closed_won",
]

WON_STAGE = "closed_won"


def _full_name(first_name, last_name):
    return f"{first_name} {last_name}".strip()


def _relative_time(dt):
    delta = timezone.now() - dt

    if delta.days > 0:
        return f"{delta.days}d ago"

    if delta.seconds > 3600:
        return f"{delta.seconds // 3600}h ago"

    if delta.seconds > 60:
        return f"{delta.seconds // 60}m ago"

    return "Just now"


# ---------- 1. Dashboard Summary ----------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    """
    Return summary metrics:
    total customers, active customers, deals,
    current-month revenue, recent customers/leads.
    """

    total_customers = Customer.objects.count()

    active_customers = Customer.objects.filter(
        status="active"
    ).count()

    total_deals = Deal.objects.filter(
        stage__in=OPEN_DEAL_STAGES
    ).count()

    # Revenue Month-to-Date
    today = timezone.localdate()

    total_revenue = Deal.objects.filter(
        stage=WON_STAGE,
        closed_date__year=today.year,
        closed_date__month=today.month,
    ).aggregate(
        total=Sum("value")
    )["total"] or Decimal("0.00")

    recent_customers = Customer.objects.order_by("-created_at")[:5]

    recent_leads = Lead.objects.order_by("-created_at")[:5]

    data = {
        "total_customers": total_customers,
        "active_customers": active_customers,
        "total_deals": total_deals,
        "total_revenue": round(float(total_revenue), 2),

        "recent_customers": [
            {
                "id": customer.id,
                "name": _full_name(
                    customer.first_name,
                    customer.last_name
                ),
                "email": customer.email,
                "created_at": customer.created_at,
                "phone": customer.phone,
            }
            for customer in recent_customers
        ],

        "recent_leads": [
            {
                "id": lead.id,
                "name": _full_name(
                    lead.first_name,
                    lead.last_name
                ),
                "email": lead.email,
                "status": lead.status,
                "created_at": lead.created_at,
                "source": lead.source,
            }
            for lead in recent_leads
        ],
    }

    serializer = DashboardSummarySerializer(data)

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )


# ---------- 2. Sales Overview API ----------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def sales_overview(request):
    """
    Return monthly revenue and deals closed data for chart.

    Revenue is calculated using the actual closed_date,
    not the expected_close_date.
    """

    year = int(
        request.query_params.get(
            "year",
            timezone.now().year
        )
    )

    monthly_revenue = []
    monthly_deals = []

    months = list(month_name)[1:]

    for month in range(1, 13):

        # Only deals actually closed during this month
        won_deals = Deal.objects.filter(
            stage=WON_STAGE,
            closed_date__year=year,
            closed_date__month=month,
        )

        # Revenue from deals actually closed in this month
        revenue = won_deals.aggregate(
            total=Sum("value")
        )["total"] or Decimal("0.00")

        monthly_revenue.append(
            float(revenue)
        )

        # Number of deals actually closed in this month
        monthly_deals.append(
            won_deals.count()
        )

    data = {
        "months": [
            month[:3]
            for month in months
        ],

        "revenue": monthly_revenue,

        "deals_closed": monthly_deals,
    }

    serializer = SalesOverviewSerializer(data)

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )


# ---------- 3. Lead Source Analytics API ----------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def lead_sources(request):
    """Return lead distribution by source"""

    lead_counts = (
        Lead.objects
        .values("source")
        .annotate(count=Count("id"))
        .order_by("-count")
    )

    source_labels = dict(
        Lead.SOURCE_CHOICES
    )

    total = sum(
        item["count"]
        for item in lead_counts
    )

    result = []

    for item in lead_counts:

        percentage = (
            round(
                (item["count"] / total) * 100
            )
            if total > 0
            else 0
        )

        result.append({
            "source": source_labels.get(
                item["source"],
                item["source"]
            ),
            "count": item["count"],
            "percentage": percentage,
        })

    serializer = LeadSourceSerializer(
        result,
        many=True
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )


# ---------- 4. Deals Pipeline API ----------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def deals_pipeline(request):
    """Return pipeline stages with deals info"""

    stage_choices = Deal.STAGE_CHOICES

    result = []

    for stage_value, stage_label in stage_choices:

        stage_deals = (
            Deal.objects
            .filter(stage=stage_value)
            .select_related("customer")
            .order_by("-created_at")
        )

        stage_total = (
            stage_deals.aggregate(
                total=Sum("value")
            )["total"]
            or Decimal("0.00")
        )

        stage_count = stage_deals.count()

        deals_list = []

        for deal in stage_deals[:5]:

            deals_list.append({
                "name": deal.name,
                "value": float(deal.value),

                "customer": (
                    _full_name(
                        deal.customer.first_name,
                        deal.customer.last_name
                    )
                    if deal.customer
                    else "Unknown"
                ),

                "company": (
                    deal.customer.company
                    if deal.customer
                    else ""
                ),

                "status": deal.stage,

                "remaining_days": (
                    (
                        deal.expected_close_date
                        - timezone.now().date()
                    ).days
                    if deal.expected_close_date
                    else None
                ),

                "expected_close_date": (
                    deal.expected_close_date
                ),
            })

        result.append({
            "stage": stage_value,
            "count": stage_count,
            "total_value": float(stage_total),
            "deals": deals_list,
        })

    serializer = DealsPipelineSerializer(
        result,
        many=True
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )


# ---------- 5. Recent Activities API ----------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recent_activities(request):
    """Return latest CRM activities synthesized from customers, leads and deals"""

    limit = int(
        request.query_params.get(
            "limit",
            10
        )
    )

    events = []

    for customer in Customer.objects.order_by(
        "-created_at"
    )[:limit]:

        events.append({
            "created_at": customer.created_at,
            "type": "Customer Added",
            "customer": _full_name(
                customer.first_name,
                customer.last_name
            ),
        })

    for lead in Lead.objects.order_by(
        "-created_at"
    )[:limit]:

        events.append({
            "created_at": lead.created_at,
            "type": "Lead Added",
            "customer": _full_name(
                lead.first_name,
                lead.last_name
            ),
        })

    for deal in (
        Deal.objects
        .select_related("customer")
        .order_by("-created_at")
    )[:limit]:

        customer_name = (
            _full_name(
                deal.customer.first_name,
                deal.customer.last_name
            )
            if deal.customer
            else "Unknown"
        )

        events.append({
            "created_at": deal.created_at,
            "type": (
                "Deal Won"
                if deal.stage == WON_STAGE
                else "Deal Created"
            ),
            "customer": customer_name,
        })

    events.sort(
        key=lambda e: e["created_at"],
        reverse=True
    )

    result = [
        {
            "type": event["type"],
            "customer": event["customer"],
            "time": _relative_time(
                event["created_at"]
            ),
        }
        for event in events[:limit]
    ]

    serializer = RecentActivitySerializer(
        result,
        many=True
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )


# ---------- 6. Recent Customers API ----------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recent_customers(request):
    """Return recent customers with details"""

    limit = int(
        request.query_params.get(
            "limit",
            10
        )
    )

    customers = (
        Customer.objects
        .annotate(
            revenue=Sum(
                "deals__value",
                filter=Q(
                    deals__stage=WON_STAGE
                )
            )
        )
        .order_by("-created_at")[:limit]
    )

    result = []

    for customer in customers:

        result.append({
            "id": customer.id,

            "name": _full_name(
                customer.first_name,
                customer.last_name
            ),

            "email": customer.email,

            "company": (
                customer.company
                or "N/A"
            ),

            "status": customer.status,

            "revenue": float(
                customer.revenue or 0
            ),

            "joined_date": customer.created_at.date(),
        })

    serializer = RecentCustomerSerializer(
        result,
        many=True
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )


# ---------- 7. Recent Leads API ----------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recent_leads(request):
    """Return recent leads with details"""

    limit = int(
        request.query_params.get(
            "limit",
            10
        )
    )

    leads = Lead.objects.order_by(
        "-created_at"
    )[:limit]

    result = []

    for lead in leads:

        result.append({
            "id": lead.id,

            "name": _full_name(
                lead.first_name,
                lead.last_name
            ),

            "email": lead.email,

            "company": (
                lead.company
                or "N/A"
            ),

            "source": (
                lead.source
                or "N/A"
            ),

            "status": lead.status,

            "score": lead.score,

            "date_added": lead.created_at.date(),
        })

    serializer = RecentLeadSerializer(
        result,
        many=True
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )


# ---------- 8. Top Performing Users API ----------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def top_performers(request):
    """Return top performing users"""

    limit = int(
        request.query_params.get(
            "limit",
            5
        )
    )

    # Get users with won-deal counts and revenue
    users = (
        User.objects
        .filter(
            created_deals__stage=WON_STAGE
        )
        .annotate(
            closed_deals=Count(
                "created_deals"
            ),

            total_revenue=Sum(
                "created_deals__value"
            ),
        )
        .order_by("-total_revenue")[:limit]
    )

    # Calculate max revenue for performance percentage
    max_revenue = (
        float(
            users[0].total_revenue or 0
        )
        if users
        else 1
    )

    result = []

    for user in users:

        performance = (
            round(
                (
                    float(
                        user.total_revenue or 0
                    )
                    / max_revenue
                ) * 100
            )
            if max_revenue > 0
            else 0
        )

        result.append({
            "name": (
                user.get_full_name()
                or user.username
            ),

            "role": (
                user.groups.first().name
                if user.groups.exists()
                else "Sales Rep"
            ),

            "revenue": float(
                user.total_revenue or 0
            ),

            "closed_deals": user.closed_deals,

            "performance_percentage": performance,
        })

    serializer = TopPerformerSerializer(
        result,
        many=True
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )