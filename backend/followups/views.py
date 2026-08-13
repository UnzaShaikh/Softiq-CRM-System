from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound

from .models import FollowUp
from .serializers import FollowUpSerializer


class FollowUpViewSet(viewsets.ModelViewSet):
    serializer_class = FollowUpSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["subject", "notes", "followup_id"]
    ordering_fields = ["due_date", "due_time", "created_at", "priority", "status"]
    ordering = ["due_date", "due_time"]

    def get_queryset(self):
        qs = FollowUp.objects.select_related(
            "customer", "lead", "deal", "company", "assigned_to", "created_by"
        )

        type_param = self.request.query_params.get("type")
        status_param = self.request.query_params.get("status")
        priority_param = self.request.query_params.get("priority")
        assigned_param = self.request.query_params.get("assigned_to")
        company_param = self.request.query_params.get("company")

        if type_param:
            qs = qs.filter(type=type_param)
        if status_param:
            qs = qs.filter(status=status_param)
        if priority_param:
            qs = qs.filter(priority=priority_param)
        if assigned_param:
            qs = qs.filter(assigned_to_id=assigned_param)
        if company_param:
            qs = qs.filter(company_id=company_param)

        return qs

    def perform_create(self, serializer):
        # created_by always comes from the authenticated user, never trusted from payload
        serializer.save(created_by=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except FollowUp.DoesNotExist:
            raise NotFound("Follow-up not found.")
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except FollowUp.DoesNotExist:
            raise NotFound("Follow-up not found.")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(
            {"message": "Follow-up deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )