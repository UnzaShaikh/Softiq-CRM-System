from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Customer(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    company = models.CharField(max_length=255, blank=True, null=True)  # ✅ New
    status = models.CharField(max_length=50, default='active', choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('lead', 'Lead'),
    ])  # ✅ New
    revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)  # ✅ New
    address = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='customers')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class Lead(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('converted', 'Converted'),
        ('lost', 'Lost'),
    ]
    SOURCE_CHOICES = [  # ✅ New
        ('organic', 'Organic Search'),
        ('referral', 'Referral'),
        ('social', 'Social Media'),
        ('email', 'Email Campaign'),
        ('website', 'Website'),
        ('other', 'Other'),
    ]
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    company = models.CharField(max_length=255, blank=True, null=True)  # ✅ New
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES, blank=True, null=True)  # ✅ New
    score = models.IntegerField(default=0)  # ✅ New (lead score 0-100)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='leads')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class Deal(models.Model):
    STATUS_CHOICES = [
        ('discovery', 'Discovery'),
        ('proposal', 'Proposal'),
        ('negotiation', 'Negotiation'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    ]
    name = models.CharField(max_length=255)
    value = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='discovery')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='deals')
    expected_close_date = models.DateField(blank=True, null=True)
    closed_date = models.DateField(blank=True, null=True)  # ✅ New
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='deals')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class Activity(models.Model):  # ✅ New model for activities
    ACTIVITY_TYPES = [
        ('deal_closed', 'Deal Closed'),
        ('customer_added', 'Customer Added'),
        ('lead_added', 'Lead Added'),
        ('deal_updated', 'Deal Updated'),
        ('note_added', 'Note Added'),
    ]
    type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.TextField()
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    lead = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True)
    deal = models.ForeignKey(Deal, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='activities')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.created_at}"

class DealStage(models.Model):  # ✅ New model for pipeline stages
    name = models.CharField(max_length=100)
    order = models.IntegerField()
    deals = models.ManyToManyField(Deal, related_name='stages')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name