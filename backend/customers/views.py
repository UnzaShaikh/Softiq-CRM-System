from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from core.permissions import HasRolePermission
from .models import Customer
from .serializers import CustomerSerializer
from notifications.services import create_notification


class CustomerListCreateView(generics.ListCreateAPIView):
    """
    GET  -> List all customers
    POST -> Create a new customer
    """

    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [HasRolePermission]
    permission_module = "customers"

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "status",
    ]

    search_fields = [
        "first_name",
        "last_name",
        "email",
        "company",
    ]

    ordering_fields = [
        "created_at",
        "first_name",
        "last_name",
    ]

    ordering = [
        "-created_at",
    ]
    def perform_create(self, serializer):
        customer = serializer.save()

        create_notification(
            user=self.request.user,
            title="New Customer Added",
            message=f"A new customer has been added: {customer.first_name} {customer.last_name}.",
            notification_type="customer",
        )


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET     -> Retrieve customer
    PATCH   -> Update customer
    PUT     -> Replace customer
    DELETE  -> Delete customer
    """

    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [HasRolePermission]
    permission_module = "customers"
