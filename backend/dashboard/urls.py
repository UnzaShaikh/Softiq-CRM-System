from django.urls import path
from .views import dashboard_summary

urlpatterns = [
    path("dashboard/", dashboard_summary, name="dashboard_summary"),
]
