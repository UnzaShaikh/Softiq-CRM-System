from django.urls import path
from .views import (
    opportunity_statistics,
    opportunity_summary,
    opportunity_filters,
    customers_dropdown,
    companies_dropdown,
)

urlpatterns = [
    path("opportunities/statistics/", opportunity_statistics, name="opportunity-statistics"),
    path("opportunities/summary/", opportunity_summary, name="opportunity-summary"),
    path("opportunities/filters/", opportunity_filters, name="opportunity-filters"),
    path("opportunities/dropdowns/customers/", customers_dropdown, name="opportunity-customers-dropdown"),
    path("opportunities/dropdowns/companies/", companies_dropdown, name="opportunity-companies-dropdown"),
]