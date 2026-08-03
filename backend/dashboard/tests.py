from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


class DashboardSummaryTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', password='testpass123'
        )
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

    def test_dashboard_summary_authenticated(self):
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        response = self.client.get('/api/dashboard/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_customers', response.data)
        self.assertIn('total_leads', response.data)
        self.assertIn('opportunities', response.data)
        self.assertIn('revenue', response.data)
        self.assertIn('tasks_due', response.data)

    def test_dashboard_summary_unauthenticated(self):
        response = self.client.get('/api/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)