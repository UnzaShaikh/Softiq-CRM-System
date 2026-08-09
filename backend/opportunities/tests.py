from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from customers.models import Customer
from .models import Opportunity


User = get_user_model()


class OpportunityAPITestCase(APITestCase):

    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username="opportunity_test_user",
            email="opportunity@test.com",
            password="TestPassword123!",
        )

        # Authenticate test user
        self.client.force_authenticate(user=self.user)

        # Create test customers
        self.customer_1 = Customer.objects.create(
            first_name="John",
            last_name="Doe",
            email="john.doe@test.com",
            phone="03001234567",
            company="Alpha Technologies",
            status="active",
        )

        self.customer_2 = Customer.objects.create(
            first_name="Sarah",
            last_name="Khan",
            email="sarah.khan@test.com",
            phone="03009876543",
            company="Beta Solutions",
            status="active",
        )

        # Create test opportunities
        self.opportunity_1 = Opportunity.objects.create(
            name="CRM Implementation",
            customer=self.customer_1,
            value=Decimal("50000.00"),
            stage="prospecting",
            status="active",
            probability=60,
            expected_close_date="2026-09-30",
            notes="Test opportunity 1",
            created_by=self.user,
        )

        self.opportunity_2 = Opportunity.objects.create(
            name="Website Redesign",
            customer=self.customer_2,
            value=Decimal("75000.00"),
            stage="proposal",
            status="active",
            probability=80,
            expected_close_date="2026-10-15",
            notes="Test opportunity 2",
            created_by=self.user,
        )

    # ---------------------------------------------------------
    # Helper
    # ---------------------------------------------------------

    def get_results(self, response):
        """
        Handles both paginated and non-paginated API responses.
        """
        if isinstance(response.data, dict) and "results" in response.data:
            return response.data["results"]

        return response.data

    # ---------------------------------------------------------
    # GET ALL
    # ---------------------------------------------------------

    def test_get_all_opportunities(self):
        url = reverse("opportunity-list")

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = self.get_results(response)

        self.assertEqual(len(results), 2)

    # ---------------------------------------------------------
    # GET BY ID
    # ---------------------------------------------------------

    def test_get_opportunity_by_id(self):
        url = reverse(
            "opportunity-detail",
            kwargs={"pk": self.opportunity_1.id},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            response.data["name"],
            "CRM Implementation",
        )

    # ---------------------------------------------------------
    # CREATE
    # ---------------------------------------------------------

    def test_create_opportunity(self):
        url = reverse("opportunity-list")

        data = {
            "name": "Mobile Application",
            "customer": self.customer_1.id,
            "value": "100000.00",
            "stage": "qualification",
            "status": "active",
            "probability": 70,
            "expected_close_date": "2026-11-30",
            "notes": "New opportunity",
        }

        response = self.client.post(
            url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            response.data["name"],
            "Mobile Application",
        )

        self.assertEqual(
            Opportunity.objects.count(),
            3,
        )

    # ---------------------------------------------------------
    # CREATED BY USER
    # ---------------------------------------------------------

    def test_created_by_is_authenticated_user(self):
        url = reverse("opportunity-list")

        data = {
            "name": "User Ownership Test",
            "customer": self.customer_1.id,
            "value": "25000.00",
            "stage": "prospecting",
            "status": "active",
            "probability": 50,
            "expected_close_date": "2026-12-01",
            "notes": "",
        }

        response = self.client.post(
            url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        opportunity = Opportunity.objects.get(
            id=response.data["id"]
        )

        self.assertEqual(
            opportunity.created_by,
            self.user,
        )

    # ---------------------------------------------------------
    # UPDATE
    # ---------------------------------------------------------

    def test_update_opportunity(self):
        url = reverse(
            "opportunity-detail",
            kwargs={"pk": self.opportunity_1.id},
        )

        data = {
            "name": "Updated CRM Implementation",
            "customer": self.customer_1.id,
            "value": "65000.00",
            "stage": "proposal",
            "status": "active",
            "probability": 75,
            "expected_close_date": "2026-10-30",
            "notes": "Updated opportunity",
        }

        response = self.client.put(
            url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.opportunity_1.refresh_from_db()

        self.assertEqual(
            self.opportunity_1.name,
            "Updated CRM Implementation",
        )

        self.assertEqual(
            self.opportunity_1.value,
            Decimal("65000.00"),
        )

        self.assertEqual(
            self.opportunity_1.stage,
            "proposal",
        )

    # ---------------------------------------------------------
    # PARTIAL UPDATE
    # ---------------------------------------------------------

    def test_partial_update_opportunity(self):
        url = reverse(
            "opportunity-detail",
            kwargs={"pk": self.opportunity_1.id},
        )

        response = self.client.patch(
            url,
            {
                "probability": 90,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.opportunity_1.refresh_from_db()

        self.assertEqual(
            self.opportunity_1.probability,
            90,
        )

        # Make sure other data wasn't accidentally changed
        self.assertEqual(
            self.opportunity_1.name,
            "CRM Implementation",
        )

    # ---------------------------------------------------------
    # DELETE
    # ---------------------------------------------------------

    def test_delete_opportunity(self):
        url = reverse(
            "opportunity-detail",
            kwargs={"pk": self.opportunity_1.id},
        )

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Opportunity.objects.filter(
                id=self.opportunity_1.id
            ).exists()
        )

    # ---------------------------------------------------------
    # SEARCH
    # ---------------------------------------------------------

    def test_search_opportunities(self):
        url = reverse("opportunity-list")

        response = self.client.get(
            url,
            {"search": "CRM"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(response)

        self.assertEqual(len(results), 1)

        self.assertEqual(
            results[0]["name"],
            "CRM Implementation",
        )

    # ---------------------------------------------------------
    # FILTER BY STATUS
    # ---------------------------------------------------------

    def test_filter_by_status(self):
        self.opportunity_2.status = "on_hold"
        self.opportunity_2.save()

        url = reverse("opportunity-list")

        response = self.client.get(
            url,
            {"status": "active"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(response)

        for opportunity in results:
            self.assertEqual(
                opportunity["status"],
                "active",
            )

    # ---------------------------------------------------------
    # FILTER BY STAGE
    # ---------------------------------------------------------

    def test_filter_by_stage(self):
        url = reverse("opportunity-list")

        response = self.client.get(
            url,
            {"stage": "proposal"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(response)

        self.assertEqual(len(results), 1)

        self.assertEqual(
            results[0]["stage"],
            "proposal",
        )

    # ---------------------------------------------------------
    # COMBINED FILTERING
    # ---------------------------------------------------------

    def test_combined_filtering(self):
        url = reverse("opportunity-list")

        response = self.client.get(
            url,
            {
                "status": "active",
                "stage": "proposal",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(response)

        self.assertEqual(len(results), 1)

        self.assertEqual(
            results[0]["status"],
            "active",
        )

        self.assertEqual(
            results[0]["stage"],
            "proposal",
        )

    # ---------------------------------------------------------
    # ORDERING
    # ---------------------------------------------------------

    def test_ordering_by_value_descending(self):
        url = reverse("opportunity-list")

        response = self.client.get(
            url,
            {"ordering": "-value"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = self.get_results(response)

        self.assertGreaterEqual(
            Decimal(str(results[0]["value"])),
            Decimal(str(results[1]["value"])),
        )

    # ---------------------------------------------------------
    # VALIDATION - PROBABILITY
    # ---------------------------------------------------------

    def test_probability_cannot_exceed_100(self):
        url = reverse("opportunity-list")

        data = {
            "name": "Invalid Probability",
            "customer": self.customer_1.id,
            "value": "10000.00",
            "stage": "prospecting",
            "status": "active",
            "probability": 101,
            "expected_close_date": "2026-12-01",
            "notes": "",
        }

        response = self.client.post(
            url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # VALIDATION - NEGATIVE VALUE
    # ---------------------------------------------------------

    def test_value_cannot_be_negative(self):
        url = reverse("opportunity-list")

        data = {
            "name": "Negative Value",
            "customer": self.customer_1.id,
            "value": "-5000.00",
            "stage": "prospecting",
            "status": "active",
            "probability": 50,
            "expected_close_date": "2026-12-01",
            "notes": "",
        }

        response = self.client.post(
            url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # VALIDATION - INVALID CUSTOMER
    # ---------------------------------------------------------

    def test_invalid_customer(self):
        url = reverse("opportunity-list")

        data = {
            "name": "Invalid Customer",
            "customer": 999999,
            "value": "10000.00",
            "stage": "prospecting",
            "status": "active",
            "probability": 50,
            "expected_close_date": "2026-12-01",
            "notes": "",
        }

        response = self.client.post(
            url,
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # AUTHENTICATION
    # ---------------------------------------------------------

    def test_unauthenticated_user_cannot_access_opportunities(self):
        self.client.force_authenticate(user=None)

        url = reverse("opportunity-list")

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # ---------------------------------------------------------
    # NOT FOUND
    # ---------------------------------------------------------

    def test_get_nonexistent_opportunity(self):
        url = reverse(
            "opportunity-detail",
            kwargs={"pk": 999999},
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )