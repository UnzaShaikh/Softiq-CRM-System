from datetime import date

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from customers.models import Customer
from leads.models import Lead
from deals.models import Deal

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


class DashboardAggregationTests(TestCase):
    """Tests that dashboard endpoints reflect real customers/leads/deals data."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='seller',
            email='seller@example.com',
            password='testpass123',
            first_name='Sarah',
            last_name='Chen',
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.customer = Customer.objects.create(
            first_name='Priya',
            last_name='Nair',
            email='priya@cloudbase.co',
            phone='555-0100',
            company='CloudBase Ltd',
            status='active',
        )
        self.other_customer = Customer.objects.create(
            first_name='James',
            last_name="O'Brien",
            email='james@retailplus.com',
            phone='555-0200',
            company='Retail Plus',
            status='lead',
        )

        self.lead_1 = Lead.objects.create(
            first_name='David', last_name='Kim', email='d.kim@example.com',
            phone='555-0300', company='NexaCorp', source='website', status='new', score=88,
        )
        Lead.objects.create(
            first_name='Fatima', last_name='Al-Hassan', email='fatima@example.com',
            phone='555-0400', company='ZenBiz', source='referral', status='contacted', score=74,
        )
        Lead.objects.create(
            first_name='Luca', last_name='Bianchi', email='luca@example.com',
            phone='555-0500', company='ItalyTech', source='website', status='qualified', score=91,
        )

        now = timezone.now()
        Deal.objects.create(
            name='Enterprise License',
            customer=self.customer,
            value=10000,
            stage='closed_won',
            expected_close_date=date(now.year, now.month, now.day),
            created_by=self.user,
        )
        Deal.objects.create(
            name='Support Plan',
            customer=self.other_customer,
            value=5000,
            stage='proposal',
            expected_close_date=date(now.year, now.month, now.day),
            created_by=self.user,
        )
        Deal.objects.create(
            name='Churned Deal',
            customer=self.other_customer,
            value=9000,
            stage='closed_lost',
            expected_close_date=date(now.year, now.month, now.day),
            created_by=self.user,
        )

        # Deterministic ordering for recent lists
        Customer.objects.filter(id=self.customer.id).update(created_at=timezone.now())
        Customer.objects.filter(id=self.other_customer.id).update(created_at=timezone.now() - timezone.timedelta(minutes=1))
        for i, lead in enumerate([self.lead_1, *Lead.objects.exclude(id=self.lead_1.id)]):
            Lead.objects.filter(id=lead.id).update(created_at=timezone.now() - timezone.timedelta(minutes=i))

    def test_summary_reflects_real_data(self):
        response = self.client.get('/api/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data['total_customers'], 2)
        self.assertEqual(data['active_customers'], 1)
        self.assertEqual(data['total_deals'], 2)  # 'proposal' + 'closed_won' are open stages
        self.assertEqual(float(data['total_revenue']), 10000.00)
        self.assertEqual(len(data['recent_customers']), 2)
        self.assertEqual(data['recent_customers'][0]['name'], 'Priya Nair')
        self.assertEqual(len(data['recent_leads']), 3)

    def test_sales_overview_counts_won_deals(self):
        response = self.client.get('/api/dashboard/sales-overview/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(len(data['months']), 12)
        self.assertEqual(len(data['revenue']), 12)
        self.assertEqual(len(data['deals_closed']), 12)
        now = timezone.now()
        self.assertEqual(data['revenue'][now.month - 1], 10000.0)
        self.assertEqual(data['deals_closed'][now.month - 1], 1)

    def test_lead_sources_percentages(self):
        response = self.client.get('/api/dashboard/lead-sources/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        by_source = {item['source']: item for item in data}
        self.assertEqual(by_source['Website']['count'], 2)
        self.assertEqual(by_source['Referral']['count'], 1)
        self.assertEqual(sum(item['percentage'] for item in data), 100)

    def test_deals_pipeline_stage_counts(self):
        response = self.client.get('/api/dashboard/deals-pipeline/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        by_stage = {item['stage']: item for item in data}
        self.assertEqual(by_stage['closed_won']['count'], 1)
        self.assertEqual(float(by_stage['closed_won']['total_value']), 10000.00)
        self.assertEqual(by_stage['proposal']['count'], 1)
        self.assertEqual(float(by_stage['proposal']['total_value']), 5000.00)
        self.assertEqual(by_stage['closed_lost']['count'], 1)
        self.assertEqual(by_stage['closed_won']['deals'][0]['customer'], 'Priya Nair')

    def test_recent_customers_include_won_revenue(self):
        response = self.client.get('/api/dashboard/recent-customers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        by_name = {item['name']: item for item in data}
        self.assertEqual(float(by_name['Priya Nair']['revenue']), 10000.00)
        self.assertEqual(float(by_name["James O'Brien"]['revenue']), 0.00)
        self.assertEqual(by_name['Priya Nair']['status'], 'active')

    def test_recent_leads_shape(self):
        response = self.client.get('/api/dashboard/recent-leads/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(len(data), 3)
        self.assertEqual(data[0]['name'], 'David Kim')
        self.assertEqual(data[0]['source'], 'website')
        self.assertEqual(data[0]['score'], 88)

    def test_recent_activities_synthesized(self):
        response = self.client.get('/api/dashboard/recent-activities/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(len(data), 8)  # 2 customers + 3 leads + 3 deals
        types = {item['type'] for item in data}
        self.assertIn('Customer Added', types)
        self.assertIn('Lead Added', types)
        self.assertIn('Deal Created', types)
        self.assertIn('Deal Won', types)

    def test_top_performers_ranking(self):
        response = self.client.get('/api/dashboard/top-performers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'Sarah Chen')
        self.assertEqual(data[0]['closed_deals'], 1)
        self.assertEqual(float(data[0]['revenue']), 10000.00)
        self.assertEqual(data[0]['performance_percentage'], 100)