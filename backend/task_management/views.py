from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Task, ChecklistItem, TaskAttachment
from .serializers import (
    TaskSerializer,
    TaskWriteSerializer,
    ChecklistItemSerializer,
    TaskAttachmentSerializer,
)
from .permissions import IsTaskOwnerOrAdmin
from .filters import TaskFilter

from notifications.services import create_notification


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.select_related(
        'assignee',
        'created_by',
        'updated_by',
        'related_content_type'
    ).prefetch_related(
        'tags',
        'checklist_items',
        'attachments'
    ).all()

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    filterset_class = TaskFilter

    search_fields = [
        'title',
        'description'
    ]

    ordering_fields = [
        'created_at',
        'due_date',
        'priority',
        'status',
        'assignee__username',
        'title'
    ]

    ordering = ['-created_at']

    permission_classes = [
        permissions.IsAuthenticated,
        IsTaskOwnerOrAdmin
    ]

    def get_serializer_class(self):
        if self.action in [
            'create',
            'update',
            'partial_update'
        ]:
            return TaskWriteSerializer

        return TaskSerializer

    def perform_create(self, serializer):
        task = serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user,
        )

        # Notify the assigned user when a task is assigned.
        # Do not notify the creator if they assigned the task to themselves.
        if (
            task.assignee
            and task.assignee != self.request.user
        ):
            create_notification(
                user=task.assignee,
                title="Task Assigned",
                message=(
                    f'You have been assigned the task '
                    f'"{task.title}".'
                ),
                notification_type="task_assigned",
                source_type="task",
                source_id=task.id,
            )

    def perform_update(self, serializer):
        old_assignee_id = serializer.instance.assignee_id

        task = serializer.save(
            updated_by=self.request.user
        )

        # Notify only when the assignee actually changes.
        if (
            task.assignee
            and task.assignee_id != old_assignee_id
            and task.assignee != self.request.user
        ):
            create_notification(
                user=task.assignee,
                title="Task Assigned",
                message=(
                    f'You have been assigned the task '
                    f'"{task.title}".'
                ),
                notification_type="task_assigned",
                source_type="task",
                source_id=task.id,
            )

    @action(detail=False, methods=['get'])
    def summary(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        status_counts = {
            status_value: queryset.filter(
                status=status_value
            ).count()
            for status_value, _ in Task.STATUS_CHOICES
        }

        return Response({
            'total': queryset.count(),
            'status_counts': status_counts,
        })

    @action(detail=False, methods=['get'])
    def kanban(self, request):
        statuses = [
            status_value
            for status_value, _ in Task.STATUS_CHOICES
        ]

        base_qs = self.filter_queryset(
            self.get_queryset()
        )

        result = {}

        for status_value in statuses:
            qs = base_qs.filter(
                status=status_value
            )

            serializer = TaskSerializer(
                qs,
                many=True,
                context={'request': request}
            )

            result[status_value] = serializer.data

        return Response(result)

    @action(
        detail=True,
        methods=['patch'],
        url_path='status'
    )
    def update_status(self, request, pk=None):
        task = self.get_object()

        new_status = request.data.get('status')

        valid_statuses = dict(
            Task.STATUS_CHOICES
        )

        if new_status not in valid_statuses:
            return Response(
                {
                    'status': (
                        f"Must be one of "
                        f"{list(valid_statuses)}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        task.status = new_status
        task.updated_by = request.user

        task.save(
            update_fields=[
                'status',
                'updated_by',
                'updated_at'
            ]
        )

        return Response(
            TaskSerializer(
                task,
                context={'request': request}
            ).data
        )

    @action(
        detail=True,
        methods=['post'],
        parser_classes=[
            MultiPartParser,
            FormParser
        ]
    )
    def upload_attachment(self, request, pk=None):
        task = self.get_object()

        serializer = TaskAttachmentSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save(
            task=task,
            uploaded_by=request.user
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    @action(
        detail=True,
        methods=['delete'],
        url_path=r'attachments/(?P<attachment_id>\d+)'
    )
    def delete_attachment(
        self,
        request,
        pk=None,
        attachment_id=None
    ):
        task = self.get_object()

        try:
            attachment = task.attachments.get(
                id=attachment_id
            )
        except TaskAttachment.DoesNotExist:
            return Response(
                {
                    'detail': 'Attachment not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Delete the file if it exists.
        try:
            if (
                attachment.file
                and attachment.file.storage.exists(
                    attachment.file.name
                )
            ):
                attachment.file.delete(
                    save=False
                )
        except Exception:
            # If the file does not exist,
            # continue with deleting the record.
            pass

        attachment.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


class ChecklistItemViewSet(viewsets.ModelViewSet):
    queryset = ChecklistItem.objects.select_related(
        'task'
    ).all()

    serializer_class = ChecklistItemSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):
        qs = super().get_queryset()

        task_id = self.request.query_params.get(
            'task'
        )

        if task_id:
            qs = qs.filter(
                task_id=task_id
            )

        return qs

    @action(
        detail=True,
        methods=['patch']
    )
    def toggle(self, request, pk=None):
        item = self.get_object()

        item.is_completed = not item.is_completed

        item.save(
            update_fields=['is_completed']
        )

        return Response(
            ChecklistItemSerializer(item).data
        )