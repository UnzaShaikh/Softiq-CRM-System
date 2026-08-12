from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound

from .models import Note, NoteCategory
from .serializers import NoteSerializer, NoteCategorySerializer


class NoteCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = NoteCategorySerializer
    permission_classes = [IsAuthenticated]
    queryset = NoteCategory.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "content"]
    ordering_fields = ["created_at", "updated_at", "pinned"]
    ordering = ["-pinned", "-created_at"]

    def get_queryset(self):
        qs = Note.objects.select_related("category", "customer", "lead", "deal", "created_by")

        category_param = self.request.query_params.get("category")
        pinned_param = self.request.query_params.get("pinned")
        archived_param = self.request.query_params.get("archived")
        tag_param = self.request.query_params.get("tag")

        if category_param:
            qs = qs.filter(category_id=category_param)
        if pinned_param is not None:
            qs = qs.filter(pinned=pinned_param.lower() == "true")

        if archived_param is not None:
            qs = qs.filter(archived=archived_param.lower() == "true")
        elif self.action == "list":
            # Default: hide archived notes only on the list view.
            # Detail actions (retrieve/update/delete/pin/unpin/archive/unarchive)
            # must still be able to find archived notes via get_object().
            qs = qs.filter(archived=False)

        if tag_param:
            qs = qs.filter(tags__contains=[tag_param])

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
        return Response({"message": "Note deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["patch"], url_path="pin")
    def pin(self, request, pk=None):
        instance = self.get_object()
        instance.pinned = True
        instance.save(update_fields=["pinned"])
        return Response(NoteSerializer(instance).data)

    @action(detail=True, methods=["patch"], url_path="unpin")
    def unpin(self, request, pk=None):
        instance = self.get_object()
        instance.pinned = False
        instance.save(update_fields=["pinned"])
        return Response(NoteSerializer(instance).data)

    @action(detail=True, methods=["patch"], url_path="archive")
    def archive(self, request, pk=None):
        instance = self.get_object()
        instance.archived = True
        instance.save(update_fields=["archived"])
        return Response(NoteSerializer(instance).data)

    @action(detail=True, methods=["patch"], url_path="unarchive")
    def unarchive(self, request, pk=None):
        instance = self.get_object()
        instance.archived = False
        instance.save(update_fields=["archived"])
        return Response(NoteSerializer(instance).data)