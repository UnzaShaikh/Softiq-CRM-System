from django.contrib.auth import get_user_model
from django.test import TestCase

from user_profile.models import NotificationSettings

from .models import Notification
from .services import create_notification


User = get_user_model()


class NotificationPreferenceTests(TestCase):
    """
    Tests notification creation based on user notification preferences.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username="notification_test_user",
            email="notification@test.com",
            password="TestPassword123!",
        )

        self.settings = NotificationSettings.objects.create(
            user=self.user
        )

    def test_activity_notification_created_when_enabled(self):
        """
        Activity notification should be created when
        activity_notifications is enabled.
        """

        self.settings.activity_notifications = True
        self.settings.save()

        notification = create_notification(
            user=self.user,
            title="Activity Test",
            message="Activity notification test.",
            notification_type="activity",
            source_type="activity",
            source_id=1,
        )

        self.assertIsNotNone(notification)

        self.assertEqual(
            Notification.objects.filter(
                user=self.user,
                notification_type="activity",
                source_type="activity",
                source_id=1,
            ).count(),
            1,
        )

    def test_activity_notification_not_created_when_disabled(self):
        """
        Activity notification should not be created when
        activity_notifications is disabled.
        """

        self.settings.activity_notifications = False
        self.settings.save()

        notification = create_notification(
            user=self.user,
            title="Activity Test",
            message="This notification should not be created.",
            notification_type="activity",
            source_type="activity",
            source_id=2,
        )

        self.assertIsNone(notification)

        self.assertEqual(
            Notification.objects.filter(
                user=self.user,
                notification_type="activity",
                source_type="activity",
                source_id=2,
            ).count(),
            0,
        )

    def test_customer_notification_respects_customer_preference(self):
        """
        Customer notification should respect the customer_added preference.
        """

        self.settings.customer_added = False
        self.settings.save()

        notification = create_notification(
            user=self.user,
            title="Customer Test",
            message="This notification should not be created.",
            notification_type="customer_added",
            source_type="customer",
            source_id=1,
        )

        self.assertIsNone(notification)

    def test_customer_notification_created_when_enabled(self):
        """
        Customer notification should be created when the
        customer_added preference is enabled.
        """

        self.settings.customer_added = True
        self.settings.save()

        notification = create_notification(
            user=self.user,
            title="Customer Test",
            message="Customer notification test.",
            notification_type="customer_added",
            source_type="customer",
            source_id=2,
        )

        self.assertIsNotNone(notification)

        self.assertTrue(
            Notification.objects.filter(
                user=self.user,
                notification_type="customer_added",
                source_type="customer",
                source_id=2,
            ).exists()
        )

    def test_task_assignment_respects_preference(self):
        """
        Task assignment notifications should respect
        the task_assigned preference.
        """

        self.settings.task_assigned = False
        self.settings.save()

        notification = create_notification(
            user=self.user,
            title="Task Assigned",
            message="This notification should not be created.",
            notification_type="task_assigned",
            source_type="activity",
            source_id=3,
        )

        self.assertIsNone(notification)

    def test_task_assignment_created_when_enabled(self):
        """
        Task assignment notification should be created
        when task_assigned is enabled.
        """

        self.settings.task_assigned = True
        self.settings.save()

        notification = create_notification(
            user=self.user,
            title="Task Assigned",
            message="You have been assigned a task.",
            notification_type="task_assigned",
            source_type="activity",
            source_id=4,
        )

        self.assertIsNotNone(notification)

    def test_followup_due_respects_preference(self):
        """
        Follow-up due notifications should respect
        the followup_due preference.
        """

        self.settings.followup_due = False
        self.settings.save()

        notification = create_notification(
            user=self.user,
            title="Follow-up Due",
            message="Follow-up is due.",
            notification_type="followup_due",
            source_type="followup",
            source_id=5,
        )

        self.assertIsNone(notification)

    def test_followup_due_created_when_enabled(self):
        """
        Follow-up due notification should be created
        when followup_due is enabled.
        """

        self.settings.followup_due = True
        self.settings.save()

        notification = create_notification(
            user=self.user,
            title="Follow-up Due",
            message="Follow-up is due.",
            notification_type="followup_due",
            source_type="followup",
            source_id=6,
        )

        self.assertIsNotNone(notification)

    def test_new_lead_respects_preference(self):
        """
        New lead notifications should respect the new_lead preference.
        """

        self.settings.new_lead = False
        self.settings.save()

        notification = create_notification(
            user=self.user,
            title="New Lead",
            message="A new lead was created.",
            notification_type="new_lead",
            source_type="lead",
            source_id=7,
        )

        self.assertIsNone(notification)

    def test_new_lead_created_when_enabled(self):
        """
        New lead notification should be created when
        new_lead is enabled.
        """

        self.settings.new_lead = True
        self.settings.save()

        notification = create_notification(
            user=self.user,
            title="New Lead",
            message="A new lead was created.",
            notification_type="new_lead",
            source_type="lead",
            source_id=8,
        )

        self.assertIsNotNone(notification)