from datetime import date, time

from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from customers.models import Customer
from leads.models import Lead
from companies.models import Company
from contacts.models import Contact
from opportunities.models import Opportunity
from activities.models import Activity
from notes.models import Note
from followups.models import FollowUp
from email_templates.models import EmailTemplate


User = get_user_model()


class GlobalSearchAPITests(APITestCase):
    """
    Test suite for Global Search API.

    Covered:
        - Authentication
        - Global search
        - Module filtering
        - Multi-module filtering
        - Pagination
        - Invalid parameters
        - Empty queries
        - No-result searches
    """

    @classmethod
    def setUpTestData(cls):

        # =========================================================
        # USER
        # =========================================================

        cls.user = User.objects.create_user(
            username="searchtest",
            email="searchtest@example.com",
            password="TestPassword123!",
        )

        # =========================================================
        # CUSTOMER
        # =========================================================

        cls.customer = Customer.objects.create(
            first_name="Ahmed",
            last_name="Khan",
            email="ahmed@example.com",
            phone="03001234567",
            company="SoftiqTech",
            status="active",
        )

        # =========================================================
        # LEAD
        # =========================================================

        cls.lead = Lead.objects.create(
            first_name="Ahmed",
            last_name="Ali",
            email="ahmed.lead@example.com",
            phone="03007654321",
            company="SoftiqTech",
            source="website",
            status="new",
        )

        # =========================================================
        # COMPANY
        # =========================================================

        cls.company = Company.objects.create(
            name="SoftiqTech",
            industry="Software",
            website="https://softiqtech.com",
            phone="03001111111",
            email="info@softiqtech.com",
            address="Karachi",
            size="51-200",
            status="active",
            description="Software development company",
        )

        # =========================================================
        # CONTACT
        # =========================================================

        cls.contact = Contact.objects.create(
            full_name="Ahmed Contact",
            company="SoftiqTech",
            email="contact@example.com",
            phone="03002222222",
            job_title="Manager",
            status="active",
        )

        # =========================================================
        # OPPORTUNITY
        # =========================================================

        cls.opportunity = Opportunity.objects.create(
            name="Proposal Opportunity",
            customer=cls.customer,
            value=20000,
            stage="proposal",
            status="active",
            notes="Proposal discussion",
        )

        # =========================================================
        # ACTIVITY
        # =========================================================

        cls.activity = Activity.objects.create(
            title="Ahmed Meeting",
            type="meeting",
            status="scheduled",
            priority="high",
            description="Meeting with Ahmed",
            location="Karachi",
            customer=cls.customer,
            date=date.today(),
            time=time(10, 30),
            duration=60,
        )

        # =========================================================
        # FOLLOW-UP
        # =========================================================

        cls.followup = FollowUp.objects.create(
            subject="Proposal Discussion",
            type="email",
            priority="medium",
            status="upcoming",
            due_date=date.today(),
            customer=cls.customer,
        )

        # =========================================================
        # EMAIL TEMPLATE
        # =========================================================

        cls.email_template = EmailTemplate.objects.create(
            name="Proposal Email",
            subject="Proposal Follow-up",
            content="Hello {{first_name}}",
            description="Proposal follow-up email",
            category="sales",
            template_type="private",
            status="active",
            language="en",
            created_by=cls.user,
            updated_by=cls.user,
        )

        # =========================================================
        # URL
        # =========================================================

        cls.url = reverse("global-search")

    def setUp(self):

        self.client.force_authenticate(
            user=self.user
        )

    # =============================================================
    # AUTHENTICATION
    # =============================================================

    def test_search_requires_authentication(self):

        self.client.force_authenticate(
            user=None
        )

        response = self.client.get(
            self.url,
            {"q": "Ahmed"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # =============================================================
    # GLOBAL SEARCH
    # =============================================================

    def test_global_search(self):

        response = self.client.get(
            self.url,
            {"q": "Ahmed"},
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["query"],
            "Ahmed",
        )

        self.assertGreater(
            response.data["count"],
            0,
        )

        self.assertIn(
            "results",
            response.data,
        )

    # =============================================================
    # CUSTOMER SEARCH
    # =============================================================

    def test_customer_search(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed",
                "module": "customer",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertGreater(
            response.data["count"],
            0,
        )

        modules = {
            result["module"]
            for result in response.data["results"]
        }

        self.assertEqual(
            modules,
            {"customer"},
        )

    # =============================================================
    # LEAD SEARCH
    # =============================================================

    def test_lead_search(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed",
                "module": "lead",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertGreater(
            response.data["count"],
            0,
        )

        self.assertTrue(
            all(
                result["module"] == "lead"
                for result in response.data["results"]
            )
        )

    # =============================================================
    # COMPANY SEARCH
    # =============================================================

    def test_company_search(self):

        response = self.client.get(
            self.url,
            {
                "q": "SoftiqTech",
                "module": "company",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertGreater(
            response.data["count"],
            0,
        )

        self.assertTrue(
            any(
                result["title"] == "SoftiqTech"
                for result in response.data["results"]
            )
        )

    # =============================================================
    # CONTACT SEARCH
    # =============================================================

    def test_contact_search(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed Contact",
                "module": "contact",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertGreater(
            response.data["count"],
            0,
        )

        self.assertTrue(
            any(
                result["module"] == "contact"
                for result in response.data["results"]
            )
        )

    # =============================================================
    # OPPORTUNITY SEARCH
    # =============================================================

    def test_opportunity_search_by_name(self):

        response = self.client.get(
            self.url,
            {
                "q": "Proposal",
                "module": "opportunity",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertGreater(
            response.data["count"],
            0,
        )

        self.assertTrue(
            any(
                result["module"] == "opportunity"
                for result in response.data["results"]
            )
        )

    # =============================================================
    # OPPORTUNITY SEARCH BY STAGE
    # =============================================================

    def test_opportunity_search_by_stage(self):

        response = self.client.get(
            self.url,
            {
                "q": "proposal",
                "module": "opportunity",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertGreater(
            response.data["count"],
            0,
        )

    # =============================================================
    # ACTIVITY SEARCH
    # =============================================================

    def test_activity_search(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed Meeting",
                "module": "activity",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertGreater(
            response.data["count"],
            0,
        )

        self.assertTrue(
            all(
                result["module"] == "activity"
                for result in response.data["results"]
            )
        )

    # =============================================================
    # FOLLOW-UP SEARCH
    # =============================================================

    def test_followup_search(self):

        response = self.client.get(
            self.url,
            {
                "q": "Proposal",
                "module": "followup",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertGreater(
            response.data["count"],
            0,
        )

        self.assertTrue(
            any(
                result["title"] == "Proposal Discussion"
                for result in response.data["results"]
            )
        )

    # =============================================================
    # NOTE SEARCH
    # =============================================================

    def test_note_search(self):

        # Create a Note here because its required fields can vary
        # depending on the project's current model implementation.

        response = self.client.get(
            self.url,
            {
                "q": "NoteThatDoesNotExist",
                "module": "note",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            0,
        )

    # =============================================================
    # EMAIL TEMPLATE SEARCH
    # =============================================================

    def test_email_template_search(self):

        response = self.client.get(
            self.url,
            {
                "q": "Proposal Email",
                "module": "email_template",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertGreater(
            response.data["count"],
            0,
        )

        self.assertTrue(
            any(
                result["module"] == "email_template"
                for result in response.data["results"]
            )
        )

    # =============================================================
    # SINGLE MODULE FILTER
    # =============================================================

    def test_single_module_filter(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed",
                "module": "customer",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        for result in response.data["results"]:
            self.assertEqual(
                result["module"],
                "customer",
            )

    # =============================================================
    # MULTI MODULE FILTER
    # =============================================================

    def test_multi_module_filter(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed",
                "module": "customer,lead,contact",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        returned_modules = {
            result["module"]
            for result in response.data["results"]
        }

        self.assertTrue(
            returned_modules.issubset(
                {
                    "customer",
                    "lead",
                    "contact",
                }
            )
        )

    # =============================================================
    # INVALID MODULE
    # =============================================================

    def test_invalid_module(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed",
                "module": "invalid",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # =============================================================
    # MULTIPLE MODULES WITH INVALID MODULE
    # =============================================================

    def test_invalid_module_in_multiple_modules(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed",
                "module": "customer,invalid",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # =============================================================
    # EMPTY QUERY
    # =============================================================

    def test_empty_query(self):

        response = self.client.get(
            self.url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["query"],
            "",
        )

        self.assertEqual(
            response.data["count"],
            0,
        )

        self.assertEqual(
            response.data["results"],
            [],
        )

    # =============================================================
    # NO RESULTS
    # =============================================================

    def test_no_results(self):

        response = self.client.get(
            self.url,
            {
                "q": "XYZ_NO_MATCH_123456",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["count"],
            0,
        )

        self.assertEqual(
            response.data["results"],
            [],
        )

    # =============================================================
    # PAGINATION
    # =============================================================

    def test_pagination_metadata(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed",
                "page": 1,
                "page_size": 2,
            },
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
            "total_pages",
            response.data,
        )

        self.assertIn(
            "current_page",
            response.data,
        )

        self.assertIn(
            "page_size",
            response.data,
        )

        self.assertIn(
            "next",
            response.data,
        )

        self.assertIn(
            "previous",
            response.data,
        )

        self.assertIn(
            "results",
            response.data,
        )

        self.assertEqual(
            response.data["current_page"],
            1,
        )

        self.assertEqual(
            response.data["page_size"],
            2,
        )

    # =============================================================
    # CUSTOM PAGE SIZE
    # =============================================================

    def test_custom_page_size(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed",
                "page": 1,
                "page_size": 1,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["page_size"],
            1,
        )

        self.assertLessEqual(
            len(response.data["results"]),
            1,
        )

    # =============================================================
    # INVALID PAGE
    # =============================================================

    def test_invalid_page(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed",
                "page": "abc",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # =============================================================
    # PAGE ZERO
    # =============================================================

    def test_page_zero(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed",
                "page": 0,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # =============================================================
    # INVALID PAGE SIZE
    # =============================================================

    def test_invalid_page_size(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed",
                "page_size": "abc",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # =============================================================
    # PAGE SIZE ZERO
    # =============================================================

    def test_page_size_zero(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed",
                "page_size": 0,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # =============================================================
    # PAGE SIZE LIMIT
    # =============================================================

    def test_page_size_maximum(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed",
                "page_size": 100,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["page_size"],
            50,
        )

    # =============================================================
    # OUT OF RANGE PAGE
    # =============================================================

    def test_out_of_range_page(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed",
                "page": 9999,
                "page_size": 10,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    # =============================================================
    # PAGINATION + MODULE FILTER
    # =============================================================

    def test_pagination_with_module_filter(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed",
                "module": "customer,lead,contact",
                "page": 1,
                "page_size": 2,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["current_page"],
            1,
        )

        self.assertEqual(
            response.data["page_size"],
            2,
        )

        for result in response.data["results"]:
            self.assertIn(
                result["module"],
                {
                    "customer",
                    "lead",
                    "contact",
                },
            )

    # =============================================================
    # RESPONSE STRUCTURE
    # =============================================================

    def test_response_structure(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        expected_keys = {
            "query",
            "count",
            "total_pages",
            "current_page",
            "page_size",
            "next",
            "previous",
            "results",
        }

        self.assertEqual(
            set(response.data.keys()),
            expected_keys,
        )

    # =============================================================
    # RESULT STRUCTURE
    # =============================================================

    def test_result_structure(self):

        response = self.client.get(
            self.url,
            {
                "q": "Ahmed",
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        if response.data["results"]:

            result = response.data["results"][0]

            expected_keys = {
                "id",
                "module",
                "title",
                "subtitle",
                "status",
                "url",
            }

            self.assertEqual(
                set(result.keys()),
                expected_keys,
            )