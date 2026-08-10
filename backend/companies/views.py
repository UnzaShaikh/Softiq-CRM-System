from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound
from django.db.models import Count, Q, Subquery, OuterRef, IntegerField
from django.db.models.functions import Coalesce

from .models import Company
from .serializers import CompanySerializer
from contacts.models import Contact
from deals.models import Deal  # adjust to your actual app


class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "industry", "email"]
    ordering_fields = ["name", "created_at", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        # Annotate counts in one query instead of per-object N+1 lookups
        contacts_sq = (
            Contact.objects.filter(company=OuterRef("name"))
            .values("company")
            .annotate(c=Count("id"))
            .values("c")
        )
        deals_sq = (
            Deal.objects.filter(customer__company=OuterRef("name"))
            .values("customer__company")
            .annotate(c=Count("id"))
            .values("c")
        )

        qs = Company.objects.select_related("created_by").annotate(
            _contacts_count=Coalesce(Subquery(contacts_sq, output_field=IntegerField()), 0),
            _deals_count=Coalesce(Subquery(deals_sq, output_field=IntegerField()), 0),
        )
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Company.DoesNotExist:
            raise NotFound("Company not found.")
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Company deleted successfully."}, status=status.HTTP_204_NO_CONTENT)