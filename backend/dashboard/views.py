from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta

from .serializers import DashboardSummarySerializer

# ------------------------------
# Adjust these imports to match your actual app/model names
# Example: if your Customer model is in 'customers/models.py'
# from customers.models import Customer
# If you have a 'deals' app: from deals.models import Deal
# If you have a 'leads' app: from leads.models import Lead
# ------------------------------
# For now, we'll assume models live in the same app or separate apps.
# If they don't exist yet, you'll need to create them.
from .models import Customer, Lead, Deal


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    """
    Return a summary of key CRM metrics for the authenticated user.
    
    Returns:
        - total_customers: Total number of customers
        - active_customers: Number of customers with activity (orders, etc.) in last 30 days
        - total_deals: Total number of deals/opportunities (open or won)
        - total_revenue: Total revenue from won deals
        - recent_customers: Last 5 customers created
        - recent_leads: Last 5 leads created
    """
    
    # Optional: date filter from query param
    days = int(request.query_params.get('days', 30))
    cutoff_date = timezone.now() - timedelta(days=days)
    
    # Initialize counts to 0 in case models don't exist (for safety)
    total_customers = 0
    active_customers = 0
    total_deals = 0
    total_revenue = 0
    recent_customers = []
    recent_leads = []
    
    # ------------------------------
    # REAL DATABASE QUERIES
    # ------------------------------
    if Customer:
        total_customers = Customer.objects.count()
        # Active customers: customers with any order in the last X days
        # Adjust the filter condition to match your business logic
        # e.g., if you have an 'orders' related_name on Customer
        # active_customers = Customer.objects.filter(orders__created_at__gte=cutoff_date).distinct().count()
        # For now, we'll count customers created in the last X days as a fallback:
        active_customers = Customer.objects.filter(created_at__gte=cutoff_date).count()
        recent_customers = Customer.objects.order_by('-created_at')[:5].values(
            'id', 'name', 'email', 'created_at', 'phone'
        )
    
    if Lead:
        recent_leads = Lead.objects.order_by('-created_at')[:5].values(
            'id', 'name', 'email', 'status', 'created_at', 'source'
        )
    
    if Deal:
        # Count deals that are 'open' or 'won' – adjust status values
        total_deals = Deal.objects.filter(
            Q(status='open') | Q(status='won')
        ).count()
        # Revenue from won deals
        total_revenue = Deal.objects.filter(
            status='won'
        ).aggregate(total=Sum('value'))['total'] or 0
    
    # Prepare response
    data = {
        "total_customers": total_customers,
        "active_customers": active_customers,
        "total_deals": total_deals,
        "total_revenue": round(total_revenue, 2),
        "recent_customers": list(recent_customers),
        "recent_leads": list(recent_leads),
    }
    
    serializer = DashboardSummarySerializer(data)
    return Response(serializer.data, status=status.HTTP_200_OK)