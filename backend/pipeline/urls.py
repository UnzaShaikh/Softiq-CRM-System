from django.urls import path
from .views import (
    pipeline_summary,
    stage_distribution,
    recent_deals,
    pipeline_performance,
    pipeline_trends,
    pipeline_stage_deals,
)

urlpatterns = [
    path("pipeline/summary/", pipeline_summary, name="pipeline-summary"),
    path("pipeline/stages/", stage_distribution, name="pipeline-stages"),
    path("pipeline/recent-deals/", recent_deals, name="pipeline-recent-deals"),
    path("pipeline/performance/", pipeline_performance, name="pipeline-performance"),
    path(
    "pipeline/trends/",
    pipeline_trends,
    name="pipeline-trends",
),

path(
    "pipeline/stages/<str:stage>/deals/",
    pipeline_stage_deals,
    name="pipeline-stage-deals",
),
]