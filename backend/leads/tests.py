from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Lead

User = get_user_model()


class LeadAPITestCase(APITestCase):

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

        self.lead = Lead.objects.create(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            phone="03001234567",
            company="SoftiqTech",
            source="website",
            status="new",
            score=72,
        )

    def test_list_requires_auth(self):
        self.client.credentials()
        response = self.client.get("/api/leads/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_lead(self):
        data = {
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane@example.com",
            "phone": "03111234567",
            "company": "CRM",
            "source": "referral",
            "status": "contacted",
            "score": 40,
        }

        response = self.client.post("/api/leads/", data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Lead.objects.count(), 2)

    def test_create_lead_defaults(self):
        data = {
            "first_name": "Ali",
            "last_name": "Khan",
            "email": "ali@example.com",
            "phone": "03121234567",
            "company": "Nexus",
        }

        response = self.client.post("/api/leads/", data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["source"], "website")
        self.assertEqual(response.data["status"], "new")
        self.assertEqual(response.data["score"], 0)

    def test_get_all_leads(self):
        response = self.client.get("/api/leads/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_lead_by_id(self):
        response = self.client.get(f"/api/leads/{self.lead.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.lead.email)

    def test_update_lead(self):
        response = self.client.patch(
            f"/api/leads/{self.lead.id}/",
            {"status": "qualified", "score": 90},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.lead.refresh_from_db()
        self.assertEqual(self.lead.status, "qualified")
        self.assertEqual(self.lead.score, 90)

    def test_delete_lead(self):
        response = self.client.delete(f"/api/leads/{self.lead.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_duplicate_email(self):
        data = {
            "first_name": "Duplicate",
            "last_name": "User",
            "email": "john@example.com",
            "phone": "03331234567",
            "company": "ABC",
        }

        response = self.client.post("/api/leads/", data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_score(self):
        data = {
            "first_name": "Negative",
            "last_name": "Score",
            "email": "neg@example.com",
            "phone": "03331234568",
            "company": "ABC",
            "score": -5,
        }

        response = self.client.post("/api/leads/", data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_search_lead(self):
        response = self.client.get("/api/leads/?search=John")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_filter_lead_by_status(self):
        Lead.objects.create(
            first_name="Jane",
            last_name="Smith",
            email="jane@example.com",
            phone="03111234567",
            company="CRM",
            status="qualified",
        )

        response = self.client.get("/api/leads/?status=qualified")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_filter_lead_by_source(self):
        response = self.client.get("/api/leads/?source=website")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_ordering_lead_by_score(self):
        Lead.objects.create(
            first_name="Jane",
            last_name="Smith",
            email="jane@example.com",
            phone="03111234567",
            company="CRM",
            score=95,
        )

        response = self.client.get("/api/leads/?ordering=-score")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["score"], 95)

    def test_pagination_shape(self):
        response = self.client.get("/api/leads/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("count", response.data)
        self.assertIn("next", response.data)
        self.assertIn("previous", response.data)
        self.assertIn("results", response.data)
