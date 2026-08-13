import csv
from datetime import date, datetime, timedelta

from django.db.models import Q, Count, Case, When, IntegerField
from django.http import HttpResponse
from django.utils import timezone

from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import FollowUp
from .serializers import FollowUpSerializer


class FollowUpPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class FollowUpViewSet(viewsets.ModelViewSet):
    """
    Follow-up API.

    Supports:
    - CRUD
    - Search
    - Filtering
    - Date-range filtering
    - Ordering
    - Pagination
    - Dashboard statistics
    - Follow-up insights
    - Upcoming reminders
    - Supporting options
    - CSV export

    Visibility:
    A user can access a Follow-up when they are either:
    - the creator, or
    - the assigned user.
    """

    serializer_class = FollowUpSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = FollowUpPagination

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "subject",
        "notes",
        "followup_id",
        "customer__first_name",
        "customer__last_name",
        "lead__first_name",
        "lead__last_name",
        "deal__name",
        "company__name",
    ]

    ordering_fields = [
        "due_date",
        "due_time",
        "priority",
        "status",
        "subject",
        "created_at",
        "updated_at",
    ]

    ordering = ["due_date", "due_time"]

    VALID_TYPES = {
        value for value, _ in FollowUp.TYPE_CHOICES
    }
    VALID_PRIORITIES = {
        value for value, _ in FollowUp.PRIORITY_CHOICES
    }
    VALID_STATUSES = {
        value for value, _ in FollowUp.STATUS_CHOICES
    }

    VALID_ORDERING_FIELDS = set(ordering_fields)

    def get_queryset(self):
        """
        Return only Follow-ups visible to the authenticated user,
        then apply supported filters.
        """
        user = self.request.user

        queryset = (
            FollowUp.objects
            .select_related(
                "customer",
                "lead",
                "deal",
                "company",
                "assigned_to",
                "created_by",
            )
            .filter(
                Q(created_by=user) | Q(assigned_to=user)
            )
            .distinct()
        )

        params = self.request.query_params

        type_param = params.get("type")
        status_param = params.get("status")
        priority_param = params.get("priority")
        assigned_param = params.get("assigned_to")
        company_param = params.get("company")

        from_date = self._parse_date(
            params.get("from_date"),
            "from_date",
        )
        to_date = self._parse_date(
            params.get("to_date"),
            "to_date",
        )

        if from_date and to_date and from_date > to_date:
            raise ValidationError(
                {"date_range": "from_date cannot be greater than to_date."}
            )

        if type_param:
            self._validate_choice(
                type_param,
                self.VALID_TYPES,
                "type",
            )
            queryset = queryset.filter(type=type_param)

        if status_param:
            self._validate_choice(
                status_param,
                self.VALID_STATUSES,
                "status",
            )
            queryset = queryset.filter(status=status_param)

        if priority_param:
            self._validate_choice(
                priority_param,
                self.VALID_PRIORITIES,
                "priority",
            )
            queryset = queryset.filter(priority=priority_param)

        if assigned_param:
            try:
                assigned_id = int(assigned_param)
            except (TypeError, ValueError):
                raise ValidationError(
                    {"assigned_to": "assigned_to must be a valid user ID."}
                )

            queryset = queryset.filter(
                assigned_to_id=assigned_id
            )

        if company_param:
            try:
                company_id = int(company_param)
            except (TypeError, ValueError):
                raise ValidationError(
                    {"company": "company must be a valid company ID."}
                )

            queryset = queryset.filter(
                company_id=company_id
            )

        if from_date:
            queryset = queryset.filter(
                due_date__gte=from_date
            )

        if to_date:
            queryset = queryset.filter(
                due_date__lte=to_date
            )

        return queryset

    @staticmethod
    def _parse_date(value, field_name):
        if not value:
            return None

        try:
            return date.fromisoformat(value)
        except (TypeError, ValueError):
            raise ValidationError(
                {
                    field_name: (
                        f"Invalid date format for {field_name}. "
                        "Use YYYY-MM-DD."
                    )
                }
            )

    @staticmethod
    def _validate_choice(value, valid_values, field_name):
        if value not in valid_values:
            raise ValidationError(
                {
                    field_name: (
                        f"Invalid {field_name}. "
                        f"Allowed values: {', '.join(sorted(valid_values))}."
                    )
                }
            )

    def _validate_ordering(self, request):
        ordering = request.query_params.get("ordering")

        if not ordering:
            return

        requested_fields = [
            item.strip()
            for item in ordering.split(",")
            if item.strip()
        ]

        if not requested_fields:
            raise ValidationError(
                {"ordering": "Ordering cannot be empty."}
            )

        invalid_fields = []

        for field in requested_fields:
            clean_field = field.lstrip("-")

            if clean_field not in self.VALID_ORDERING_FIELDS:
                invalid_fields.append(field)

        if invalid_fields:
            raise ValidationError(
                {
                    "ordering": (
                        "Invalid ordering field(s): "
                        + ", ".join(invalid_fields)
                    )
                }
            )

    def _validate_pagination(self, request):
        page = request.query_params.get("page")
        page_size = request.query_params.get("page_size")

        if page is not None:
            try:
                page_number = int(page)
            except (TypeError, ValueError):
                raise ValidationError(
                    {"page": "page must be a positive integer."}
                )

            if page_number < 1:
                raise ValidationError(
                    {"page": "page must be a positive integer."}
                )

        if page_size is not None:
            try:
                requested_size = int(page_size)
            except (TypeError, ValueError):
                raise ValidationError(
                    {"page_size": "page_size must be a positive integer."}
                )

            if requested_size < 1:
                raise ValidationError(
                    {"page_size": "page_size must be at least 1."}
                )

            if requested_size > self.pagination_class.max_page_size:
                raise ValidationError(
                    {
                        "page_size": (
                            f"page_size cannot exceed "
                            f"{self.pagination_class.max_page_size}."
                        )
                    }
                )

    def list(self, request, *args, **kwargs):
        self._validate_ordering(request)
        self._validate_pagination(request)

        try:
            return super().list(request, *args, **kwargs)
        except NotFound as exc:
            raise ValidationError(
                {"page": str(exc.detail)}
            )

    def perform_create(self, serializer):
        # Never trust created_by from the request payload.
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
        try:
            instance = self.get_object()
        except FollowUp.DoesNotExist:
            raise NotFound("Follow-up not found.")

        instance.delete()

        return Response(
            {"message": "Follow-up deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )

    # =========================================================
    # Dashboard Statistics
    # =========================================================

    @action(
        detail=False,
        methods=["get"],
        url_path="statistics",
    )
    def statistics(self, request):
        queryset = self.get_queryset()

        today = timezone.localdate()
        next_seven_days = today + timedelta(days=7)

        total = queryset.count()

        upcoming = queryset.filter(
            status="upcoming",
            due_date__gte=today,
            due_date__lte=next_seven_days,
        ).count()

        completed = queryset.filter(
            status="completed",
            due_date__year=today.year,
            due_date__month=today.month,
        ).count()

        overdue = self._overdue_queryset(
            queryset,
            today,
        ).count()

        conversion_rate = (
            round((completed / total) * 100, 2)
            if total
            else 0
        )

        return Response(
            {
                "total_followups": total,
                "upcoming": upcoming,
                "completed": completed,
                "overdue": overdue,
                "conversion_rate": conversion_rate,
            },
            status=status.HTTP_200_OK,
        )

    # =========================================================
    # Follow-up Insights
    # =========================================================

    @action(
        detail=False,
        methods=["get"],
        url_path="insights",
    )
    def insights(self, request):
        queryset = self.get_queryset()

        today = timezone.localdate()
        next_seven_days = today + timedelta(days=7)

        total = queryset.count()

        upcoming = queryset.filter(
            status="upcoming",
            due_date__gte=today,
            due_date__lte=next_seven_days,
        ).count()

        completed = queryset.filter(
            status="completed",
            due_date__year=today.year,
            due_date__month=today.month,
        ).count()

        overdue = self._overdue_queryset(
            queryset,
            today,
        ).count()

        return Response(
            {
                "total": total,
                "upcoming": {
                    "count": upcoming,
                    "percentage": self._percentage(
                        upcoming,
                        total,
                    ),
                },
                "completed": {
                    "count": completed,
                    "percentage": self._percentage(
                        completed,
                        total,
                    ),
                },
                "overdue": {
                    "count": overdue,
                    "percentage": self._percentage(
                        overdue,
                        total,
                    ),
                },
            },
            status=status.HTTP_200_OK,
        )

    # =========================================================
    # Upcoming Reminders
    # =========================================================

    @action(
        detail=False,
        methods=["get"],
        url_path="reminders",
    )
    def reminders(self, request):
        limit_param = request.query_params.get("limit", "5")

        try:
            limit = int(limit_param)
        except (TypeError, ValueError):
            raise ValidationError(
                {"limit": "limit must be a positive integer."}
            )

        if limit < 1:
            raise ValidationError(
                {"limit": "limit must be at least 1."}
            )

        queryset = self.get_queryset()

        today = timezone.localdate()

        queryset = (
            queryset
            .filter(
                status="upcoming",
                due_date__gte=today,
            )
            .order_by("due_date", "due_time", "id")
        )

        total = queryset.count()
        results = queryset[:limit]

        serializer = self.get_serializer(
            results,
            many=True,
        )

        return Response(
            {
                "count": total,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    # =========================================================
    # Supporting Options
    # =========================================================

    @action(
        detail=False,
        methods=["get"],
        url_path="options",
    )
    def options(self, request):
        return Response(
            {
                "types": [
                    {"value": value, "label": label}
                    for value, label in FollowUp.TYPE_CHOICES
                ],
                "priorities": [
                    {"value": value, "label": label}
                    for value, label in FollowUp.PRIORITY_CHOICES
                ],
                "statuses": [
                    {"value": value, "label": label}
                    for value, label in FollowUp.STATUS_CHOICES
                ],
            },
            status=status.HTTP_200_OK,
        )

    # =========================================================
    # Export
    # =========================================================

    @action(
        detail=False,
        methods=["get"],
        url_path="export",
    )
    def export(self, request):
        self._validate_ordering(request)

        queryset = self.filter_queryset(
            self.get_queryset()
        )

        # Export should contain the complete filtered dataset,
        # not only the current pagination page.

        response = HttpResponse(
            content_type="text/csv"
        )
        response["Content-Disposition"] = (
            'attachment; filename="followups.csv"'
        )

        writer = csv.writer(response)

        writer.writerow(
            [
                "Follow-up ID",
                "Subject",
                "Related To",
                "Company",
                "Type",
                "Due Date",
                "Due Time",
                "Priority",
                "Status",
                "Assigned To",
            ]
        )

        for followup in queryset:
            related_to = self._related_to(followup)

            assigned_to = (
                followup.assigned_to.username
                if followup.assigned_to
                else ""
            )

            writer.writerow(
                [
                    followup.followup_id,
                    followup.subject,
                    related_to,
                    followup.company.name
                    if followup.company
                    else "",
                    followup.get_type_display(),
                    followup.due_date.isoformat()
                    if followup.due_date
                    else "",
                    followup.due_time.strftime("%H:%M")
                    if followup.due_time
                    else "",
                    followup.get_priority_display(),
                    followup.get_status_display(),
                    assigned_to,
                ]
            )

        return response

    # =========================================================
    # Internal helpers
    # =========================================================

    @staticmethod
    def _related_to(followup):
        if followup.customer:
            return (
                f"{followup.customer.first_name} "
                f"{followup.customer.last_name}"
            )

        if followup.lead:
            return (
                f"{followup.lead.first_name} "
                f"{followup.lead.last_name}"
            )

        if followup.deal:
            return followup.deal.name

        return ""

    @staticmethod
    def _percentage(value, total):
        if not total:
            return 0

        return round((value / total) * 100, 2)

    @staticmethod
    def _overdue_queryset(queryset, today):
        """
        Overdue logic:
        - Explicitly overdue records are overdue.
        - Upcoming records with a past due date are overdue.
        - Completed/cancelled records are never counted as overdue.
        """
        return queryset.filter(
            Q(status="overdue")
            | Q(
                status="upcoming",
                due_date__lt=today,
            )
        ).exclude(
            status__in=["completed", "cancelled"]
        )
