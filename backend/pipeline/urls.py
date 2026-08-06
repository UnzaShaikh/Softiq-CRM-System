from django.urls import path
from .views import (
    pipeline_summary,
    stage_distribution,
    recent_deals,
    pipeline_performance,
)

urlpatterns = [
    path("pipeline/summary/", pipeline_summary, name="pipeline-summary"),
    path("pipeline/stages/", stage_distribution, name="pipeline-stages"),
    path("pipeline/recent-deals/", recent_deals, name="pipeline-recent-deals"),
    path("pipeline/performance/", pipeline_performance, name="pipeline-performance"),
]