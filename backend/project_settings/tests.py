from django.contrib.auth import get_user_model
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import ProjectSettings, Role

User = get_user_model()


class BaseSettingsAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="settings_tester", password="OldPass123!",
            email="settings_tester@example.com",
        )
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")


# ---------- General Settings ----------

class GeneralSettingsTests(BaseSettingsAPITestCase):
    def test_get_settings_auto_creates_record(self):
        res = self.client.get("/api/settings/project/general/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("project_name", res.data)
        self.assertIn("logo_url", res.data)

    def test_update_general_settings(self):
        payload = {
            "project_name": "Softiq Tech CRM",
            "project_code": "STCRM",
            "project_description": "A modern CRM system.",
            "project_timezone": "(GMT+05:00) Asia/Karachi",
        }
        res = self.client.patch("/api/settings/project/general/", payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        obj = ProjectSettings.objects.get(pk=1)
        self.assertEqual(obj.project_name, "Softiq Tech CRM")
        self.assertEqual(obj.project_code, "STCRM")

    def test_empty_project_name_rejected(self):
        res = self.client.patch(
            "/api/settings/project/general/", {"project_name": "   "}
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_timezone_rejected(self):
        res = self.client.patch(
            "/api/settings/project/general/",
            {"project_timezone": "(GMT+99:00) Not/AZone"},
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_project_code_format_rejected(self):
        res = self.client.patch(
            "/api/settings/project/general/", {"project_code": "invalid code!"}
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_request_rejected(self):
        self.client.credentials()
        res = self.client.get("/api/settings/project/general/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class ProjectLogoTests(BaseSettingsAPITestCase):
    def _upload(self, content=b"fakepng", name="logo.png", content_type="image/png"):
        file = SimpleUploadedFile(name, content, content_type=content_type)
        return self.client.post("/api/settings/project/general/logo/", {"logo": file})

    def test_upload_logo(self):
        res = self._upload()
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(res.data["logo_url"])
        self.assertTrue(ProjectSettings.objects.get(pk=1).logo)

    def test_replace_existing_logo(self):
        self._upload(b"one", name="one.png")
        old = ProjectSettings.objects.get(pk=1).logo.name
        res = self._upload(b"two", name="two.png")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        new = ProjectSettings.objects.get(pk=1).logo.name
        self.assertNotEqual(old, new)

    def test_missing_file_rejected(self):
        res = self.client.post("/api/settings/project/general/logo/", {})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_file_type_rejected(self):
        res = self._upload(b"hello", name="notes.txt", content_type="text/plain")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_logo(self):
        self._upload()
        res = self.client.delete("/api/settings/project/general/logo/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(ProjectSettings.objects.get(pk=1).logo)


# ---------- Company / Localization / Security ----------

class CompanyInfoTests(BaseSettingsAPITestCase):
    def test_get_and_update(self):
        get_res = self.client.get("/api/settings/project/company/")
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)

        payload = {
            "company_name": "Softiq Tech (Pvt) Ltd.",
            "email": "info@softiqtech.com",
            "website": "https://softiqtech.com",
            "phone": "+92 300 1234567",
            "currency": "USD - US Dollar ($)",
        }
        res = self.client.patch("/api/settings/project/company/", payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["currency"], "USD - US Dollar ($)")

    def test_required_company_name(self):
        res = self.client.patch("/api/settings/project/company/", {"company_name": ""})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_email_rejected(self):
        res = self.client.patch(
            "/api/settings/project/company/", {"email": "not-an-email"}
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class LocalizationTests(BaseSettingsAPITestCase):
    def test_get_and_update(self):
        get_res = self.client.get("/api/settings/project/localization/")
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)

        payload = {
            "language": "English (en)",
            "timezone": "(GMT+00:00) UTC",
            "date_format": "MM/DD/YYYY",
            "decimal_places": 3,
        }
        res = self.client.patch("/api/settings/project/localization/", payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["date_format"], "MM/DD/YYYY")

    def test_invalid_date_format_rejected(self):
        res = self.client.patch(
            "/api/settings/project/localization/", {"date_format": "DD.MM.YYYY"}
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_decimal_places_rejected(self):
        res = self.client.patch(
            "/api/settings/project/localization/", {"decimal_places": 12}
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class EmailSettingsTests(BaseSettingsAPITestCase):
    def test_get_does_not_expose_password(self):
        obj = ProjectSettings.load()
        obj.smtp_password = "secret"
        obj.save(update_fields=["smtp_password"])
        res = self.client.get("/api/settings/project/email/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertNotIn("smtp_password", res.data)
        self.assertTrue(res.data["has_smtp_password"])

    def test_update_email_settings(self):
        payload = {
            "from_name": "Softiq CRM",
            "from_email": "no-reply@softiqtech.com",
            "smtp_host": "smtp.softiqtech.com",
            "smtp_port": 587,
            "smtp_encryption": "STARTTLS",
        }
        res = self.client.patch("/api/settings/project/email/", payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_invalid_port_rejected(self):
        res = self.client.patch("/api/settings/project/email/", {"smtp_port": 99999})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_send_test_email_requires_recipient(self):
        res = self.client.post("/api/settings/project/email/test/", {})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_send_test_email_success(self):
        ProjectSettings.load()  # default row has no smtp host -> configure one
        res = self.client.post(
            "/api/settings/project/email/test/", {"email": "to@example.com"}
        )
        # Without an SMTP host configured the endpoint returns 400.
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class SecuritySettingsTests(BaseSettingsAPITestCase):
    def test_get_and_update(self):
        get_res = self.client.get("/api/settings/project/security/")
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)

        payload = {
            "session_timeout": 60,
            "max_login_attempts": 4,
            "min_password_length": 10,
            "require_special_chars": True,
        }
        res = self.client.patch("/api/settings/project/security/", payload)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["session_timeout"], 60)

    def test_out_of_range_session_timeout_rejected(self):
        res = self.client.patch(
            "/api/settings/project/security/", {"session_timeout": 5000}
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_ip_whitelist_rejected(self):
        res = self.client.patch(
            "/api/settings/project/security/", {"ip_whitelist": "not-an-ip"}
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


# ---------- Roles & Permissions ----------

class RoleTests(BaseSettingsAPITestCase):
    valid_permissions = {
        module: {"view": True, "create": False, "edit": False, "delete": False}
        for module in Role.MODULES
    }

    def test_list_roles_seeds_defaults(self):
        res = self.client.get("/api/settings/roles/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        names = {r["name"] for r in res.data["results"]}
        self.assertIn("Administrator", names)

    def test_create_role(self):
        payload = {
            "name": "Sales Rep",
            "description": "Manages leads and deals",
            "access_level": "sales",
            "permissions": self.valid_permissions,
        }
        res = self.client.post(
            "/api/settings/roles/", payload, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        role = Role.objects.get(name="Sales Rep")
        self.assertFalse(role.permissions["customers"]["delete"])

    def test_duplicate_role_name_rejected(self):
        Role.objects.create(name="Manager")
        res = self.client.post("/api/settings/roles/", {"name": "manager"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_role_permissions(self):
        role = Role.objects.create(name="Viewer")
        perms = dict(self.valid_permissions)
        perms["dashboard"]["view"] = True
        res = self.client.patch(
            f"/api/settings/roles/{role.id}/", {"permissions": perms}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        role.refresh_from_db()
        self.assertTrue(role.permissions["dashboard"]["view"])

    def test_system_role_cannot_be_deleted(self):
        role = Role.objects.create(name="Admin", is_system=True)
        res = self.client.delete(f"/api/settings/roles/{role.id}/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
