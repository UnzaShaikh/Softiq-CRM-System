from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from customers.models import Customer
from deals.models import Deal

User = get_user_model()


class PipelineAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="admin",
            email="admin@test.com",
            password="admin123"
        )

        response = self.client.post(
            reverse("token_obtain_pair"),
            {
                "email": "admin@test.com",
                "password": "admin123"
            },
            format="json"
        )

        self.token = response.data["access"]

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.token}"
        )

        self.customer = Customer.objects.create(
            first_name="John",
            last_name="Doe",
            email="john@test.com",
            phone="03001234567",
            company="Softiq Technologies"
        )

        Deal.objects.create(
            name="CRM Project",
            customer=self.customer,
            value=25000,
            stage="closed_won",
            probability=100,
            expected_close_date="2026-12-31",
            created_by=self.user
        )

    def test_pipeline_summary(self):
        response = self.client.get(
            reverse("pipeline-summary")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    def test_stage_distribution(self):
        response = self.client.get(
            reverse("pipeline-stages")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    def test_recent_deals(self):
        response = self.client.get(
            reverse("pipeline-recent-deals")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    def test_pipeline_performance(self):
        response = self.client.get(
            reverse("pipeline-performance")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    def test_pipeline_trends(self):
        response = self.client.get(
            reverse("pipeline-trends")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    def test_pipeline_stage_deals(self):
        response = self.client.get(
            reverse(
                "pipeline-stage-deals",
                kwargs={"stage": "closed_won"}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    def test_invalid_stage(self):
        response = self.client.get(
            reverse(
                "pipeline-stage-deals",
                kwargs={"stage": "invalid-stage"}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    def test_authentication_required(self):
        self.client.credentials()

        response = self.client.get(
            reverse("pipeline-summary")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )