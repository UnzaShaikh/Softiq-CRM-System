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
    """
    API test suite for the Follow-up module.

    Covers:
    - CRUD
    - Search
    - Filtering
    - Combined filtering
    - Date range filtering
    - Pagination
    - Ordering
    - Total records
    - Dashboard statistics
    - Follow-up insights
    - Upcoming reminders
    - Supporting options
    - Export
    - Validation / invalid parameters
    - Authentication
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="tester",
            password="pass1234",
        )

        self.other_user = User.objects.create_user(
            username="other",
            password="pass1234",
        )

        token = RefreshToken.for_user(self.user)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token.access_token}"
        )

        self.customer = Customer.objects.create(
            first_name="Ahmed",
            last_name="Ali",
            email="ahmed@example.com",
            phone="1234567890",
            company="Test Co",
        )

        self.second_customer = Customer.objects.create(
            first_name="Sara",
            last_name="Khan",
            email="sara@example.com",
            phone="0987654321",
            company="Second Co",
        )

        self.company = Company.objects.create(
            name="Acme Corp"
        )

        self.second_company = Company.objects.create(
            name="Tech Solutions"
        )

        self.today = date.today()

        self.followup = FollowUp.objects.create(
            subject="Send proposal",
            notes="Draft and send pricing proposal",
            customer=self.customer,
            company=self.company,
            type="email",
            priority="high",
            status="upcoming",
            due_date=self.today + timedelta(days=3),
            due_time=time(14, 0),
            assigned_to=self.user,
            created_by=self.user,
        )

    # =====================================================
    # Helper methods
    # =====================================================

    def create_followup(
        self,
        subject,
        followup_type="call",
        priority="medium",
        followup_status="upcoming",
        due_date=None,
        due_time=None,
        customer=None,
        company=None,
        assigned_to=None,
        notes="",
    ):
        return FollowUp.objects.create(
            subject=subject,
            notes=notes,
            customer=customer,
            company=company,
            type=followup_type,
            priority=priority,
            status=followup_status,
            due_date=due_date or self.today,
            due_time=due_time,
            assigned_to=assigned_to,
            created_by=self.user,
        )

    def get_results(self, response):
        """
        DRF pagination returns:
        {
            "count": ...,
            "next": ...,
            "previous": ...,
            "results": [...]
        }

        This helper keeps tests readable.
        """
        if isinstance(response.data, dict) and "results" in response.data:
            return response.data["results"]

        return response.data

    # =====================================================
    # Model / ID
    # =====================================================

    def test_followup_id_generated(self):
        self.assertTrue(
            self.followup.followup_id.startswith("FU")
        )

    def test_followup_id_unique_and_sequential(self):
        second = self.create_followup(
            subject="Second follow-up",
            followup_type="call",
            due_date=self.today + timedelta(days=1),
        )

        self.assertNotEqual(
            self.followup.followup_id,
            second.followup_id,
        )

    # =====================================================
    # CREATE
    # =====================================================

    def test_create_followup(self):
        payload = {
            "subject": "Call client",
            "type": "call",
            "priority": "medium",
            "status": "upcoming",
            "due_date": str(self.today + timedelta(days=1)),
            "due_time": "10:00",
            "customer": self.customer.id,
            "company": self.company.id,
            "assigned_to": self.user.id,
            "notes": "Discuss contract renewal",
        }

        response = self.client.post(
            "/api/followups/",
            payload,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            response.data["followup_id"].startswith("FU")
        )

        self.assertEqual(
            response.data["related_type"],
            "Customer",
        )

    def test_create_missing_subject_rejected(self):
        payload = {
            "type": "call",
            "due_date": str(self.today),
        }

        response = self.client.post(
            "/api/followups/",
            payload,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_create_missing_due_date_rejected(self):
        payload = {
            "subject": "No due date",
            "type": "call",
        }

        response = self.client.post(
            "/api/followups/",
            payload,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_create_invalid_type_rejected(self):
        payload = {
            "subject": "Bad type",
            "type": "not_a_real_type",
            "due_date": str(self.today),
        }

        response = self.client.post(
            "/api/followups/",
            payload,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_create_invalid_priority_rejected(self):
        payload = {
            "subject": "Bad priority",
            "type": "call",
            "priority": "urgent",
            "due_date": str(self.today),
        }

        response = self.client.post(
            "/api/followups/",
            payload,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_create_invalid_status_rejected(self):
        payload = {
            "subject": "Bad status",
            "type": "call",
            "status": "in_progress",
            "due_date": str(self.today),
        }

        response = self.client.post(
            "/api/followups/",
            payload,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_create_invalid_related_record_rejected(self):
        payload = {
            "subject": "Bad customer",
            "type": "call",
            "due_date": str(self.today),
            "customer": 999999,
        }

        response = self.client.post(
            "/api/followups/",
            payload,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_create_invalid_company_rejected(self):
        payload = {
            "subject": "Bad company",
            "type": "call",
            "due_date": str(self.today),
            "company": 999999,
        }

        response = self.client.post(
            "/api/followups/",
            payload,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_multiple_related_objects_rejected(self):
        from leads.models import Lead

        lead = Lead.objects.create(
            first_name="Zara",
            last_name="Malik",
            email="zara@example.com",
            phone="1112223333",
            company="LeadCo",
        )

        payload = {
            "subject": "Conflict",
            "type": "call",
            "due_date": str(self.today),
            "customer": self.customer.id,
            "lead": lead.id,
        }

        response = self.client.post(
            "/api/followups/",
            payload,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_created_by_not_trusted_from_payload(self):
        payload = {
            "subject": "Spoof attempt",
            "type": "task",
            "due_date": str(self.today),
            "created_by": self.other_user.id,
        }

        response = self.client.post(
            "/api/followups/",
            payload,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            response.data["created_by"],
            self.user.id,
        )

    # =====================================================
    # LIST / RETRIEVE
    # =====================================================

    def test_list_followups(self):
        response = self.client.get(
            "/api/followups/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "results",
            response.data,
        )

        self.assertIn(
            "count",
            response.data,
        )

    def test_total_records_count(self):
        self.create_followup(
            subject="Second record"
        )
        self.create_followup(
            subject="Third record"
        )

        response = self.client.get(
            "/api/followups/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            3,
        )

    def test_get_followup_by_id(self):
        response = self.client.get(
            f"/api/followups/{self.followup.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["subject"],
            "Send proposal",
        )

        self.assertEqual(
            response.data["company_name"],
            "Acme Corp",
        )

    def test_get_nonexistent_followup_404(self):
        response = self.client.get(
            "/api/followups/999999/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    # =====================================================
    # UPDATE / DELETE
    # =====================================================

    def test_update_followup(self):
        response = self.client.patch(
            f"/api/followups/{self.followup.id}/",
            {"priority": "low"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["priority"],
            "low",
        )

    def test_update_status(self):
        response = self.client.patch(
            f"/api/followups/{self.followup.id}/",
            {"status": "completed"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["status"],
            "completed",
        )

    def test_delete_followup(self):
        response = self.client.delete(
            f"/api/followups/{self.followup.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            FollowUp.objects.filter(
                id=self.followup.id
            ).exists()
        )

    def test_delete_nonexistent_followup_404(self):
        response = self.client.delete(
            "/api/followups/999999/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    # =====================================================
    # OVERDUE
    # =====================================================

    def test_is_overdue_false_for_future_due_date(self):
        response = self.client.get(
            f"/api/followups/{self.followup.id}/"
        )

        self.assertFalse(
            response.data["is_overdue"]
        )

    def test_is_overdue_true_for_past_due_date(self):
        overdue = self.create_followup(
            subject="Past due",
            followup_type="task",
            followup_status="upcoming",
            due_date=self.today - timedelta(days=2),
        )

        response = self.client.get(
            f"/api/followups/{overdue.id}/"
        )

        self.assertTrue(
            response.data["is_overdue"]
        )

    def test_is_overdue_false_when_cancelled(self):
        cancelled = self.create_followup(
            subject="Cancelled past due",
            followup_type="task",
            followup_status="cancelled",
            due_date=self.today - timedelta(days=2),
        )

        response = self.client.get(
            f"/api/followups/{cancelled.id}/"
        )

        self.assertFalse(
            response.data["is_overdue"]
        )

    # =====================================================
    # SEARCH
    # =====================================================

    def test_search_by_subject(self):
        self.create_followup(
            subject="Product Demo Discussion",
            notes="Discuss product",
        )

        response = self.client.get(
            "/api/followups/?search=Product"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        subjects = [
            item["subject"]
            for item in self.get_results(response)
        ]

        self.assertIn(
            "Product Demo Discussion",
            subjects,
        )

    def test_search_by_notes(self):
        self.create_followup(
            subject="Client meeting",
            notes="Important pricing discussion",
        )

        response = self.client.get(
            "/api/followups/?search=pricing"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        subjects = [
            item["subject"]
            for item in self.get_results(response)
        ]

        self.assertIn(
            "Client meeting",
            subjects,
        )

    def test_partial_search(self):
        self.create_followup(
            subject="Proposal Discussion"
        )

        response = self.client.get(
            "/api/followups/?search=propos"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertGreaterEqual(
            response.data["count"],
            1,
        )

    def test_search_no_results(self):
        response = self.client.get(
            "/api/followups/?search=xyz_no_match_999"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            0,
        )

    # =====================================================
    # FILTERING
    # =====================================================

    def test_filter_by_status(self):
        self.create_followup(
            subject="Completed item",
            followup_status="completed",
        )

        response = self.client.get(
            "/api/followups/?status=completed"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(response)

        self.assertTrue(
            all(
                item["status"] == "completed"
                for item in results
            )
        )

    def test_filter_by_type(self):
        response = self.client.get(
            "/api/followups/?type=email"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(response)

        self.assertTrue(
            all(
                item["type"] == "email"
                for item in results
            )
        )

    def test_filter_by_priority(self):
        response = self.client.get(
            "/api/followups/?priority=high"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(response)

        self.assertTrue(
            all(
                item["priority"] == "high"
                for item in results
            )
        )

    def test_filter_by_assigned_to(self):
        response = self.client.get(
            f"/api/followups/?assigned_to={self.user.id}"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(response)

        self.assertTrue(
            all(
                item["assigned_to"] == self.user.id
                for item in results
            )
        )

    def test_filter_by_company(self):
        response = self.client.get(
            f"/api/followups/?company={self.company.id}"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(response)

        self.assertTrue(
            all(
                item["company"] == self.company.id
                for item in results
            )
        )

    # =====================================================
    # DATE RANGE FILTERING
    # =====================================================

    def test_filter_by_from_date(self):
        self.create_followup(
            subject="Earlier",
            due_date=self.today - timedelta(days=5),
        )

        response = self.client.get(
            f"/api/followups/?from_date={self.today}"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(response)

        self.assertTrue(
            all(
                item["due_date"] >= str(self.today)
                for item in results
            )
        )

    def test_filter_by_to_date(self):
        future_date = self.today + timedelta(days=5)

        self.create_followup(
            subject="Later",
            due_date=self.today + timedelta(days=10),
        )

        response = self.client.get(
            f"/api/followups/?to_date={future_date}"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(response)

        self.assertTrue(
            all(
                item["due_date"] <= str(future_date)
                for item in results
            )
        )

    def test_filter_by_date_range(self):
        from_date = self.today + timedelta(days=1)
        to_date = self.today + timedelta(days=5)

        self.create_followup(
            subject="Inside range",
            due_date=self.today + timedelta(days=3),
        )

        self.create_followup(
            subject="Outside range",
            due_date=self.today + timedelta(days=10),
        )

        response = self.client.get(
            f"/api/followups/"
            f"?from_date={from_date}"
            f"&to_date={to_date}"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        subjects = [
            item["subject"]
            for item in self.get_results(response)
        ]

        self.assertIn(
            "Inside range",
            subjects,
        )

        self.assertNotIn(
            "Outside range",
            subjects,
        )

    def test_invalid_date_format_rejected(self):
        response = self.client.get(
            "/api/followups/?from_date=invalid-date"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_from_date_greater_than_to_date_rejected(self):
        from_date = self.today + timedelta(days=10)
        to_date = self.today + timedelta(days=1)

        response = self.client.get(
            f"/api/followups/"
            f"?from_date={from_date}"
            f"&to_date={to_date}"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # =====================================================
    # COMBINED FILTERING
    # =====================================================

    def test_combined_search_and_filters(self):
        self.create_followup(
            subject="Product Demo Call",
            notes="Discuss product",
            followup_type="call",
            priority="high",
            followup_status="upcoming",
            due_date=self.today + timedelta(days=2),
        )

        self.create_followup(
            subject="Product Email",
            followup_type="email",
            priority="high",
            followup_status="upcoming",
            due_date=self.today + timedelta(days=2),
        )

        response = self.client.get(
            "/api/followups/"
            "?search=Product"
            "&type=call"
            "&status=upcoming"
            "&priority=high"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(response)

        self.assertEqual(
            len(results),
            1,
        )

        self.assertEqual(
            results[0]["subject"],
            "Product Demo Call",
        )

    def test_all_filters_together(self):
        target_date = self.today + timedelta(days=4)

        self.create_followup(
            subject="Target Product Call",
            notes="Target notes",
            followup_type="call",
            priority="high",
            followup_status="upcoming",
            due_date=target_date,
            company=self.company,
            assigned_to=self.user,
        )

        response = self.client.get(
            "/api/followups/"
            "?search=Target"
            "&type=call"
            "&status=upcoming"
            "&priority=high"
            f"&from_date={self.today}"
            f"&to_date={self.today + timedelta(days=7)}"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(response)

        self.assertEqual(
            len(results),
            1,
        )

        self.assertEqual(
            results[0]["subject"],
            "Target Product Call",
        )

    # =====================================================
    # PAGINATION
    # =====================================================

    def test_pagination_page_size(self):
        for index in range(12):
            self.create_followup(
                subject=f"Pagination {index}",
                due_date=self.today + timedelta(days=index + 1),
            )

        response = self.client.get(
            "/api/followups/?page=1&page_size=7"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["results"]),
            7,
        )

        self.assertEqual(
            response.data["count"],
            13,
        )

    def test_pagination_second_page(self):
        for index in range(12):
            self.create_followup(
                subject=f"Page {index}",
                due_date=self.today + timedelta(days=index + 1),
            )

        response = self.client.get(
            "/api/followups/?page=2&page_size=7"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["results"]),
            6,
        )

    def test_invalid_page_rejected(self):
        response = self.client.get(
            "/api/followups/?page=abc"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_invalid_page_size_rejected(self):
        response = self.client.get(
            "/api/followups/?page_size=0"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_page_size_above_maximum_rejected(self):
        response = self.client.get(
            "/api/followups/?page_size=101"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # =====================================================
    # ORDERING
    # =====================================================

    def test_ordering_by_due_date_ascending(self):
        earlier = self.create_followup(
            subject="Earlier",
            due_date=self.today + timedelta(days=1),
        )

        later = self.create_followup(
            subject="Later",
            due_date=self.today + timedelta(days=10),
        )

        response = self.client.get(
            "/api/followups/?ordering=due_date"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(response)

        dates = [
            item["due_date"]
            for item in results
        ]

        self.assertEqual(
            dates,
            sorted(dates),
        )

    def test_ordering_by_due_date_descending(self):
        self.create_followup(
            subject="Earlier",
            due_date=self.today + timedelta(days=1),
        )

        self.create_followup(
            subject="Later",
            due_date=self.today + timedelta(days=10),
        )

        response = self.client.get(
            "/api/followups/?ordering=-due_date"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(response)

        dates = [
            item["due_date"]
            for item in results
        ]

        self.assertEqual(
            dates,
            sorted(dates, reverse=True),
        )

    def test_ordering_by_priority(self):
        self.create_followup(
            subject="Low",
            priority="low",
        )

        self.create_followup(
            subject="Medium",
            priority="medium",
        )

        response = self.client.get(
            "/api/followups/?ordering=priority"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

    def test_invalid_ordering_rejected(self):
        response = self.client.get(
            "/api/followups/?ordering=not_a_field"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # =====================================================
    # DASHBOARD STATISTICS
    # =====================================================

    def test_dashboard_statistics_endpoint(self):
        response = self.client.get(
            "/api/followups/statistics/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "total_followups",
            response.data,
        )

        self.assertIn(
            "upcoming",
            response.data,
        )

        self.assertIn(
            "completed",
            response.data,
        )

        self.assertIn(
            "overdue",
            response.data,
        )

        self.assertIn(
            "conversion_rate",
            response.data,
        )

    def test_dashboard_total_count(self):
        self.create_followup(
            subject="Second",
        )

        self.create_followup(
            subject="Third",
        )

        response = self.client.get(
            "/api/followups/statistics/"
        )

        self.assertEqual(
            response.data["total_followups"],
            3,
        )

    def test_dashboard_upcoming_next_seven_days(self):
        self.create_followup(
            subject="Upcoming in range",
            followup_status="upcoming",
            due_date=self.today + timedelta(days=6),
        )

        self.create_followup(
            subject="Outside upcoming range",
            followup_status="upcoming",
            due_date=self.today + timedelta(days=10),
        )

        response = self.client.get(
            "/api/followups/statistics/"
        )

        self.assertEqual(
            response.data["upcoming"],
            2,
        )

    def test_dashboard_completed_this_month(self):
        self.create_followup(
            subject="Completed this month",
            followup_status="completed",
            due_date=self.today,
        )

        response = self.client.get(
            "/api/followups/statistics/"
        )

        self.assertEqual(
            response.data["completed"],
            1,
        )

    def test_dashboard_overdue_count(self):
        self.create_followup(
            subject="Overdue record",
            followup_status="upcoming",
            due_date=self.today - timedelta(days=3),
        )

        response = self.client.get(
            "/api/followups/statistics/"
        )

        self.assertEqual(
            response.data["overdue"],
            1,
        )

    def test_dashboard_conversion_rate_not_hard_coded(self):
        self.create_followup(
            subject="Completed conversion",
            followup_status="completed",
            due_date=self.today,
        )

        response = self.client.get(
            "/api/followups/statistics/"
        )

        # 1 completed / 2 total * 100 = 50
        self.assertEqual(
            response.data["conversion_rate"],
            50,
        )

    # =====================================================
    # FOLLOW-UP INSIGHTS
    # =====================================================

    def test_insights_endpoint(self):
        response = self.client.get(
            "/api/followups/insights/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "total",
            response.data,
        )

        self.assertIn(
            "upcoming",
            response.data,
        )

        self.assertIn(
            "completed",
            response.data,
        )

        self.assertIn(
            "overdue",
            response.data,
        )

    def test_insights_counts_and_percentages(self):
        self.create_followup(
            subject="Upcoming 2",
            followup_status="upcoming",
            due_date=self.today + timedelta(days=2),
        )

        self.create_followup(
            subject="Completed",
            followup_status="completed",
            due_date=self.today,
        )

        self.create_followup(
            subject="Overdue",
            followup_status="upcoming",
            due_date=self.today - timedelta(days=2),
        )

        response = self.client.get(
            "/api/followups/insights/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "count",
            response.data["upcoming"],
        )

        self.assertIn(
            "percentage",
            response.data["upcoming"],
        )

        self.assertEqual(
            response.data["total"],
            5,
        )

    # =====================================================
    # UPCOMING REMINDERS
    # =====================================================

    def test_upcoming_reminders_endpoint(self):
        response = self.client.get(
            "/api/followups/reminders/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "count",
            response.data,
        )

        self.assertIn(
            "results",
            response.data,
        )

    def test_upcoming_reminders_limit(self):
        for index in range(7):
            self.create_followup(
                subject=f"Reminder {index}",
                followup_status="upcoming",
                due_date=self.today + timedelta(days=index + 1),
            )

        response = self.client.get(
            "/api/followups/reminders/?limit=5"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["results"]),
            5,
        )

        self.assertEqual(
            response.data["count"],
            8,
        )

    def test_upcoming_reminders_ordered_by_due_date(self):
        self.create_followup(
            subject="Later reminder",
            followup_status="upcoming",
            due_date=self.today + timedelta(days=10),
            due_time=time(9, 0),
        )

        self.create_followup(
            subject="Earlier reminder",
            followup_status="upcoming",
            due_date=self.today + timedelta(days=1),
            due_time=time(9, 0),
        )

        response = self.client.get(
            "/api/followups/reminders/?limit=10"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = response.data["results"]

        dates = [
            item["due_date"]
            for item in results
        ]

        self.assertEqual(
            dates,
            sorted(dates),
        )

    def test_completed_followup_not_in_upcoming_reminders(self):
        self.create_followup(
            subject="Completed reminder",
            followup_status="completed",
            due_date=self.today + timedelta(days=1),
        )

        response = self.client.get(
            "/api/followups/reminders/?limit=20"
        )

        subjects = [
            item["subject"]
            for item in response.data["results"]
        ]

        self.assertNotIn(
            "Completed reminder",
            subjects,
        )

    def test_invalid_reminder_limit_rejected(self):
        response = self.client.get(
            "/api/followups/reminders/?limit=0"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # =====================================================
    # SUPPORTING OPTIONS
    # =====================================================

    def test_options_endpoint(self):
        response = self.client.get(
            "/api/followups/options/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "types",
            response.data,
        )

        self.assertIn(
            "priorities",
            response.data,
        )

        self.assertIn(
            "statuses",
            response.data,
        )

    def test_options_contains_required_types(self):
        response = self.client.get(
            "/api/followups/options/"
        )

        values = [
            item["value"]
            for item in response.data["types"]
        ]

        for expected in [
            "call",
            "email",
            "meeting",
            "task",
            "follow_up",
        ]:
            self.assertIn(
                expected,
                values,
            )

    def test_options_contains_required_priorities(self):
        response = self.client.get(
            "/api/followups/options/"
        )

        values = [
            item["value"]
            for item in response.data["priorities"]
        ]

        for expected in [
            "high",
            "medium",
            "low",
        ]:
            self.assertIn(
                expected,
                values,
            )

    def test_options_contains_required_statuses(self):
        response = self.client.get(
            "/api/followups/options/"
        )

        values = [
            item["value"]
            for item in response.data["statuses"]
        ]

        for expected in [
            "upcoming",
            "completed",
            "overdue",
            "cancelled",
        ]:
            self.assertIn(
                expected,
                values,
            )

    # =====================================================
    # EXPORT
    # =====================================================

    def test_export_endpoint(self):
        response = self.client.get(
            "/api/followups/export/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response["Content-Type"],
            "text/csv",
        )

        self.assertIn(
            "attachment",
            response["Content-Disposition"],
        )

        content = response.content.decode(
            "utf-8"
        )

        self.assertIn(
            "Follow-up ID",
            content,
        )

        self.assertIn(
            "Subject",
            content,
        )

        self.assertIn(
            "Send proposal",
            content,
        )

    def test_export_respects_search(self):
        self.create_followup(
            subject="Export Target",
        )

        response = self.client.get(
            "/api/followups/export/?search=Export"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        content = response.content.decode(
            "utf-8"
        )

        self.assertIn(
            "Export Target",
            content,
        )

        self.assertNotIn(
            "Send proposal",
            content,
        )

    def test_export_respects_filters(self):
        self.create_followup(
            subject="High Call",
            followup_type="call",
            priority="high",
            followup_status="upcoming",
        )

        self.create_followup(
            subject="Low Email",
            followup_type="email",
            priority="low",
            followup_status="upcoming",
        )

        response = self.client.get(
            "/api/followups/export/"
            "?type=call"
            "&priority=high"
            "&status=upcoming"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        content = response.content.decode(
            "utf-8"
        )

        self.assertIn(
            "High Call",
            content,
        )

        self.assertNotIn(
            "Low Email",
            content,
        )

    def test_export_respects_date_range(self):
        self.create_followup(
            subject="Inside Export Range",
            due_date=self.today + timedelta(days=3),
        )

        self.create_followup(
            subject="Outside Export Range",
            due_date=self.today + timedelta(days=20),
        )

        from_date = self.today
        to_date = self.today + timedelta(days=7)

        response = self.client.get(
            "/api/followups/export/"
            f"?from_date={from_date}"
            f"&to_date={to_date}"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        content = response.content.decode(
            "utf-8"
        )

        self.assertIn(
            "Inside Export Range",
            content,
        )

        self.assertNotIn(
            "Outside Export Range",
            content,
        )

    # =====================================================
    # INVALID QUERY PARAMETERS
    # =====================================================

    def test_invalid_type_filter_rejected(self):
        response = self.client.get(
            "/api/followups/?type=invalid"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_invalid_status_filter_rejected(self):
        response = self.client.get(
            "/api/followups/?status=invalid"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_invalid_priority_filter_rejected(self):
        response = self.client.get(
            "/api/followups/?priority=invalid"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # =====================================================
    # AUTHORIZATION / DATA VISIBILITY
    # =====================================================

    def test_user_only_sees_followups_they_created_or_are_assigned(self):
        private_followup = self.create_followup(
            subject="Private follow-up"
        )

        private_followup.created_by = self.other_user
        private_followup.assigned_to = self.other_user
        private_followup.save(
            update_fields=["created_by", "assigned_to"]
        )

        response = self.client.get(
            "/api/followups/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        subjects = [
            item["subject"]
            for item in self.get_results(response)
        ]

        self.assertIn(
            "Send proposal",
            subjects,
        )

        self.assertNotIn(
            "Private follow-up",
            subjects,
        )

    def test_user_cannot_retrieve_followup_they_are_not_authorized_for(self):
        private_followup = self.create_followup(
            subject="Other user's follow-up"
        )

        private_followup.created_by = self.other_user
        private_followup.assigned_to = self.other_user
        private_followup.save(
            update_fields=["created_by", "assigned_to"]
        )

        response = self.client.get(
            f"/api/followups/{private_followup.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_assigned_user_can_access_followup_created_by_someone_else(self):
        assigned_followup = self.create_followup(
            subject="Assigned to tester"
        )

        assigned_followup.created_by = self.other_user
        assigned_followup.assigned_to = self.user
        assigned_followup.save(
            update_fields=["created_by", "assigned_to"]
        )

        response = self.client.get(
            f"/api/followups/{assigned_followup.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["subject"],
            "Assigned to tester",
        )

    def test_page_beyond_available_range_returns_bad_request(self):
        response = self.client.get(
            "/api/followups/?page=999&page_size=7"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_invalid_reminder_limit_text_rejected(self):
        response = self.client.get(
            "/api/followups/reminders/?limit=abc"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # =====================================================
    # SEARCH BY RELATED DATA
    # =====================================================

    def test_search_by_customer_name(self):
        response = self.client.get(
            "/api/followups/?search=Ahmed"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        subjects = [
            item["subject"]
            for item in self.get_results(response)
        ]

        self.assertIn(
            "Send proposal",
            subjects,
        )

    def test_search_by_company_name(self):
        response = self.client.get(
            "/api/followups/?search=Acme"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        subjects = [
            item["subject"]
            for item in self.get_results(response)
        ]

        self.assertIn(
            "Send proposal",
            subjects,
        )

    def test_search_by_followup_id(self):
        response = self.client.get(
            f"/api/followups/?search={self.followup.followup_id}"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

    # =====================================================
    # OVERDUE STATUS
    # =====================================================

    def test_explicit_overdue_status_is_counted_as_overdue(self):
        overdue = self.create_followup(
            subject="Explicit overdue",
            followup_status="overdue",
            due_date=self.today + timedelta(days=3),
        )

        response = self.client.get(
            "/api/followups/statistics/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["overdue"],
            1,
        )

        detail = self.client.get(
            f"/api/followups/{overdue.id}/"
        )

        self.assertEqual(
            detail.status_code,
            status.HTTP_200_OK,
        )

    # =====================================================
    # AUTHENTICATION
    # =====================================================

    def test_unauthenticated_rejected(self):
        self.client.credentials()

        response = self.client.get(
            "/api/followups/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_unauthenticated_create_rejected(self):
        self.client.credentials()

        payload = {
            "subject": "No auth",
            "type": "call",
            "due_date": str(self.today),
        }

        response = self.client.post(
            "/api/followups/",
            payload,
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_unauthenticated_statistics_rejected(self):
        self.client.credentials()

        response = self.client.get(
            "/api/followups/statistics/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_unauthenticated_insights_rejected(self):
        self.client.credentials()

        response = self.client.get(
            "/api/followups/insights/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_unauthenticated_reminders_rejected(self):
        self.client.credentials()

        response = self.client.get(
            "/api/followups/reminders/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_unauthenticated_options_rejected(self):
        self.client.credentials()

        response = self.client.get(
            "/api/followups/options/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_unauthenticated_export_rejected(self):
        self.client.credentials()

        response = self.client.get(
            "/api/followups/export/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
