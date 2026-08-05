from django.urls import path
from .views import (
    dashboard_summary,
    sales_overview,
    lead_sources,
    deals_pipeline,
    recent_activities,
    recent_customers,
    recent_leads,
    top_performers,
)

urlpatterns = [
    # Existing
    path('dashboard-summary/', dashboard_summary, name='dashboard-summary'),
    
    # New endpoints
    path('dashboard/sales-overview/', sales_overview, name='sales-overview'),
    path('dashboard/lead-sources/', lead_sources, name='lead-sources'),
    path('dashboard/deals-pipeline/', deals_pipeline, name='deals-pipeline'),
    path('dashboard/recent-activities/', recent_activities, name='recent-activities'),
    path('dashboard/recent-customers/', recent_customers, name='recent-customers'),
    path('dashboard/recent-leads/', recent_leads, name='recent-leads'),
    path('dashboard/top-performers/', top_performers, name='top-performers'),
]