from django.urls import path

from .views import (
    ReportListCreateView,
    ReportDetailView,
    ReportGenerateView,
    ReportViewView,
    ReportDownloadView,
    SalesReportView,
    PipelineReportView,
)


urlpatterns = [
    # =========================================================
    # Reports
    # =========================================================
    path("", ReportListCreateView.as_view(), name="report-list-create"),
    path("<int:pk>/generate/", ReportGenerateView.as_view(), name="report-generate"),
    path("<int:pk>/view/", ReportViewView.as_view(), name="report-view"),
    path("<int:pk>/download/", ReportDownloadView.as_view(), name="report-download"),

    # =========================================================
    # Report Analytics
    # =========================================================

    path(
        "sales/",
        SalesReportView.as_view(),
        name="sales-report",
    ),

    path(
        "pipeline/",
        PipelineReportView.as_view(),
        name="pipeline-report",
    ),
]