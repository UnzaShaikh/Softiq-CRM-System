from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from .models import Company

User = get_user_model()


class CompanyAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="pass1234")
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")
        self.company = Company.objects.create(name="Acme Corp", industry="Tech", created_by=self.user)

    def test_create_company(self):
        payload = {"name": "Globex Inc", "industry": "Manufacturing", "email": "info@globex.com"}
        res = self.client.post("/api/companies/", payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_duplicate_name_rejected(self):
        payload = {"name": "Acme Corp", "industry": "Tech"}
        res = self.client.post("/api/companies/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_companies(self):
        res = self.client.get("/api/companies/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_get_company_by_id(self):
        res = self.client.get(f"/api/companies/{self.company.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["name"], "Acme Corp")

    def test_update_company(self):
        res = self.client.patch(f"/api/companies/{self.company.id}/", {"industry": "Finance"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["industry"], "Finance")

    def test_delete_company(self):
        res = self.client.delete(f"/api/companies/{self.company.id}/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

    def test_unauthenticated_rejected(self):
        self.client.credentials()
        res = self.client.get("/api/companies/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_search_companies(self):
        Company.objects.create(
            name="Tech Solutions",
            industry="Technology",
            created_by=self.user
        )

        res = self.client.get("/api/companies/?search=Tech")

        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_filter_by_industry(self):
        Company.objects.create(
            name="Tech Solutions",
            industry="Technology",
            created_by=self.user
        )

        res = self.client.get(
            "/api/companies/?industry=Technology"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_filter_by_size(self):
        Company.objects.create(
            name="Large Company",
            industry="Technology",
            size="Large",
            created_by=self.user
        )

        res = self.client.get(
            "/api/companies/?size=Large"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_filter_by_status(self):
        res = self.client.get(
            "/api/companies/?status=active"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_ordering(self):
        res = self.client.get(
            "/api/companies/?ordering=name"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_pagination(self):
        res = self.client.get(
            "/api/companies/?page=1"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("count", res.data)
        self.assertIn("results", res.data)

    def test_filter_options(self):
        res = self.client.get(
            "/api/companies/filter-options/"
        )

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.assertIn("industries", res.data)
        self.assertIn("sizes", res.data)
        self.assertIn("statuses", res.data)
        self.assertIn("total_records", res.data)

    def test_stats(self):
        Company.objects.create(
            name="Tech Solutions",
            industry="Technology",
            created_by=self.user
        )

        res = self.client.get("/api/companies/stats/")

        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.assertIn("total_companies", res.data)
        self.assertIn("active_companies", res.data)
        self.assertIn("new_this_month", res.data)
        self.assertIn("total_contacts", res.data)