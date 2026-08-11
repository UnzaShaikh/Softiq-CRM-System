from datetime import date, time
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from .models import Activity
from customers.models import Customer

User = get_user_model()


class ActivityAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="pass1234")
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

        self.customer = Customer.objects.create(
            first_name="Ahmed", last_name="Ali", email="ahmed@example.com",
            phone="1234567890", company="Test Co"
        )

        self.activity = Activity.objects.create(
            title="Discovery Call",
            type="call",
            status="scheduled",
            priority="high",
            date=date(2026, 8, 15),
            time=time(10, 0),
            duration=30,
            customer=self.customer,
            description="Initial call",
            location="Phone",
            created_by=self.user,
        )

    def test_create_activity(self):
        payload = {
            "title": "Product Demo",
            "type": "meeting",
            "priority": "medium",
            "date": "2026-08-20",
            "time": "14:00",
            "duration": 60,
            "customer": self.customer.id,
            "description": "Live demo",
            "location": "Zoom",
        }
        res = self.client.post("/api/activities/", payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["status"], "scheduled")  # default

    def test_create_invalid_duration(self):
        payload = {
            "title": "Bad Duration",
            "type": "call",
            "date": "2026-08-20",
            "time": "10:00",
            "duration": 0,
        }
        res = self.client.post("/api/activities/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_multiple_related_objects_rejected(self):
        from leads.models import Lead
        lead = Lead.objects.create(
            first_name="Zara", last_name="Malik", email="zara@example.com",
            phone="1112223333", company="LeadCo"
        )
        payload = {
            "title": "Conflict Test",
            "type": "call",
            "date": "2026-08-20",
            "time": "10:00",
            "duration": 15,
            "customer": self.customer.id,
            "lead": lead.id,
        }
        res = self.client.post("/api/activities/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_activities(self):
        res = self.client.get("/api/activities/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_filter_by_type(self):
        res = self.client.get("/api/activities/?type=call")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_get_activity_by_id(self):
        res = self.client.get(f"/api/activities/{self.activity.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["title"], "Discovery Call")
        self.assertEqual(res.data["related_type"], "Customer")

    def test_update_activity(self):
        res = self.client.patch(f"/api/activities/{self.activity.id}/", {"priority": "low"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["priority"], "low")

    def test_update_status_endpoint(self):
        res = self.client.patch(
            f"/api/activities/{self.activity.id}/status/", {"status": "completed"}
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], "completed")

    def test_update_status_invalid_value(self):
        res = self.client.patch(
            f"/api/activities/{self.activity.id}/status/", {"status": "not_a_status"}
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_activity(self):
        res = self.client.delete(f"/api/activities/{self.activity.id}/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

    def test_unauthenticated_rejected(self):
        self.client.credentials()
        res = self.client.get("/api/activities/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)