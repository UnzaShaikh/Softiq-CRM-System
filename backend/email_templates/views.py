from django.db.models import Q, Count

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import (
    NotFound,
    PermissionDenied,
    ValidationError,
)

from .models import (
    EmailTemplate,
    TemplateActivity,
    SUPPORTED_VARIABLES,
)

from .serializers import (
    EmailTemplateListSerializer,
    EmailTemplateDetailSerializer,
    EmailTemplateWriteSerializer,
    TemplateActivitySerializer,
    TemplatePreviewSerializer,
)

from .pagination import EmailTemplatePagination


class EmailTemplateViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    pagination_class = EmailTemplatePagination

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    # ---------------------------------------------------------
    # SEARCH
    # ---------------------------------------------------------

    search_fields = [
        "name",
        "subject",
        "content",
        "description",
    ]

    # ---------------------------------------------------------
    # ORDERING
    # ---------------------------------------------------------

    ordering_fields = [
        "name",
        "subject",
        "category",
        "template_type",
        "status",
        "created_at",
        "updated_at",
    ]

    ordering = ["-updated_at"]

    # ---------------------------------------------------------
    # VISIBILITY
    # ---------------------------------------------------------

    # These actions must only expose templates that the
    # authenticated user is allowed to see.
    VISIBILITY_FILTERED_ACTIONS = (
        "list",
        "retrieve",
        "duplicate",
        "preview",
        "activity",
        "statistics",
    )

    # ---------------------------------------------------------
    # SERIALIZER
    # ---------------------------------------------------------

    def get_serializer_class(self):
        if self.action == "list":
            return EmailTemplateListSerializer

        if self.action in (
            "create",
            "update",
            "partial_update",
        ):
            return EmailTemplateWriteSerializer

        return EmailTemplateDetailSerializer

    # ---------------------------------------------------------
    # QUERY PARAMETER VALIDATION
    # ---------------------------------------------------------

    def _validate_query_params(self):
        """
        Validate supported Email Template listing query parameters.

        Invalid filter values return HTTP 400.
        """

        category_param = self.request.query_params.get("category")
        status_param = self.request.query_params.get("status")
        type_param = self.request.query_params.get("template_type")

        valid_categories = {
            value
            for value, _ in EmailTemplate.CATEGORY_CHOICES
        }

        valid_statuses = {
            value
            for value, _ in EmailTemplate.STATUS_CHOICES
        }

        valid_template_types = {
            value
            for value, _ in EmailTemplate.TEMPLATE_TYPE_CHOICES
        }

        errors = {}

        # Category validation
        if (
            category_param
            and category_param not in valid_categories
        ):
            errors["category"] = [
                "Invalid category. Must be one of: "
                f"{', '.join(sorted(valid_categories))}."
            ]

        # Status validation
        if (
            status_param
            and status_param not in valid_statuses
        ):
            errors["status"] = [
                "Invalid status. Must be one of: "
                f"{', '.join(sorted(valid_statuses))}."
            ]

        # Template type validation
        if (
            type_param
            and type_param not in valid_template_types
        ):
            errors["template_type"] = [
                "Invalid template type. Must be one of: "
                f"{', '.join(sorted(valid_template_types))}."
            ]

        if errors:
            raise ValidationError(errors)

    # ---------------------------------------------------------
    # QUERYSET
    # ---------------------------------------------------------

    def get_queryset(self):
        """
        Build the base EmailTemplate queryset.

        Uses select_related() to avoid N+1 queries when accessing
        created_by and updated_by.
        """

        self._validate_query_params()

        user = self.request.user

        qs = (
            EmailTemplate.objects
            .select_related(
                "created_by",
                "updated_by",
            )
        )

        # -----------------------------------------------------
        # VISIBILITY
        # -----------------------------------------------------

        if self.action in self.VISIBILITY_FILTERED_ACTIONS:
            qs = qs.filter(
                Q(template_type="public")
                | Q(created_by=user)
            )

        # -----------------------------------------------------
        # FILTERS
        # -----------------------------------------------------

        category_param = self.request.query_params.get("category")
        status_param = self.request.query_params.get("status")
        type_param = self.request.query_params.get("template_type")

        if category_param:
            qs = qs.filter(category=category_param)

        if status_param:
            qs = qs.filter(status=status_param)

        if type_param:
            qs = qs.filter(template_type=type_param)

        return qs

    # ---------------------------------------------------------
    # OWNER CHECK
    # ---------------------------------------------------------

    def _check_owner(self, instance):
        if (
            instance.created_by_id
            and instance.created_by_id != self.request.user.id
        ):
            raise PermissionDenied(
                "You do not have permission "
                "to modify this template."
            )

    # ---------------------------------------------------------
    # CREATE
    # ---------------------------------------------------------

    def perform_create(self, serializer):
        instance = serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user,
        )

        TemplateActivity.objects.create(
            template=instance,
            action="created",
            user=self.request.user,
            detail=(
                f"Template '{instance.name}' created."
            ),
        )

    # ---------------------------------------------------------
    # UPDATE
    # ---------------------------------------------------------

    def perform_update(self, serializer):
        instance = self.get_object()

        self._check_owner(instance)

        instance = serializer.save(
            updated_by=self.request.user
        )

        TemplateActivity.objects.create(
            template=instance,
            action="updated",
            user=self.request.user,
            detail=(
                f"Template '{instance.name}' updated."
            ),
        )

    # ---------------------------------------------------------
    # RETRIEVE
    # ---------------------------------------------------------

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except EmailTemplate.DoesNotExist:
            raise NotFound(
                "Email template not found."
            )

        serializer = self.get_serializer(instance)

        return Response(serializer.data)

    # ---------------------------------------------------------
    # DELETE
    # ---------------------------------------------------------

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        self._check_owner(instance)

        instance.is_deleted = True

        instance.save(
            update_fields=["is_deleted"]
        )

        TemplateActivity.objects.create(
            template=instance,
            action="deleted",
            user=request.user,
            detail=(
                f"Template '{instance.name}' "
                "deleted."
            ),
        )

        return Response(
            {
                "message": (
                    "Email template "
                    "deleted successfully."
                )
            },
            status=status.HTTP_204_NO_CONTENT,
        )

    # ---------------------------------------------------------
    # DUPLICATE
    # ---------------------------------------------------------

    @action(
        detail=True,
        methods=["post"],
        url_path="duplicate",
    )
    def duplicate(self, request, pk=None):
        original = self.get_object()

        duplicate = EmailTemplate.objects.create(
            name=f"{original.name} (Copy)",
            subject=original.subject,
            content=original.content,
            description=original.description,
            category=original.category,
            template_type=original.template_type,
            status=original.status,
            language=original.language,
            created_by=request.user,
            updated_by=request.user,
        )

        TemplateActivity.objects.create(
            template=duplicate,
            action="duplicated",
            user=request.user,
            detail=(
                f"Duplicated from template "
                f"'{original.name}' "
                f"(ID {original.id})."
            ),
        )

        serializer = EmailTemplateDetailSerializer(
            duplicate
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    # ---------------------------------------------------------
    # STATUS
    # ---------------------------------------------------------

    @action(
        detail=True,
        methods=["patch"],
        url_path="status",
    )
    def update_status(self, request, pk=None):
        instance = self.get_object()

        self._check_owner(instance)

        new_status = request.data.get("status")

        valid_statuses = dict(
            EmailTemplate.STATUS_CHOICES
        )

        if new_status not in valid_statuses:
            return Response(
                {
                    "status": [
                        (
                            "Status must be one of "
                            f"{list(valid_statuses.keys())}."
                        )
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.status = new_status
        instance.updated_by = request.user

        instance.save(
            update_fields=[
                "status",
                "updated_by",
                "updated_at",
            ]
        )

        TemplateActivity.objects.create(
            template=instance,
            action="status_changed",
            user=request.user,
            detail=(
                f"Status changed to "
                f"'{new_status}'."
            ),
        )

        return Response(
            EmailTemplateDetailSerializer(
                instance
            ).data
        )

    # ---------------------------------------------------------
    # PREVIEW
    # ---------------------------------------------------------

    @action(
        detail=True,
        methods=["get", "post"],
        url_path="preview",
    )
    def preview(self, request, pk=None):
        instance = self.get_object()

        sample_values = {}

        if request.method == "POST":
            serializer = TemplatePreviewSerializer(
                data=request.data
            )

            serializer.is_valid(
                raise_exception=True
            )

            sample_values = (
                serializer.validated_data.get(
                    "sample_values",
                    {},
                )
            )

        rendered = instance.render_preview(
            sample_values
        )

        return Response(
            {
                "subject": instance.subject,
                "rendered_content": rendered,
                "variables_used": (
                    instance.variables_used
                ),
            }
        )

    # ---------------------------------------------------------
    # ACTIVITY
    # ---------------------------------------------------------

    @action(
        detail=True,
        methods=["get"],
        url_path="activity",
    )
    def activity(self, request, pk=None):
        instance = self.get_object()

        # select_related prevents N+1 queries for activity users.
        activities = (
            instance.activities
            .select_related("user")
            .all()
        )

        serializer = TemplateActivitySerializer(
            activities,
            many=True,
        )

        return Response(serializer.data)

    # ---------------------------------------------------------
    # CATEGORIES
    # ---------------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="categories",
    )
    def categories(self, request):
        return Response(
            [
                {
                    "value": value,
                    "label": label,
                }
                for value, label
                in EmailTemplate.CATEGORY_CHOICES
            ]
        )

    # ---------------------------------------------------------
    # TEMPLATE TYPES
    # ---------------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="types",
    )
    def template_types(self, request):
        return Response(
            [
                {
                    "value": value,
                    "label": label,
                }
                for value, label
                in EmailTemplate.TEMPLATE_TYPE_CHOICES
            ]
        )

    # ---------------------------------------------------------
    # STATUSES
    # ---------------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="statuses",
    )
    def statuses(self, request):
        return Response(
            [
                {
                    "value": value,
                    "label": label,
                }
                for value, label
                in EmailTemplate.STATUS_CHOICES
            ]
        )

    # ---------------------------------------------------------
    # STATISTICS
    # ---------------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="statistics",
    )
    def statistics(self, request):
        """
        Return aggregated Email Template statistics.

        Counts are calculated directly by the database rather
        than loading templates into application memory.
        """

        queryset = self.get_queryset()

        # -----------------------------------------------------
        # AGGREGATED COUNTS
        # -----------------------------------------------------

        summary = queryset.aggregate(
            total=Count("id"),

            active=Count(
                "id",
                filter=Q(status="active"),
            ),

            inactive=Count(
                "id",
                filter=Q(status="inactive"),
            ),

            public=Count(
                "id",
                filter=Q(template_type="public"),
            ),

            private=Count(
                "id",
                filter=Q(template_type="private"),
            ),
        )

        # -----------------------------------------------------
        # CATEGORY COUNTS
        # -----------------------------------------------------

        category_counts = (
            queryset
            .values("category")
            .annotate(
                count=Count("id")
            )
            .order_by("category")
        )

        categories = {
            item["category"]: item["count"]
            for item in category_counts
        }

        # -----------------------------------------------------
        # RESPONSE
        # -----------------------------------------------------

        return Response(
            {
                "total": summary["total"],
                "active": summary["active"],
                "inactive": summary["inactive"],
                "public": summary["public"],
                "private": summary["private"],
                "categories": categories,
            }
        )

    # ---------------------------------------------------------
    # VARIABLES
    # ---------------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="variables",
    )
    def variables(self, request):
        variable_labels = {
            "company_name": "Company Name",
            "contact_name": "Contact Name",
            "first_name": "First Name",
            "last_name": "Last Name",
            "email": "Email",
            "date": "Date",
        }

        return Response(
            [
                {
                    "key": variable,
                    "label": variable_labels.get(
                        variable,
                        variable.replace(
                            "_",
                            " ",
                        ).title(),
                    ),
                }
                for variable in SUPPORTED_VARIABLES
            ]
        )