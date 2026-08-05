from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Customer, Lead, Deal, Activity

User = get_user_model()

class DashboardAPITests(TestCase):
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
    
    def test_sales_overview(self):
        response = self.client.get('/api/dashboard/sales-overview/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertIn('months', data)
        self.assertIn('revenue', data)
        self.assertIn('deals_closed', data)
        self.assertEqual(len(data['months']), 12)
        self.assertEqual(len(data['revenue']), 12)
        self.assertEqual(len(data['deals_closed']), 12)
    
    def test_lead_sources(self):
        response = self.client.get('/api/dashboard/lead-sources/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        if data:
            self.assertIn('source', data[0])
            self.assertIn('count', data[0])
            self.assertIn('percentage', data[0])
    
    def test_deals_pipeline(self):
        response = self.client.get('/api/dashboard/deals-pipeline/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        if data:
            self.assertIn('stage', data[0])
            self.assertIn('count', data[0])
            self.assertIn('total_value', data[0])
            self.assertIn('deals', data[0])
    
    def test_recent_activities(self):
        response = self.client.get('/api/dashboard/recent-activities/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        if data:
            self.assertIn('type', data[0])
            self.assertIn('customer', data[0])
            self.assertIn('time', data[0])
    
    def test_recent_customers(self):
        response = self.client.get('/api/dashboard/recent-customers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        if data:
            self.assertIn('id', data[0])
            self.assertIn('name', data[0])
            self.assertIn('company', data[0])
            self.assertIn('status', data[0])
            self.assertIn('revenue', data[0])
            self.assertIn('joined_date', data[0])
    
    def test_recent_leads(self):
        response = self.client.get('/api/dashboard/recent-leads/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        if data:
            self.assertIn('id', data[0])
            self.assertIn('name', data[0])
            self.assertIn('company', data[0])
            self.assertIn('source', data[0])
            self.assertIn('status', data[0])
            self.assertIn('score', data[0])
            self.assertIn('date_added', data[0])
    
    def test_top_performers(self):
        response = self.client.get('/api/dashboard/top-performers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        if data:
            self.assertIn('name', data[0])
            self.assertIn('role', data[0])
            self.assertIn('revenue', data[0])
            self.assertIn('closed_deals', data[0])
            self.assertIn('performance_percentage', data[0])