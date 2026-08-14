from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from .models import EmailTemplate, TemplateActivity

User = get_user_model()


class EmailTemplateAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="pass1234")
        self.other_user = User.objects.create_user(username="other", password="pass1234")

        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

        self.template = EmailTemplate.objects.create(
            name="Welcome Email",
            subject="Welcome to {{company_name}}!",
            content="Hi {{first_name}},\n\nWelcome to {{company_name}}! Reach out to {{contact_name}} anytime.",
            description="Sent to new customers",
            category="onboarding",
            template_type="private",
            status="active",
            created_by=self.user,
            updated_by=self.user,
        )

    def test_create_template(self):
        payload = {
            "name": "Follow Up Email",
            "subject": "Following up, {{first_name}}",
            "content": "Hi {{first_name}}, just checking in.",
            "category": "follow_up",
            "template_type": "public",
            "status": "active",
        }
        res = self.client.post("/api/email-templates/", payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("first_name", res.data["variables_used"])

    def test_create_missing_name_rejected(self):
        payload = {"subject": "x", "content": "y"}
        res = self.client.post("/api/email-templates/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_empty_content_rejected(self):
        payload = {"name": "Empty", "subject": "x", "content": "   "}
        res = self.client.post("/api/email-templates/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_invalid_category_rejected(self):
        payload = {
            "name": "Bad category", "subject": "x", "content": "y",
            "category": "not_a_category",
        }
        res = self.client.post("/api/email-templates/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_invalid_template_type_rejected(self):
        payload = {
            "name": "Bad type", "subject": "x", "content": "y",
            "template_type": "shared",
        }
        res = self.client.post("/api/email-templates/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_invalid_status_rejected(self):
        payload = {
            "name": "Bad status", "subject": "x", "content": "y",
            "status": "draft",
        }
        res = self.client.post("/api/email-templates/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_creates_activity_log_on_create(self):
        payload = {"name": "Activity Test", "subject": "x", "content": "y"}
        res = self.client.post("/api/email-templates/", payload)
        template_id = res.data["id"]
        self.assertTrue(
            TemplateActivity.objects.filter(template_id=template_id, action="created").exists()
        )

    def test_list_templates(self):
        res = self.client.get("/api/email-templates/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_get_template_by_id(self):
        res = self.client.get(f"/api/email-templates/{self.template.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["name"], "Welcome Email")
        self.assertIn("company_name", res.data["variables_used"])

    def test_get_nonexistent_template_404(self):
        res = self.client.get("/api/email-templates/999999/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_template_partial(self):
        res = self.client.patch(f"/api/email-templates/{self.template.id}/", {"subject": "New subject"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["subject"], "New subject")
        self.assertEqual(res.data["name"], "Welcome Email")

    def test_update_by_non_owner_rejected(self):
        other_token = RefreshToken.for_user(self.other_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {other_token.access_token}")
        res = self.client.patch(f"/api/email-templates/{self.template.id}/", {"subject": "Hijack"})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_private_template_not_visible_to_other_users(self):
        other_token = RefreshToken.for_user(self.other_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {other_token.access_token}")
        res = self.client.get(f"/api/email-templates/{self.template.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_public_template_visible_to_other_users(self):
        public = EmailTemplate.objects.create(
            name="Public Template", subject="x", content="y",
            template_type="public", created_by=self.user,
        )
        other_token = RefreshToken.for_user(self.other_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {other_token.access_token}")
        res = self.client.get(f"/api/email-templates/{public.id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_soft_delete_template(self):
        res = self.client.delete(f"/api/email-templates/{self.template.id}/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.template.refresh_from_db()
        self.assertTrue(self.template.is_deleted)
        res = self.client.get(f"/api/email-templates/{self.template.id}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_by_non_owner_rejected(self):
        other_token = RefreshToken.for_user(self.other_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {other_token.access_token}")
        res = self.client.delete(f"/api/email-templates/{self.template.id}/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_duplicate_template(self):
        res = self.client.post(f"/api/email-templates/{self.template.id}/duplicate/")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(res.data["id"], self.template.id)
        self.assertIn("Copy", res.data["name"])
        self.assertEqual(res.data["content"], self.template.content)
        self.assertTrue(EmailTemplate.objects.filter(id=self.template.id, is_deleted=False).exists())

    def test_update_status_valid(self):
        res = self.client.patch(f"/api/email-templates/{self.template.id}/status/", {"status": "inactive"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], "inactive")

    def test_update_status_invalid(self):
        res = self.client.patch(f"/api/email-templates/{self.template.id}/status/", {"status": "archived"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_preview_renders_sample_values(self):
        res = self.client.get(f"/api/email-templates/{self.template.id}/preview/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("John", res.data["rendered_content"])
        self.template.refresh_from_db()
        self.assertIn("{{first_name}}", self.template.content)

    def test_preview_custom_sample_values(self):
        res = self.client.post(
            f"/api/email-templates/{self.template.id}/preview/",
            {"sample_values": {"first_name": "Sarah"}},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("Sarah", res.data["rendered_content"])

    def test_activity_log_endpoint(self):
        self.client.patch(f"/api/email-templates/{self.template.id}/", {"subject": "Updated"})
        res = self.client.get(f"/api/email-templates/{self.template.id}/activity/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        actions = [a["action"] for a in res.data]
        self.assertIn("updated", actions)

    def test_filter_by_category(self):
        res = self.client.get("/api/email-templates/?category=onboarding")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_filter_by_status(self):
        res = self.client.get("/api/email-templates/?status=active")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_unauthenticated_rejected(self):
        self.client.credentials()
        res = self.client.get("/api/email-templates/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)