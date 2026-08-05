from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Customer

User = get_user_model()


class CustomerAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
    username="testuser",
    email="test@example.com",
    password="TestPassword123",
    first_name="Test",
    last_name="User",
)

        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        self.customer = Customer.objects.create(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            phone="03001234567",
            company="SoftiqTech",
            status="active",
        )

    def test_create_customer(self):
        data = {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane@example.com",
            "phone": "03111234567",
            "company": "CRM",
            "status": "lead",
        }

        response = self.client.post("/api/customers/", data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Customer.objects.count(), 2)

    def test_get_all_customers(self):
        response = self.client.get("/api/customers/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_customer_by_id(self):
        response = self.client.get(f"/api/customers/{self.customer.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.customer.email)

    def test_update_customer(self):
        response = self.client.patch(
            f"/api/customers/{self.customer.id}/",
            {"company": "Updated Company"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.customer.refresh_from_db()
        self.assertEqual(self.customer.company, "Updated Company")

    def test_delete_customer(self):
        response = self.client.delete(f"/api/customers/{self.customer.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_duplicate_email(self):
        data = {
            "first_name": "Duplicate",
            "last_name": "User",
            "email": "john@example.com",
            "phone": "03331234567",
            "company": "ABC",
            "status": "active",
        }

        response = self.client.post("/api/customers/", data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_search_customer(self):
        response = self.client.get("/api/customers/?search=John")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filter_customer(self):
        response = self.client.get("/api/customers/?status=active")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_ordering_customer(self):
        response = self.client.get("/api/customers/?ordering=first_name")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_pagination(self):
        response = self.client.get("/api/customers/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
