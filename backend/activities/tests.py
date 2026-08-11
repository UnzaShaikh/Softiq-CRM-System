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

    # ---------------------------------------------------------
    # SEARCH TESTS
    # ---------------------------------------------------------

    def test_search_activity_by_title(self):
        res = self.client.get(
            "/api/activities/?search=Discovery"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.data.get("results", res.data)

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["title"], "Discovery Call")

    def test_search_activity_by_description(self):
        res = self.client.get(
            "/api/activities/?search=Initial"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.data.get("results", res.data)

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["title"], "Discovery Call")

    def test_search_activity_by_location(self):
        res = self.client.get(
            "/api/activities/?search=Phone"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.data.get("results", res.data)

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["title"], "Discovery Call")

    def test_search_activity_no_match(self):
        res = self.client.get(
            "/api/activities/?search=NonExistingActivity"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.data.get("results", res.data)

        self.assertEqual(len(data), 0)


    # ---------------------------------------------------------
    # STATUS FILTER TEST
    # ---------------------------------------------------------

    def test_filter_by_status(self):
        res = self.client.get(
            "/api/activities/?status=scheduled"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.data.get("results", res.data)

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["status"], "scheduled")


    # ---------------------------------------------------------
    # PRIORITY FILTER TEST
    # ---------------------------------------------------------

    def test_filter_by_priority(self):
        res = self.client.get(
            "/api/activities/?priority=high"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.data.get("results", res.data)

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["priority"], "high")


    # ---------------------------------------------------------
    # COMBINED FILTER TESTS
    # ---------------------------------------------------------

    def test_filter_by_type_and_status(self):
        res = self.client.get(
            "/api/activities/?type=call&status=scheduled"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.data.get("results", res.data)

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["type"], "call")
        self.assertEqual(data[0]["status"], "scheduled")


    def test_filter_by_type_and_priority(self):
        res = self.client.get(
            "/api/activities/?type=call&priority=high"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.data.get("results", res.data)

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["type"], "call")
        self.assertEqual(data[0]["priority"], "high")


    def test_filter_by_status_and_priority(self):
        res = self.client.get(
            "/api/activities/?status=scheduled&priority=high"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.data.get("results", res.data)

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["status"], "scheduled")
        self.assertEqual(data[0]["priority"], "high")


    # ---------------------------------------------------------
    # ORDERING TESTS
    # ---------------------------------------------------------

    def test_ordering_by_date_ascending(self):
        Activity.objects.create(
            title="Later Activity",
            type="meeting",
            status="scheduled",
            priority="low",
            date=date(2026, 8, 20),
            time=time(12, 0),
            duration=30,
            customer=self.customer,
            created_by=self.user,
        )

        res = self.client.get(
            "/api/activities/?ordering=date"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.data.get("results", res.data)

        self.assertGreaterEqual(
            data[0]["date"],
            "2026-08-15"
        )


    def test_ordering_by_date_descending(self):
        Activity.objects.create(
            title="Later Activity",
            type="meeting",
            status="scheduled",
            priority="low",
            date=date(2026, 8, 20),
            time=time(12, 0),
            duration=30,
            customer=self.customer,
            created_by=self.user,
        )

        res = self.client.get(
            "/api/activities/?ordering=-date"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.data.get("results", res.data)

        self.assertEqual(
            data[0]["date"],
            "2026-08-20"
        )


    # ---------------------------------------------------------
    # INVALID DATA TESTS
    # ---------------------------------------------------------

    def test_create_invalid_activity_type(self):
        payload = {
            "title": "Invalid Type Activity",
            "type": "invalid_type",
            "date": "2026-08-20",
            "time": "10:00",
            "duration": 30,
        }

        res = self.client.post(
            "/api/activities/",
            payload
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_400_BAD_REQUEST
        )


    def test_create_invalid_priority(self):
        payload = {
            "title": "Invalid Priority",
            "type": "call",
            "priority": "invalid_priority",
            "date": "2026-08-20",
            "time": "10:00",
            "duration": 30,
        }

        res = self.client.post(
            "/api/activities/",
            payload
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_400_BAD_REQUEST
        )


    def test_create_invalid_status(self):
        payload = {
            "title": "Invalid Status",
            "type": "call",
            "status": "invalid_status",
            "date": "2026-08-20",
            "time": "10:00",
            "duration": 30,
        }

        res = self.client.post(
            "/api/activities/",
            payload
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_400_BAD_REQUEST
        )


    def test_create_activity_without_required_title(self):
        payload = {
            "type": "call",
            "date": "2026-08-20",
            "time": "10:00",
            "duration": 30,
        }

        res = self.client.post(
            "/api/activities/",
            payload
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_400_BAD_REQUEST
        )


    def test_create_activity_without_date(self):
        payload = {
            "title": "Missing Date",
            "type": "call",
            "time": "10:00",
            "duration": 30,
        }

        res = self.client.post(
            "/api/activities/",
            payload
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_400_BAD_REQUEST
        )


    def test_create_activity_without_time(self):
        payload = {
            "title": "Missing Time",
            "type": "call",
            "date": "2026-08-20",
            "duration": 30,
        }

        res = self.client.post(
            "/api/activities/",
            payload
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_400_BAD_REQUEST
        )


    # ---------------------------------------------------------
    # DETAIL / ERROR TESTS
    # ---------------------------------------------------------

    def test_get_nonexistent_activity(self):
        res = self.client.get(
            "/api/activities/999999/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_404_NOT_FOUND
        )


    def test_update_nonexistent_activity(self):
        res = self.client.patch(
            "/api/activities/999999/",
            {"priority": "low"}
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_404_NOT_FOUND
        )


    def test_delete_nonexistent_activity(self):
        res = self.client.delete(
            "/api/activities/999999/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_404_NOT_FOUND
        )


    # ---------------------------------------------------------
    # AUTHENTICATION DETAIL TESTS
    # ---------------------------------------------------------

    def test_get_activity_by_id_requires_authentication(self):
        self.client.credentials()

        res = self.client.get(
            f"/api/activities/{self.activity.id}/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_401_UNAUTHORIZED
        )


    def test_create_activity_requires_authentication(self):
        self.client.credentials()

        payload = {
            "title": "Unauthorized Activity",
            "type": "call",
            "date": "2026-08-20",
            "time": "10:00",
            "duration": 30,
        }

        res = self.client.post(
            "/api/activities/",
            payload
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_401_UNAUTHORIZED
        )