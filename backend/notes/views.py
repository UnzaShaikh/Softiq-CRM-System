from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound

from core.permissions import HasRolePermission
from .models import Note, NoteCategory
from .serializers import NoteSerializer, NoteCategorySerializer


class NoteCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = NoteCategorySerializer
    permission_classes = [HasRolePermission]
    permission_module = "notes"
    queryset = NoteCategory.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [HasRolePermission]
    permission_module = "notes"

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "title",
        "content",
    ]

    ordering_fields = [
        "title",
        "created_at",
        "updated_at",
        "pinned",
        "archived",
        "priority",
    ]

    ordering = [
        "-pinned",
        "-created_at",
    ]

    def get_queryset(self):
        qs = (
            Note.objects
            .select_related(
                "category",
                "customer",
                "lead",
                "deal",
                "created_by",
            )
        )

        category_param = self.request.query_params.get("category")
        priority_param = self.request.query_params.get("priority")
        pinned_param = self.request.query_params.get("pinned")
        archived_param = self.request.query_params.get("archived")
        tag_param = self.request.query_params.get("tag")

        # Category filter
        if category_param:
            qs = qs.filter(category_id=category_param)

        # Priority filter
        if priority_param:
            qs = qs.filter(priority=priority_param.lower())

        # Pinned filter
        if pinned_param is not None:
            qs = qs.filter(
                pinned=pinned_param.lower() == "true"
            )

        # Archived filter
        if archived_param is not None:
            qs = qs.filter(
                archived=archived_param.lower() == "true"
            )
        elif self.action == "list":
            # Hide archived notes by default
            qs = qs.filter(archived=False)

        # Tag filter
        if tag_param:
            qs = qs.filter(
                tags__contains=[tag_param]
            )

        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Note.DoesNotExist:
            raise NotFound("Note not found.")

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()

        return Response(
            {"message": "Note deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(
        detail=True,
        methods=["patch"],
        url_path="pin",
    )
    def pin(self, request, pk=None):
        instance = self.get_object()
        instance.pinned = True
        instance.save(update_fields=["pinned"])

        return Response(
            NoteSerializer(instance).data
        )

    @action(
        detail=True,
        methods=["patch"],
        url_path="unpin",
    )
    def unpin(self, request, pk=None):
        instance = self.get_object()
        instance.pinned = False
        instance.save(update_fields=["pinned"])

        return Response(
            NoteSerializer(instance).data
        )

    @action(
        detail=True,
        methods=["patch"],
        url_path="archive",
    )
    def archive(self, request, pk=None):
        instance = self.get_object()
        instance.archived = True
        instance.save(update_fields=["archived"])

        return Response(
            NoteSerializer(instance).data
        )

    @action(
        detail=True,
        methods=["patch"],
        url_path="unarchive",
    )
    def unarchive(self, request, pk=None):
        instance = self.get_object()
        instance.archived = False
        instance.save(update_fields=["archived"])

        return Response(
            NoteSerializer(instance).data
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="summary",
    )
    def summary(self, request):
        queryset = Note.objects.all()

        return Response({
            "total_notes": queryset.count(),

            "categories": (
                queryset
                .filter(category__isnull=False)
                .values("category")
                .distinct()
                .count()
            ),

            "pinned": queryset.filter(
                pinned=True
            ).count(),

            "archived": queryset.filter(
                archived=True
            ).count(),
        })

    @action(
        detail=False,
        methods=["get"],
        url_path="options",
    )
    def options(self, request):
        categories = NoteCategory.objects.all()

        return Response({
            "categories": NoteCategorySerializer(
                categories,
                many=True,
            ).data,

            "priorities": [
                {
                    "value": value,
                    "label": label,
                }
                for value, label in Note.PRIORITY_CHOICES
            ],

            "statuses": {
                "pinned": [
                    {
                        "value": True,
                        "label": "Pinned",
                    },
                    {
                        "value": False,
                        "label": "Not Pinned",
                    },
                ],

                "archived": [
                    {
                        "value": True,
                        "label": "Archived",
                    },
                    {
                        "value": False,
                        "label": "Active",
                    },
                ],
            },
        })