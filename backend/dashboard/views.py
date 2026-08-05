from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta, datetime
from calendar import month_name

from .models import Customer, Lead, Deal, Activity, DealStage, User
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

# ---------- 1. Dashboard Summary ----------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    """Return summary metrics: total customers, active customers, deals, revenue, recent customers/leads"""
    days = int(request.query_params.get('days', 30))
    cutoff_date = timezone.now() - timedelta(days=days)
    
    # Real data or placeholders if no data
    total_customers = Customer.objects.count()
    active_customers = Customer.objects.filter(created_at__gte=cutoff_date).count()
    total_deals = Deal.objects.filter(status__in=['discovery', 'proposal', 'negotiation', 'won']).count()
    total_revenue = Deal.objects.filter(status='won').aggregate(total=Sum('value'))['total'] or 0
    
    recent_customers = Customer.objects.order_by('-created_at')[:5].values(
        'id', 'name', 'email', 'created_at', 'phone'
    )
    recent_leads = Lead.objects.order_by('-created_at')[:5].values(
        'id', 'name', 'email', 'status', 'created_at', 'source'
    )
    
    data = {
        "total_customers": total_customers or 125,  # Placeholder
        "active_customers": active_customers or 64,
        "total_deals": total_deals or 18,
        "total_revenue": round(total_revenue or 24500.00, 2),
        "recent_customers": list(recent_customers) or [
            {"id": 1, "name": "Acme Corp", "email": "contact@acme.com", "created_at": timezone.now(), "phone": "123-456-7890"},
            {"id": 2, "name": "TechStart Inc", "email": "info@techstart.com", "created_at": timezone.now(), "phone": "987-654-3210"},
        ],
        "recent_leads": list(recent_leads) or [
            {"id": 1, "name": "New Lead 1", "email": "lead1@example.com", "status": "new", "created_at": timezone.now(), "source": "website"},
            {"id": 2, "name": "New Lead 2", "email": "lead2@example.com", "status": "contacted", "created_at": timezone.now(), "source": "referral"},
        ],
    }
    
    serializer = DashboardSummarySerializer(data)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ---------- 2. Sales Overview API ----------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_overview(request):
    """Return monthly revenue and deals closed data for chart"""
    year = int(request.query_params.get('year', timezone.now().year))
    
    # Try to get real data
    monthly_revenue = []
    monthly_deals = []
    months = list(month_name)[1:]  # ['January', 'February', ...]
    
    for month in range(1, 13):
        # Revenue from won deals in this month
        revenue = Deal.objects.filter(
            status='won',
            closed_date__year=year,
            closed_date__month=month
        ).aggregate(total=Sum('value'))['total'] or 0
        monthly_revenue.append(float(revenue))
        
        # Deals closed in this month
        deals = Deal.objects.filter(
            status='won',
            closed_date__year=year,
            closed_date__month=month
        ).count()
        monthly_deals.append(deals)
    
    # If no data, use placeholders
    if all(r == 0 for r in monthly_revenue):
        monthly_revenue = [40, 52, 47, 63, 58, 71, 68, 82, 78, 89, 86, 97]
        monthly_deals = [6, 8, 7, 10, 9, 12, 11, 14, 13, 16, 15, 18]
    
    data = {
        "months": [month[:3] for month in months],  # Jan, Feb, Mar...
        "revenue": monthly_revenue,
        "deals_closed": monthly_deals
    }
    
    serializer = SalesOverviewSerializer(data)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ---------- 3. Lead Source Analytics API ----------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lead_sources(request):
    """Return lead distribution by source"""
    lead_counts = Lead.objects.values('source').annotate(count=Count('id')).order_by('-count')
    
    if not lead_counts:
        # Placeholder data
        lead_counts = [
            {"source": "Organic Search", "count": 34},
            {"source": "Referral", "count": 22},
            {"source": "Social Media", "count": 18},
            {"source": "Email Campaign", "count": 15},
            {"source": "Website", "count": 11},
        ]
    
    total = sum(item['count'] for item in lead_counts)
    
    result = []
    for item in lead_counts:
        percentage = round((item['count'] / total) * 100) if total > 0 else 0
        result.append({
            "source": dict(Lead.SOURCE_CHOICES).get(item['source'], item['source']) if hasattr(Lead, 'SOURCE_CHOICES') else item['source'],
            "count": item['count'],
            "percentage": percentage
        })
    
    serializer = LeadSourceSerializer(result, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ---------- 4. Deals Pipeline API ----------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deals_pipeline(request):
    """Return pipeline stages with deals info"""
    stages = DealStage.objects.all().order_by('order')
    
    if not stages:
        # Create default stages for placeholder
        stages = [
            {"name": "Discovery", "order": 1},
            {"name": "Proposal", "order": 2},
            {"name": "Negotiation", "order": 3},
            {"name": "Won", "order": 4},
            {"name": "Lost", "order": 5},
        ]
    
    result = []
    for stage_data in stages:
        if isinstance(stage_data, dict):
            name = stage_data['name']
            deals = Deal.objects.filter(status=name.lower())
        else:
            name = stage_data.name
            deals = stage_data.deals.all()
        
        deals_list = []
        for deal in deals[:5]:  # Limit to 5 deals per stage
            deals_list.append({
                "name": deal.name,
                "value": float(deal.value),
                "customer": deal.customer.name if deal.customer else "Unknown",
                "status": deal.status,
                "remaining_days": (deal.expected_close_date - timezone.now().date()).days if deal.expected_close_date else None
            })
        
        # Placeholder if no deals
        if not deals_list:
            deals_list = [
                {"name": f"Sample {name} Deal 1", "value": 15000, "customer": "Sample Corp", "status": name.lower(), "remaining_days": 15},
                {"name": f"Sample {name} Deal 2", "value": 8500, "customer": "Test Inc", "status": name.lower(), "remaining_days": 30},
            ]
        
        result.append({
            "stage": name,
            "count": len(deals_list),
            "total_value": sum(d['value'] for d in deals_list),
            "deals": deals_list
        })
    
    serializer = DealsPipelineSerializer(result, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ---------- 5. Recent Activities API ----------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_activities(request):
    """Return latest CRM activities"""
    limit = int(request.query_params.get('limit', 10))
    
    activities = Activity.objects.all().order_by('-created_at')[:limit]
    
    if not activities:
        # Placeholder activities
        activities = [
            {"type": "Deal Closed", "customer": "HealthSync", "time": "2m ago"},
            {"type": "Customer Added", "customer": "FinWave", "time": "18m ago"},
            {"type": "Lead Added", "customer": "TechStart", "time": "1h ago"},
            {"type": "Deal Updated", "customer": "Acme Corp", "time": "3h ago"},
            {"type": "Customer Added", "customer": "DataFlow", "time": "5h ago"},
        ]
        return Response(activities, status=status.HTTP_200_OK)
    
    result = []
    for activity in activities:
        customer_name = activity.customer.name if activity.customer else "Unknown"
        time_ago = timezone.now() - activity.created_at
        
        if time_ago.days > 0:
            time_str = f"{time_ago.days}d ago"
        elif time_ago.seconds > 3600:
            time_str = f"{time_ago.seconds // 3600}h ago"
        elif time_ago.seconds > 60:
            time_str = f"{time_ago.seconds // 60}m ago"
        else:
            time_str = "Just now"
        
        result.append({
            "type": activity.get_type_display(),
            "customer": customer_name,
            "time": time_str
        })
    
    serializer = RecentActivitySerializer(result, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ---------- 6. Recent Customers API ----------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_customers(request):
    """Return recent customers with details"""
    limit = int(request.query_params.get('limit', 10))
    
    customers = Customer.objects.all().order_by('-created_at')[:limit]
    
    if not customers:
        # Placeholder customers
        customers = [
            {"id": 1, "name": "Acme Corp", "company": "Acme Inc", "status": "active", "revenue": 45000, "joined_date": timezone.now().date()},
            {"id": 2, "name": "TechStart", "company": "TechStart LLC", "status": "active", "revenue": 28000, "joined_date": timezone.now().date()},
            {"id": 3, "name": "FinWave", "company": "FinWave Solutions", "status": "inactive", "revenue": 0, "joined_date": timezone.now().date()},
        ]
        return Response(customers, status=status.HTTP_200_OK)
    
    result = []
    for customer in customers:
        result.append({
            "id": customer.id,
            "name": customer.name,
            "company": customer.company or "N/A",
            "status": customer.status,
            "revenue": float(customer.revenue),
            "joined_date": customer.created_at.date()
        })
    
    serializer = RecentCustomerSerializer(result, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ---------- 7. Recent Leads API ----------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_leads(request):
    """Return recent leads with details"""
    limit = int(request.query_params.get('limit', 10))
    
    leads = Lead.objects.all().order_by('-created_at')[:limit]
    
    if not leads:
        # Placeholder leads
        leads = [
            {"id": 1, "name": "Lead Alpha", "company": "Alpha Corp", "source": "website", "status": "new", "score": 85, "date_added": timezone.now().date()},
            {"id": 2, "name": "Lead Beta", "company": "Beta Solutions", "source": "referral", "status": "contacted", "score": 70, "date_added": timezone.now().date()},
            {"id": 3, "name": "Lead Gamma", "company": "Gamma Tech", "source": "social", "status": "qualified", "score": 95, "date_added": timezone.now().date()},
        ]
        return Response(leads, status=status.HTTP_200_OK)
    
    result = []
    for lead in leads:
        result.append({
            "id": lead.id,
            "name": lead.name,
            "company": lead.company or "N/A",
            "source": lead.source or "N/A",
            "status": lead.status,
            "score": lead.score,
            "date_added": lead.created_at.date()
        })
    
    serializer = RecentLeadSerializer(result, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ---------- 8. Top Performing Users API ----------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_performers(request):
    """Return top performing users"""
    limit = int(request.query_params.get('limit', 5))
    
    # Get users with deal counts and revenue
    users = User.objects.filter(deals__status='won').annotate(
        closed_deals=Count('deals'),
        total_revenue=Sum('deals__value')
    ).order_by('-total_revenue')[:limit]
    
    if not users:
        # Placeholder top performers
        users = [
            {"name": "Alice Johnson", "role": "Sales Manager", "revenue": 125000, "closed_deals": 24, "performance_percentage": 110},
            {"name": "Bob Smith", "role": "Sales Rep", "revenue": 98000, "closed_deals": 19, "performance_percentage": 95},
            {"name": "Carol White", "role": "Sales Rep", "revenue": 87000, "closed_deals": 16, "performance_percentage": 85},
            {"name": "Dave Brown", "role": "Sales Rep", "revenue": 65000, "closed_deals": 12, "performance_percentage": 75},
        ]
        return Response(users, status=status.HTTP_200_OK)
    
    # Calculate max revenue for performance percentage
    max_revenue = users[0].total_revenue if users else 1
    
    result = []
    for user in users:
        performance = round((user.total_revenue / max_revenue) * 100) if max_revenue > 0 else 0
        result.append({
            "name": user.get_full_name() or user.username,
            "role": user.groups.first().name if user.groups.exists() else "Sales Rep",
            "revenue": float(user.total_revenue or 0),
            "closed_deals": user.closed_deals,
            "performance_percentage": performance
        })
    
    # If no real data, use placeholders
    if not result:
        result = [
            {"name": "Alice Johnson", "role": "Sales Manager", "revenue": 125000, "closed_deals": 24, "performance_percentage": 110},
            {"name": "Bob Smith", "role": "Sales Rep", "revenue": 98000, "closed_deals": 19, "performance_percentage": 95},
        ]
    
    serializer = TopPerformerSerializer(result, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)