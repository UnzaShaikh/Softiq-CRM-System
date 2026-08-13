from datetime import date, time, timedelta
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from .models import FollowUp
from customers.models import Customer
from companies.models import Company

User = get_user_model()


class FollowUpAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="pass1234")
        self.other_user = User.objects.create_user(username="other", password="pass1234")
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

        self.customer = Customer.objects.create(
            first_name="Ahmed", last_name="Ali", email="ahmed@example.com",
            phone="1234567890", company="Test Co"
        )
        self.company = Company.objects.create(name="Acme Corp")

        self.followup = FollowUp.objects.create(
            subject="Send proposal",
            notes="Draft and send pricing proposal",
            customer=self.customer,
            company=self.company,
            type="email",
            priority="high",
            status="upcoming",
            due_date=date.today() + timedelta(days=3),
            due_time=time(14, 0),
            assigned_to=self.user,
            created_by=self.user,
        )

    def test_followup_id_generated(self):
        self.assertTrue(self.followup.followup_id.startswith("FU"))

    def test_followup_id_unique_and_sequential(self):
        second = FollowUp.objects.create(
            subject="Second follow-up",
            type="call",
            due_date=date.today() + timedelta(days=1),
            created_by=self.user,
        )
        self.assertNotEqual(self.followup.followup_id, second.followup_id)

    def test_create_followup(self):
        payload = {
            "subject": "Call client",
            "type": "call",
            "priority": "medium",
            "status": "upcoming",
            "due_date": str(date.today() + timedelta(days=1)),
            "due_time": "10:00",
            "customer": self.customer.id,
            "company": self.company.id,
            "assigned_to": self.user.id,
            "notes": "Discuss contract renewal",
        }
        res = self.client.post("/api/followups/", payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data["followup_id"].startswith("FU"))
        self.assertEqual(res.data["related_type"], "Customer")

    def test_create_missing_subject_rejected(self):
        payload = {"type": "call", "due_date": str(date.today())}
        res = self.client.post("/api/followups/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_missing_due_date_rejected(self):
        payload = {"subject": "No due date", "type": "call"}
        res = self.client.post("/api/followups/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_invalid_type_rejected(self):
        payload = {
            "subject": "Bad type",
            "type": "not_a_real_type",
            "due_date": str(date.today()),
        }
        res = self.client.post("/api/followups/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_invalid_priority_rejected(self):
        payload = {
            "subject": "Bad priority",
            "type": "call",
            "priority": "urgent",
            "due_date": str(date.today()),
        }
        res = self.client.post("/api/followups/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_invalid_status_rejected(self):
        payload = {
            "subject": "Bad status",
            "type": "call",
            "status": "in_progress",
            "due_date": str(date.today()),
        }
        res = self.client.post("/api/followups/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_invalid_related_record_rejected(self):
        payload = {
            "subject": "Bad customer",
            "type": "call",
            "due_date": str(date.today()),
            "customer": 999999,
        }
        res = self.client.post("/api/followups/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_invalid_company_rejected(self):
        payload = {
            "subject": "Bad company",
            "type": "call",
            "due_date": str(date.today()),
            "company": 999999,
        }
        res = self.client.post("/api/followups/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_multiple_related_objects_rejected(self):
        from leads.models import Lead
        lead = Lead.objects.create(
            first_name="Zara", last_name="Malik", email="zara@example.com",
            phone="1112223333", company="LeadCo"
        )
        payload = {
            "subject": "Conflict",
            "type": "call",
            "due_date": str(date.today()),
            "customer": self.customer.id,
            "lead": lead.id,
        }
        res = self.client.post("/api/followups/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_created_by_not_trusted_from_payload(self):
        payload = {
            "subject": "Spoof attempt",
            "type": "task",
            "due_date": str(date.today()),
            "created_by": self.other_user.id,
        }
        res = self.client.post("/api/followups/", payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["created_by"], self.user.id)

    def test_list_followups(self):
        res = self.client.get("/api/followups/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_get_followup_by_id(self):
        res = self.client.get(f"/api/followups/{self.followup.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["subject"], "Send proposal")
        self.assertEqual(res.data["company_name"], "Acme Corp")

    def test_get_nonexistent_followup_404(self):
        res = self.client.get("/api/followups/999999/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_followup(self):
        res = self.client.patch(f"/api/followups/{self.followup.id}/", {"priority": "low"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["priority"], "low")

    def test_update_status(self):
        res = self.client.patch(f"/api/followups/{self.followup.id}/", {"status": "completed"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], "completed")

    def test_is_overdue_false_for_future_due_date(self):
        res = self.client.get(f"/api/followups/{self.followup.id}/")
        self.assertFalse(res.data["is_overdue"])

    def test_is_overdue_true_for_past_due_date(self):
        overdue = FollowUp.objects.create(
            subject="Past due",
            type="task",
            status="upcoming",
            due_date=date.today() - timedelta(days=2),
            created_by=self.user,
        )
        res = self.client.get(f"/api/followups/{overdue.id}/")
        self.assertTrue(res.data["is_overdue"])

    def test_is_overdue_false_when_cancelled(self):
        cancelled = FollowUp.objects.create(
            subject="Cancelled past due",
            type="task",
            status="cancelled",
            due_date=date.today() - timedelta(days=2),
            created_by=self.user,
        )
        res = self.client.get(f"/api/followups/{cancelled.id}/")
        self.assertFalse(res.data["is_overdue"])

    def test_filter_by_status(self):
        res = self.client.get("/api/followups/?status=upcoming")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_filter_by_type(self):
        res = self.client.get("/api/followups/?type=email")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_filter_by_priority(self):
        res = self.client.get("/api/followups/?priority=high")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_filter_by_assigned_to(self):
        res = self.client.get(f"/api/followups/?assigned_to={self.user.id}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_delete_followup(self):
        res = self.client.delete(f"/api/followups/{self.followup.id}/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_nonexistent_followup_404(self):
        res = self.client.delete("/api/followups/999999/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_rejected(self):
        self.client.credentials()
        res = self.client.get("/api/followups/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_create_rejected(self):
        self.client.credentials()
        payload = {"subject": "No auth", "type": "call", "due_date": str(date.today())}
        res = self.client.post("/api/followups/", payload)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)