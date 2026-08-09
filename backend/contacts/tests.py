"""
Tests for the Contact CRUD API.
"""

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Contact

User = get_user_model()


class ContactAuthTests(APITestCase):
    """All contact endpoints must require authentication."""

    def test_list_requires_auth(self):
        response = self.client.get(reverse("contact-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_requires_auth(self):
        response = self.client.post(reverse("contact-list"), {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ContactCRUDTests(APITestCase):
    """Full CRUD lifecycle tests for Contact."""

    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="testpass123")
        self.client.force_authenticate(user=self.user)

        self.contact = Contact.objects.create(
            full_name="Sarah Khan",
            company="Global Solutions",
            email="sarah@example.com",
            phone="1234567890",
            job_title="Sales Manager",
            status="active",
            created_by=self.user,
        )

    def test_create_contact(self):
        payload = {
            "full_name": "Ali Raza",
            "company": "Innovatech Ltd",
            "email": "ali@example.com",
            "phone": "9876543210",
            "job_title": "CTO",
            "status": "lead",
        }
        response = self.client.post(reverse("contact-list"), payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Contact.objects.count(), 2)
        self.assertEqual(response.data["full_name"], "Ali Raza")
        self.assertEqual(response.data["created_by"], self.user.id)

    def test_create_contact_requires_valid_email(self):
        payload = {
            "full_name": "Bad Email",
            "email": "not-an-email",
            "status": "lead",
        }
        response = self.client.post(reverse("contact-list"), payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_create_contact_requires_full_name(self):
        payload = {
            "full_name": "",
            "email": "someone@example.com",
        }
        response = self.client.post(reverse("contact-list"), payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_contacts(self):
        response = self.client.get(reverse("contact-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]) if "results" in response.data else len(response.data), 1)

    def test_get_contact_by_id(self):
        response = self.client.get(reverse("contact-detail", args=[self.contact.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["full_name"], "Sarah Khan")

    def test_get_nonexistent_contact_returns_404(self):
        response = self.client.get(reverse("contact-detail", args=[9999]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_contact(self):
        payload = {"job_title": "VP of Sales"}
        response = self.client.patch(reverse("contact-detail", args=[self.contact.id]), payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.contact.refresh_from_db()
        self.assertEqual(self.contact.job_title, "VP of Sales")

    def test_delete_contact(self):
        response = self.client.delete(reverse("contact-detail", args=[self.contact.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Contact.objects.count(), 0)

    def test_duplicate_email_rejected(self):
        payload = {
            "full_name": "Duplicate Email",
            "email": "sarah@example.com",  # already used by self.contact
            "status": "lead",
        }
        response = self.client.post(reverse("contact-list"), payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)