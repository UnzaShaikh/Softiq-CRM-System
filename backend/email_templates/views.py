from django.db.models import Q
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, PermissionDenied

from .models import EmailTemplate, TemplateActivity
from .serializers import (
    EmailTemplateListSerializer,
    EmailTemplateDetailSerializer,
    EmailTemplateWriteSerializer,
    TemplateActivitySerializer,
    TemplatePreviewSerializer,
)


class EmailTemplateViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "subject", "description"]
    ordering_fields = ["updated_at", "created_at", "name"]
    ordering = ["-updated_at"]

    # Actions where visibility (public/private) should be enforced by
    # filtering the queryset. Write/action endpoints are deliberately
    # excluded here so get_object() can still find the record and let
    # _check_owner() return a proper 403 instead of a misleading 404.
    VISIBILITY_FILTERED_ACTIONS = ("list", "retrieve")

    def get_serializer_class(self):
        if self.action == "list":
            return EmailTemplateListSerializer
        if self.action in ("create", "update", "partial_update"):
            return EmailTemplateWriteSerializer
        return EmailTemplateDetailSerializer

    def get_queryset(self):
        user = self.request.user
        qs = EmailTemplate.objects.select_related("created_by", "updated_by")

        if self.action in self.VISIBILITY_FILTERED_ACTIONS:
            # Public templates visible to all authenticated users,
            # private templates visible only to their owner.
            qs = qs.filter(Q(template_type="public") | Q(created_by=user))

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

    def _check_owner(self, instance):
        if instance.created_by_id and instance.created_by_id != self.request.user.id:
            raise PermissionDenied("You do not have permission to modify this template.")

    def perform_create(self, serializer):
        instance = serializer.save(created_by=self.request.user, updated_by=self.request.user)
        TemplateActivity.objects.create(
            template=instance, action="created", user=self.request.user,
            detail=f"Template '{instance.name}' created."
        )

    def perform_update(self, serializer):
        self._check_owner(self.get_object())
        instance = serializer.save(updated_by=self.request.user)
        TemplateActivity.objects.create(
            template=instance, action="updated", user=self.request.user,
            detail=f"Template '{instance.name}' updated."
        )

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except EmailTemplate.DoesNotExist:
            raise NotFound("Email template not found.")
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self._check_owner(instance)
        instance.is_deleted = True
        instance.save(update_fields=["is_deleted"])
        TemplateActivity.objects.create(
            template=instance, action="deleted", user=request.user,
            detail=f"Template '{instance.name}' deleted."
        )
        return Response(
            {"message": "Email template deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(detail=True, methods=["post"], url_path="duplicate")
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
            template=duplicate, action="duplicated", user=request.user,
            detail=f"Duplicated from template '{original.name}' (ID {original.id})."
        )
        serializer = EmailTemplateDetailSerializer(duplicate)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        instance = self.get_object()
        self._check_owner(instance)
        new_status = request.data.get("status")
        valid = dict(EmailTemplate.STATUS_CHOICES)
        if new_status not in valid:
            return Response(
                {"status": [f"Status must be one of {list(valid.keys())}."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance.status = new_status
        instance.updated_by = request.user
        instance.save(update_fields=["status", "updated_by", "updated_at"])
        TemplateActivity.objects.create(
            template=instance, action="status_changed", user=request.user,
            detail=f"Status changed to '{new_status}'."
        )
        return Response(EmailTemplateDetailSerializer(instance).data)

    @action(detail=True, methods=["get", "post"], url_path="preview")
    def preview(self, request, pk=None):
        instance = self.get_object()
        sample_values = {}
        if request.method == "POST":
            serializer = TemplatePreviewSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            sample_values = serializer.validated_data.get("sample_values", {})
        rendered = instance.render_preview(sample_values)
        return Response({
            "subject": instance.subject,
            "rendered_content": rendered,
            "variables_used": instance.variables_used,
        })

    @action(detail=True, methods=["get"], url_path="activity")
    def activity(self, request, pk=None):
        instance = self.get_object()
        activities = instance.activities.select_related("user").all()
        serializer = TemplateActivitySerializer(activities, many=True)
        return Response(serializer.data)