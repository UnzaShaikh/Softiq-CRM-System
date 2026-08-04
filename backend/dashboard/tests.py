from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Customer, Lead, Deal

User = get_user_model()


class DashboardSummaryTests(TestCase):
    
    def setUp(self):
        """Set up test data"""
        # Create user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create customers
        self.customer1 = Customer.objects.create(
            name='John Doe',
            email='john@example.com',
            phone='1234567890',
            created_by=self.user
        )
        self.customer2 = Customer.objects.create(
            name='Jane Smith',
            email='jane@example.com',
            phone='0987654321',
            created_by=self.user
        )
        
        # Create leads
        self.lead1 = Lead.objects.create(
            name='Lead 1',
            email='lead1@example.com',
            status='new',
            created_by=self.user
        )
        self.lead2 = Lead.objects.create(
            name='Lead 2',
            email='lead2@example.com',
            status='contacted',
            created_by=self.user
        )
        
        # Create deals
        self.deal1 = Deal.objects.create(
            name='Deal 1',
            value=10000,
            status='won',
            customer=self.customer1,
            created_by=self.user
        )
        self.deal2 = Deal.objects.create(
            name='Deal 2',
            value=5000,
            status='open',
            customer=self.customer2,
            created_by=self.user
        )
        
        # API client
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
    
    def test_dashboard_summary_success(self):
        """Test successful dashboard data retrieval"""
        response = self.client.get('/api/dashboard-summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        
        expected_fields = [
            'total_customers', 'active_customers', 'total_deals',
            'total_revenue', 'recent_customers', 'recent_leads'
        ]
        for field in expected_fields:
            self.assertIn(field, data)
        
        # Check values – revenue is serialized as a string because JSON
        self.assertEqual(data['total_customers'], 2)
        self.assertEqual(data['total_deals'], 2)
        self.assertEqual(data['total_revenue'], '10000.00')   # 👈 string
        self.assertEqual(len(data['recent_customers']), 2)
        self.assertEqual(len(data['recent_leads']), 2)
        self.assertEqual(data['active_customers'], 2)
    
    def test_dashboard_summary_unauthenticated(self):
        """Test that unauthenticated users cannot access dashboard"""
        client = APIClient()
        response = client.get('/api/dashboard-summary/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_dashboard_summary_with_date_filter(self):
        """Test dashboard with date filtering – should work with different days parameter"""
        response = self.client.get('/api/dashboard-summary/?days=10')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data['active_customers'], 2)   # still active (created today)
        
        # With days=0, still should be fine
        response = self.client.get('/api/dashboard-summary/?days=0')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_dashboard_summary_empty_data(self):
        """Test dashboard with no data – all values should be 0/empty"""
        # Delete all data
        Customer.objects.all().delete()
        Lead.objects.all().delete()
        Deal.objects.all().delete()
        
        response = self.client.get('/api/dashboard-summary/')
        data = response.data
        
        self.assertEqual(data['total_customers'], 0)
        self.assertEqual(data['active_customers'], 0)
        self.assertEqual(data['total_deals'], 0)
        self.assertEqual(data['total_revenue'], '0.00')   # 👈 string
        self.assertEqual(len(data['recent_customers']), 0)
        self.assertEqual(len(data['recent_leads']), 0)