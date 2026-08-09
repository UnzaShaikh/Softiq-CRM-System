from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Contact
from .serializers import ContactSerializer


class ContactViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Contacts.

    GET    /api/contacts/           -> list all contacts
    POST   /api/contacts/           -> create a contact
    GET    /api/contacts/{id}/      -> retrieve a single contact
    PUT    /api/contacts/{id}/      -> update a contact
    PATCH  /api/contacts/{id}/      -> partially update a contact
    DELETE /api/contacts/{id}/      -> delete a contact
    """

    queryset = Contact.objects.select_related("created_by").all()
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "company"]
    search_fields = ["full_name", "company", "email", "job_title"]
    ordering_fields = ["full_name", "company", "status", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(
            {"detail": "Contact deleted successfully."},
            status=status.HTTP_200_OK,
        )
    @action(detail=False, methods=["get"], url_path="status-options")
    def status_options(self, request):
        return Response({
            "status_options": [
                {
                    "value": value,
                    "label": label
                }
                for value, label in Contact.STATUS_CHOICES
            ]
        })