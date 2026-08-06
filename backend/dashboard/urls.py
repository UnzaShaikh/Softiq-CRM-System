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
    # Dashboard Summary
    path('dashboard/', dashboard_summary, name='dashboard-summary'),

    # Sales Overview
    path('dashboard/sales-overview/', sales_overview, name='sales-overview'),

    # Lead Source Analytics
    path('dashboard/lead-sources/', lead_sources, name='lead-sources'),

    # Deals Pipeline
    path('dashboard/deals-pipeline/', deals_pipeline, name='deals-pipeline'),

    # Recent Activities
    path('dashboard/recent-activities/', recent_activities, name='recent-activities'),

    # Recent Customers
    path('dashboard/recent-customers/', recent_customers, name='recent-customers'),

    # Recent Leads
    path('dashboard/recent-leads/', recent_leads, name='recent-leads'),

    # Top Performing Users
    path('dashboard/top-performers/', top_performers, name='top-performers'),
]