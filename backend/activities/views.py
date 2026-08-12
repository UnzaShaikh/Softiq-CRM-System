from django.contrib.auth import get_user_model
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound
from django.db.models import Count, Q

from .models import Activity
from .serializers import ActivitySerializer, ActivityStatusUpdateSerializer

User = get_user_model()


class ActivityViewSet(viewsets.ModelViewSet):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "location"]
    ordering_fields = ["date", "time", "created_at", "priority", "title", "type", "status", "assigned_to__username"]
    ordering = ["-date", "-time"]

    def get_queryset(self):
        qs = Activity.objects.select_related(
            "customer", "lead", "deal", "assigned_to", "created_by"
        )

        # Manual query-param filtering
        type_param = self.request.query_params.get("type")
        status_param = self.request.query_params.get("status")
        priority_param = self.request.query_params.get("priority")
        assigned_to_param = self.request.query_params.get("assigned_to")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")

        if type_param:
            qs = qs.filter(type=type_param)

        if status_param:
            qs = qs.filter(status=status_param)

        if priority_param:
            qs = qs.filter(priority=priority_param)

        if assigned_to_param:
            qs = qs.filter(assigned_to_id=assigned_to_param)

        if date_from:
            qs = qs.filter(date__gte=date_from)

        if date_to:
            qs = qs.filter(date__lte=date_to)

        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Activity.DoesNotExist:
            raise NotFound("Activity not found.")
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Activity deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        instance = self.get_object()
        serializer = ActivityStatusUpdateSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ActivitySerializer(instance).data)

    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        counts = Activity.objects.aggregate(
            total=Count("id"),
            scheduled=Count("id", filter=Q(status="scheduled")),
            completed=Count("id", filter=Q(status="completed")),
            cancelled=Count("id", filter=Q(status="cancelled")),
            overdue=Count("id", filter=Q(status="overdue")),
        )
        return Response(
            {
                "total_activities": counts["total"],
                "scheduled": counts["scheduled"],
                "completed": counts["completed"],
                "cancelled": counts["cancelled"],
                "overdue": counts["overdue"],
            }
        )

    @action(detail=False, methods=["get"], url_path="dropdowns")
    def dropdowns(self, request):
        from customers.models import Customer
        from leads.models import Lead
        from deals.models import Deal

        def _name(first, last):
            return f"{first} {last}".strip()

        return Response(
            {
                "users": [
                    {
                        "id": user.id,
                        "username": user.username,
                        "name": _name(user.first_name, user.last_name) or user.username,
                    }
                    for user in User.objects.order_by("username")
                ],
                "customers": [
                    {"id": c.id, "name": _name(c.first_name, c.last_name)}
                    for c in Customer.objects.order_by("first_name", "last_name")
                ],
                "leads": [
                    {"id": lead.id, "name": _name(lead.first_name, lead.last_name)}
                    for lead in Lead.objects.order_by("first_name", "last_name")
                ],
                "deals": [
                    {"id": deal.id, "name": deal.name}
                    for deal in Deal.objects.order_by("name")
                ],
            }
        )