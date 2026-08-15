from django.contrib.auth import get_user_model

from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status

from .models import EmailTemplate, TemplateActivity


User = get_user_model()


class EmailTemplateAPITests(APITestCase):

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

        self.template = EmailTemplate.objects.create(
            name="Welcome Email",
            subject="Welcome",
            content="Welcome {{first_name}} from {{company_name}}",
            category="onboarding",
            template_type="public",
            status="active",
            created_by=self.user,
            updated_by=self.user,
        )

    # ---------------------------------------------------------
    # CREATE
    # ---------------------------------------------------------

    def test_create_template(self):
        payload = {
            "name": "Follow Up Email",
            "subject": "Following up, {{first_name}}",
            "content": "Hi {{first_name}}, just checking in.",
            "category": "follow_up",
            "template_type": "public",
            "status": "active",
        }

        res = self.client.post(
            "/api/email-templates/",
            payload,
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertIn(
            "first_name",
            res.data["variables_used"],
        )

    def test_create_missing_name_rejected(self):
        payload = {
            "subject": "x",
            "content": "y",
        }

        res = self.client.post(
            "/api/email-templates/",
            payload,
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_create_empty_content_rejected(self):
        payload = {
            "name": "Empty",
            "subject": "x",
            "content": "   ",
        }

        res = self.client.post(
            "/api/email-templates/",
            payload,
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_create_invalid_category_rejected(self):
        payload = {
            "name": "Bad category",
            "subject": "x",
            "content": "y",
            "category": "not_a_category",
        }

        res = self.client.post(
            "/api/email-templates/",
            payload,
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_create_invalid_template_type_rejected(self):
        payload = {
            "name": "Bad type",
            "subject": "x",
            "content": "y",
            "template_type": "shared",
        }

        res = self.client.post(
            "/api/email-templates/",
            payload,
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_create_invalid_status_rejected(self):
        payload = {
            "name": "Bad status",
            "subject": "x",
            "content": "y",
            "status": "draft",
        }

        res = self.client.post(
            "/api/email-templates/",
            payload,
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_creates_activity_log_on_create(self):
        payload = {
            "name": "Activity Test",
            "subject": "x",
            "content": "y",
        }

        res = self.client.post(
            "/api/email-templates/",
            payload,
        )

        template_id = res.data["id"]

        self.assertTrue(
            TemplateActivity.objects.filter(
                template_id=template_id,
                action="created",
            ).exists()
        )

    # ---------------------------------------------------------
    # LIST / RETRIEVE
    # ---------------------------------------------------------

    def test_list_templates(self):
        res = self.client.get(
            "/api/email-templates/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

    def test_get_template_by_id(self):
        res = self.client.get(
            f"/api/email-templates/{self.template.id}/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            res.data["name"],
            "Welcome Email",
        )

        self.assertIn(
            "company_name",
            res.data["variables_used"],
        )

    def test_get_nonexistent_template_404(self):
        res = self.client.get(
            "/api/email-templates/999999/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    # ---------------------------------------------------------
    # UPDATE
    # ---------------------------------------------------------

    def test_update_template_partial(self):
        res = self.client.patch(
            f"/api/email-templates/{self.template.id}/",
            {"subject": "New subject"},
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            res.data["subject"],
            "New subject",
        )

        self.assertEqual(
            res.data["name"],
            "Welcome Email",
        )

    def test_update_by_non_owner_rejected(self):
        other_token = RefreshToken.for_user(
            self.other_user
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {other_token.access_token}"
        )

        res = self.client.patch(
            f"/api/email-templates/{self.template.id}/",
            {"subject": "Hijack"},
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    # ---------------------------------------------------------
    # VISIBILITY
    # ---------------------------------------------------------

    def test_private_template_not_visible_to_other_users(self):
        self.template.template_type = "private"
        self.template.save(
            update_fields=["template_type"]
        )

        other_token = RefreshToken.for_user(
            self.other_user
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {other_token.access_token}"
        )

        res = self.client.get(
            f"/api/email-templates/{self.template.id}/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_public_template_visible_to_other_users(self):
        public = EmailTemplate.objects.create(
            name="Public Template",
            subject="x",
            content="y",
            template_type="public",
            created_by=self.user,
            updated_by=self.user,
        )

        other_token = RefreshToken.for_user(
            self.other_user
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {other_token.access_token}"
        )

        res = self.client.get(
            f"/api/email-templates/{public.id}/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

    # ---------------------------------------------------------
    # DELETE
    # ---------------------------------------------------------

    def test_soft_delete_template(self):
        res = self.client.delete(
            f"/api/email-templates/{self.template.id}/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.template.refresh_from_db()

        self.assertTrue(
            self.template.is_deleted
        )

        res = self.client.get(
            f"/api/email-templates/{self.template.id}/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_delete_by_non_owner_rejected(self):
        other_token = RefreshToken.for_user(
            self.other_user
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {other_token.access_token}"
        )

        res = self.client.delete(
            f"/api/email-templates/{self.template.id}/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    # ---------------------------------------------------------
    # DUPLICATE / STATUS
    # ---------------------------------------------------------

    def test_duplicate_template(self):
        res = self.client.post(
            f"/api/email-templates/{self.template.id}/duplicate/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertNotEqual(
            res.data["id"],
            self.template.id,
        )

        self.assertIn(
            "Copy",
            res.data["name"],
        )

        self.assertEqual(
            res.data["content"],
            self.template.content,
        )

        self.assertTrue(
            EmailTemplate.objects.filter(
                id=self.template.id,
                is_deleted=False,
            ).exists()
        )

    def test_update_status_valid(self):
        res = self.client.patch(
            f"/api/email-templates/{self.template.id}/status/",
            {"status": "inactive"},
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            res.data["status"],
            "inactive",
        )

    def test_update_status_invalid(self):
        res = self.client.patch(
            f"/api/email-templates/{self.template.id}/status/",
            {"status": "archived"},
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # ---------------------------------------------------------
    # PREVIEW
    # ---------------------------------------------------------

    def test_preview_renders_sample_values(self):
        res = self.client.get(
            f"/api/email-templates/{self.template.id}/preview/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "John",
            res.data["rendered_content"],
        )

        self.template.refresh_from_db()

        self.assertIn(
            "{{first_name}}",
            self.template.content,
        )

    def test_preview_custom_sample_values(self):
        res = self.client.post(
            f"/api/email-templates/{self.template.id}/preview/",
            {"sample_values": {"first_name": "Sarah"}},
            format="json",
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "Sarah",
            res.data["rendered_content"],
        )

    # ---------------------------------------------------------
    # ACTIVITY
    # ---------------------------------------------------------

    def test_activity_log_endpoint(self):
        self.client.patch(
            f"/api/email-templates/{self.template.id}/",
            {"subject": "Updated"},
        )

        res = self.client.get(
            f"/api/email-templates/{self.template.id}/activity/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        actions = [
            action["action"]
            for action in res.data
        ]

        self.assertIn(
            "updated",
            actions,
        )

    # ---------------------------------------------------------
    # FILTERING
    # ---------------------------------------------------------

    def test_filter_by_category(self):
        res = self.client.get(
            "/api/email-templates/?category=onboarding"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        for item in res.data["results"]:
            self.assertEqual(
                item["category"],
                "onboarding",
            )

    def test_filter_by_status(self):
        res = self.client.get(
            "/api/email-templates/?status=active"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        for item in res.data["results"]:
            self.assertEqual(
                item["status"],
                "active",
            )

    def test_filter_by_template_type(self):
        res = self.client.get(
            "/api/email-templates/?template_type=private"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        for item in res.data["results"]:
            self.assertEqual(
                item["template_type"],
                "private",
            )

    # ---------------------------------------------------------
    # PAGINATION
    # ---------------------------------------------------------

    def test_list_templates_pagination_metadata(self):
        res = self.client.get(
            "/api/email-templates/?page=1&page_size=2"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn("count", res.data)
        self.assertIn("total_pages", res.data)
        self.assertIn("current_page", res.data)
        self.assertIn("page_size", res.data)
        self.assertIn("next", res.data)
        self.assertIn("previous", res.data)
        self.assertIn("results", res.data)

        self.assertEqual(
            res.data["current_page"],
            1,
        )

        self.assertEqual(
            res.data["page_size"],
            2,
        )

    def test_list_templates_pagination(self):
        for i in range(5):
            EmailTemplate.objects.create(
                name=f"Pagination Template {i}",
                subject=f"Subject {i}",
                content=f"Content {i}",
                category="general",
                template_type="public",
                status="active",
                created_by=self.user,
                updated_by=self.user,
            )

        res = self.client.get(
            "/api/email-templates/?page=1&page_size=2"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            res.data["page_size"],
            2,
        )

        self.assertEqual(
            res.data["current_page"],
            1,
        )

        self.assertGreaterEqual(
            res.data["total_pages"],
            3,
        )

        self.assertEqual(
            len(res.data["results"]),
            2,
        )

    def test_list_templates_second_page(self):
        for i in range(5):
            EmailTemplate.objects.create(
                name=f"Page Template {i}",
                subject=f"Subject {i}",
                content=f"Content {i}",
                category="general",
                template_type="public",
                status="active",
                created_by=self.user,
                updated_by=self.user,
            )

        res = self.client.get(
            "/api/email-templates/?page=2&page_size=2"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            res.data["current_page"],
            2,
        )

        self.assertEqual(
            res.data["page_size"],
            2,
        )

        self.assertIsNotNone(
            res.data["previous"]
        )

    def test_list_templates_custom_page_size(self):
        for i in range(5):
            EmailTemplate.objects.create(
                name=f"Page Size Template {i}",
                subject=f"Subject {i}",
                content=f"Content {i}",
                category="general",
                template_type="public",
                status="active",
                created_by=self.user,
                updated_by=self.user,
            )

        res = self.client.get(
            "/api/email-templates/?page=1&page_size=3"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            res.data["page_size"],
            3,
        )

        self.assertEqual(
            len(res.data["results"]),
            3,
        )

    # ---------------------------------------------------------
    # ORDERING
    # ---------------------------------------------------------

    def test_order_templates_by_name(self):
        EmailTemplate.objects.create(
            name="AAA Template",
            subject="Subject",
            content="Content",
            category="general",
            template_type="public",
            status="active",
            created_by=self.user,
            updated_by=self.user,
        )

        EmailTemplate.objects.create(
            name="ZZZ Template",
            subject="Subject",
            content="Content",
            category="general",
            template_type="public",
            status="active",
            created_by=self.user,
            updated_by=self.user,
        )

        res = self.client.get(
            "/api/email-templates/?ordering=name"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        names = [
            item["name"]
            for item in res.data["results"]
        ]

        self.assertEqual(
            names,
            sorted(names),
        )

    def test_order_templates_by_name_descending(self):
        EmailTemplate.objects.create(
            name="AAA Template",
            subject="Subject",
            content="Content",
            category="general",
            template_type="public",
            status="active",
            created_by=self.user,
            updated_by=self.user,
        )

        EmailTemplate.objects.create(
            name="ZZZ Template",
            subject="Subject",
            content="Content",
            category="general",
            template_type="public",
            status="active",
            created_by=self.user,
            updated_by=self.user,
        )

        res = self.client.get(
            "/api/email-templates/?ordering=-name"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        names = [
            item["name"]
            for item in res.data["results"]
        ]

        self.assertEqual(
            names,
            sorted(names, reverse=True),
        )

    def test_order_templates_by_updated_at(self):
        res = self.client.get(
            "/api/email-templates/?ordering=-updated_at"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "results",
            res.data,
        )

    def test_invalid_ordering_is_ignored(self):
        res = self.client.get(
            "/api/email-templates/?ordering=invalid_field"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "results",
            res.data,
        )

    # ---------------------------------------------------------
    # SUPPORTING APIs
    # ---------------------------------------------------------

    def test_categories_api(self):
        res = self.client.get(
            "/api/email-templates/categories/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        values = [
            item["value"]
            for item in res.data
        ]

        labels = [
            item["label"]
            for item in res.data
        ]

        self.assertIn("onboarding", values)
        self.assertIn("follow_up", values)
        self.assertIn("proposal", values)
        self.assertIn("thank_you", values)
        self.assertIn("general", values)
        self.assertIn("newsletter", values)
        self.assertIn("support", values)

        self.assertIn("Onboarding", labels)
        self.assertIn("Follow-up", labels)

    def test_template_types_api(self):
        res = self.client.get(
            "/api/email-templates/types/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        values = [
            item["value"]
            for item in res.data
        ]

        self.assertIn("public", values)
        self.assertIn("private", values)

    def test_statuses_api(self):
        res = self.client.get(
            "/api/email-templates/statuses/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        values = [
            item["value"]
            for item in res.data
        ]

        self.assertIn("active", values)
        self.assertIn("inactive", values)

    def test_variables_api(self):
        res = self.client.get(
            "/api/email-templates/variables/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        keys = [
            item["key"]
            for item in res.data
        ]

        self.assertIn("company_name", keys)
        self.assertIn("contact_name", keys)
        self.assertIn("first_name", keys)
        self.assertIn("last_name", keys)
        self.assertIn("email", keys)
        self.assertIn("date", keys)

    def test_categories_require_authentication(self):
        self.client.credentials()

        res = self.client.get(
            "/api/email-templates/categories/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    # ---------------------------------------------------------
    # SEARCH
    # ---------------------------------------------------------

    def test_search_by_template_name(self):
        res = self.client.get(
            "/api/email-templates/?search=Welcome"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        names = [
            item["name"]
            for item in res.data["results"]
        ]

        self.assertIn(
            "Welcome Email",
            names,
        )

    def test_search_by_subject(self):
        res = self.client.get(
            "/api/email-templates/?search=Welcome"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertGreaterEqual(
            len(res.data["results"]),
            1,
        )

    def test_search_by_content(self):
        res = self.client.get(
            "/api/email-templates/?search=Welcome"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertGreaterEqual(
            len(res.data["results"]),
            1,
        )

    def test_search_no_results(self):
        res = self.client.get(
            "/api/email-templates/?search=doesnotexist"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            res.data["count"],
            0,
        )

        self.assertEqual(
            res.data["results"],
            [],
        )

    # ---------------------------------------------------------
    # COMBINED FILTERS
    # ---------------------------------------------------------

    def test_combined_filters(self):
        EmailTemplate.objects.create(
            name="Public Welcome",
            subject="Welcome",
            content="Welcome {{first_name}}",
            category="onboarding",
            template_type="public",
            status="active",
            created_by=self.user,
            updated_by=self.user,
        )

        res = self.client.get(
            "/api/email-templates/"
            "?search=Welcome"
            "&category=onboarding"
            "&template_type=public"
            "&status=active"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        for item in res.data["results"]:
            self.assertIn(
                "Welcome",
                item["name"] + " " + item["subject"],
            )

            self.assertEqual(
                item["category"],
                "onboarding",
            )

            self.assertEqual(
                item["template_type"],
                "public",
            )

            self.assertEqual(
                item["status"],
                "active",
            )

    def test_invalid_category_rejected(self):
        res = self.client.get(
            "/api/email-templates/?category=invalid"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_invalid_template_type_rejected(self):
        res = self.client.get(
            "/api/email-templates/?template_type=shared"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_invalid_status_rejected(self):
        res = self.client.get(
            "/api/email-templates/?status=draft"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_search_filter_and_pagination_together(self):
        res = self.client.get(
            "/api/email-templates/"
            "?search=Welcome"
            "&category=onboarding"
            "&status=active"
            "&page=1"
            "&page_size=5"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "count",
            res.data,
        )

        self.assertIn(
            "results",
            res.data,
        )

        self.assertIn(
            "current_page",
            res.data,
        )

        self.assertIn(
            "page_size",
            res.data,
        )

        self.assertIn(
            "total_pages",
            res.data,
        )

    def test_template_statistics(self):
        EmailTemplate.objects.create(
            name="Active Public",
            subject="Active",
            content="Content",
            category="general",
            template_type="public",
            status="active",
            created_by=self.user,
            updated_by=self.user,
        )

        EmailTemplate.objects.create(
            name="Inactive Public",
            subject="Inactive",
            content="Content",
            category="general",
            template_type="public",
            status="inactive",
            created_by=self.user,
            updated_by=self.user,
        )

        EmailTemplate.objects.create(
            name="Private Template",
            subject="Private",
            content="Content",
            category="proposal",
            template_type="private",
            status="active",
            created_by=self.user,
            updated_by=self.user,
        )

        res = self.client.get(
            "/api/email-templates/statistics/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn("total", res.data)
        self.assertIn("active", res.data)
        self.assertIn("inactive", res.data)
        self.assertIn("public", res.data)
        self.assertIn("private", res.data)
        self.assertIn("categories", res.data)

        self.assertEqual(
            res.data["total"],
            4,
        )

        self.assertEqual(
            res.data["active"],
            3,
        )

        self.assertEqual(
            res.data["inactive"],
            1,
        )

        self.assertEqual(
            res.data["public"],
            3,
        )

        self.assertEqual(
            res.data["private"],
            1,
        )

        self.assertEqual(
            res.data["categories"]["general"],
            2,
        )

        self.assertEqual(
            res.data["categories"]["proposal"],
            1,
        )

        self.assertEqual(
            res.data["categories"]["onboarding"],
            1,
        )

    def test_template_statistics_empty(self):
        EmailTemplate.objects.all().delete()

        res = self.client.get(
            "/api/email-templates/statistics/"
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            res.data["total"],
            0,
        )

        self.assertEqual(
            res.data["active"],
            0,
        )

        self.assertEqual(
            res.data["inactive"],
            0,
        )

        self.assertEqual(
            res.data["public"],
            0,
        )

        self.assertEqual(
            res.data["private"],
            0,
        )

        self.assertEqual(
            res.data["categories"],
            {},
        )

    def test_preview_renders_multiple_variables(self):
        res = self.client.post(
            f"/api/email-templates/{self.template.id}/preview/",
            {
                "sample_values": {
                    "first_name": "Habib",
                    "company_name": "Softiq Tech",
                }
            },
            format="json",
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "Habib",
            res.data["rendered_content"],
        )

        self.assertIn(
            "Softiq Tech",
            res.data["rendered_content"],
        )

    def test_preview_does_not_modify_original_template(self):
        original_content = self.template.content

        res = self.client.post(
            f"/api/email-templates/{self.template.id}/preview/",
            {
                "sample_values": {
                    "first_name": "Habib",
                    "company_name": "Softiq Tech",
                }
            },
            format="json",
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.template.refresh_from_db()

        self.assertEqual(
            self.template.content,
            original_content,
        )

        self.assertIn(
            "{{first_name}}",
            self.template.content,
        )

        self.assertIn(
            "{{company_name}}",
            self.template.content,
        )

    def test_preview_renders_company_name(self):
        res = self.client.post(
            f"/api/email-templates/{self.template.id}/preview/",
            {
                "sample_values": {
                    "company_name": "Softiq Tech CRM",
                }
            },
            format="json",
        )

        self.assertEqual(
            res.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "Softiq Tech CRM",
            res.data["rendered_content"],
        )

        self.assertIn(
            "company_name",
            res.data["variables_used"],
        )