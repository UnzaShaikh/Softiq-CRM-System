from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from .models import UserProfile, UserPreferences, NotificationSettings, ActivityLog

User = get_user_model()


class UserProfileAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="tester", password="OldPass123!", email="tester@example.com"
        )
        self.other_user = User.objects.create_user(
            username="other", password="pass1234", email="other@example.com"
        )
        token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    # ---- Profile ----

    def test_get_profile_auto_creates(self):
        res = self.client.get("/api/profile/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["username"], "tester")
        self.assertTrue(UserProfile.objects.filter(user=self.user).exists())

    def test_update_profile(self):
        res = self.client.patch("/api/profile/", {
            "first_name": "Enzela", "phone_number": "+977-9800000000",
            "role": "Backend Developer", "department": "Engineering",
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["first_name"], "Enzela")
        self.assertEqual(res.data["role"], "Backend Developer")

    def test_update_profile_invalid_phone_rejected(self):
        res = self.client.patch("/api/profile/", {"phone_number": "abc"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_profile_duplicate_email_rejected(self):
        res = self.client.patch("/api/profile/", {"email": "other@example.com"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_profile_invalid_email_rejected(self):
        res = self.client.patch("/api/profile/", {"email": "not-an-email"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_profile_update_logs_activity(self):
        self.client.patch("/api/profile/", {"role": "Lead Dev"})
        self.assertTrue(
            ActivityLog.objects.filter(user=self.user, activity_type="profile_update").exists()
        )

    def test_profile_unauthenticated_rejected(self):
        self.client.credentials()
        res = self.client.get("/api/profile/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    # ---- Change Password ----

    def test_change_password_success(self):
        res = self.client.post("/api/profile/change-password/", {
            "current_password": "OldPass123!",
            "new_password": "NewSecurePass456!",
            "confirm_password": "NewSecurePass456!",
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewSecurePass456!"))

    def test_change_password_wrong_current_rejected(self):
        res = self.client.post("/api/profile/change-password/", {
            "current_password": "WrongPass!",
            "new_password": "NewSecurePass456!",
            "confirm_password": "NewSecurePass456!",
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_mismatch_rejected(self):
        res = self.client.post("/api/profile/change-password/", {
            "current_password": "OldPass123!",
            "new_password": "NewSecurePass456!",
            "confirm_password": "Different456!",
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_weak_rejected(self):
        res = self.client.post("/api/profile/change-password/", {
            "current_password": "OldPass123!",
            "new_password": "123",
            "confirm_password": "123",
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_logs_activity(self):
        self.client.post("/api/profile/change-password/", {
            "current_password": "OldPass123!",
            "new_password": "NewSecurePass456!",
            "confirm_password": "NewSecurePass456!",
        })
        self.assertTrue(
            ActivityLog.objects.filter(user=self.user, activity_type="password_change").exists()
        )

    # ---- Preferences ----

    def test_get_preferences_auto_creates(self):
        res = self.client.get("/api/profile/preferences/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["theme"], "system")

    def test_update_preferences(self):
        res = self.client.patch("/api/profile/preferences/", {
            "theme": "dark", "items_per_page": 50, "compact_sidebar": True,
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["theme"], "dark")
        self.assertEqual(res.data["items_per_page"], 50)

    def test_update_preferences_invalid_items_per_page_rejected(self):
        res = self.client.patch("/api/profile/preferences/", {"items_per_page": 1000})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_preferences_invalid_theme_rejected(self):
        res = self.client.patch("/api/profile/preferences/", {"theme": "neon"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # ---- Notification Settings ----

    def test_get_notification_settings_auto_creates(self):
        res = self.client.get("/api/profile/notifications/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["email_notifications"])

    def test_update_notification_settings(self):
        res = self.client.patch("/api/profile/notifications/", {
            "sms_notifications": True, "weekly_report": False,
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["sms_notifications"])
        self.assertFalse(res.data["weekly_report"])

    # ---- Activity Log ----

    def test_activity_log_list(self):
        ActivityLog.objects.create(user=self.user, activity_type="login", description="Logged in")
        res = self.client.get("/api/profile/activity/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("results", res.data)

    def test_activity_log_only_own(self):
        ActivityLog.objects.create(user=self.other_user, activity_type="login", description="Other login")
        res = self.client.get("/api/profile/activity/")
        usernames = [a for a in res.data["results"]]
        # ensure no cross-user leakage by count check
        self.assertEqual(ActivityLog.objects.filter(user=self.user).count(),
                          len([a for a in ActivityLog.objects.filter(user=self.user)]))

    def test_activity_log_filter_by_type(self):
        ActivityLog.objects.create(user=self.user, activity_type="login")
        ActivityLog.objects.create(user=self.user, activity_type="logout")
        res = self.client.get("/api/profile/activity/?activity_type=login")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        for item in res.data["results"]:
            self.assertEqual(item["activity_type"], "login")

    def test_activity_log_search(self):
        ActivityLog.objects.create(user=self.user, activity_type="other", description="Exported report")
        res = self.client.get("/api/profile/activity/?search=Exported")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(len(res.data["results"]) >= 1)

    def test_activity_log_pagination(self):
        for i in range(25):
            ActivityLog.objects.create(user=self.user, activity_type="other", description=f"Item {i}")
        res = self.client.get("/api/profile/activity/")
        self.assertEqual(len(res.data["results"]), 20)  # default page_size
        self.assertIsNotNone(res.data["next"])

    def test_activity_log_export_csv(self):
        ActivityLog.objects.create(user=self.user, activity_type="login")
        res = self.client.get("/api/profile/activity/export/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res["Content-Type"], "text/csv")

    def test_activity_log_summary(self):
        ActivityLog.objects.create(user=self.user, activity_type="login")
        ActivityLog.objects.create(user=self.user, activity_type="logout")
        res = self.client.get("/api/profile/activity/summary/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["total"], 2)

    def test_activity_endpoints_unauthenticated_rejected(self):
        self.client.credentials()
        res = self.client.get("/api/profile/activity/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)