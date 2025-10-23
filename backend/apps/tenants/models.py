from django.db import models
import uuid

# Create your models here.
class Tenant(models.Model):
    TIER_CHOICES = [
        ('basic', 'BASIC - 100 products'),
        ('premium', 'Premium - 1000 products'),
        ('enterprise', 'Enterprise - Unlimited products'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable= False)
    name = models.CharField(max_length=255)
    subdomain = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    subscription_tier = models.CharField(max_length=50, choices=TIER_CHOICES, default='basic')
    subscription_status = models.CharField(max_length=20,choices=STATUS_CHOICES, default='inactive')
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    mpesa_business_shortcode = models.CharField(max_length=20,blank=True, default= '')
    mpesa_account_number = models.CharField(max_length=20,blank=True, default= '')
    description = models.TextField(blank=True)
    owner_name = models.CharField(max_length=255, blank=True)
    owner_email = models.EmailField(blank=True)
    business_registration = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    store_logo = models.ImageField(upload_to='store_logos/', blank=True, null=True)

    class Meta:
        db_table = 'tenants'
        ordering = ['-created_at']

    def __str__(self):
        return self.name    

class StoreSettings(models.Model):
    store = models.OneToOneField(
        'Tenant',  # Reference the Tenant model
        on_delete=models.CASCADE,
        related_name='settings'
    )
    
    # Store Profile (complementing existing Tenant fields)
    description = models.TextField(blank=True, default='')
    email = models.EmailField(blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    address = models.TextField(blank=True, default='')
    website = models.URLField(blank=True, default='')
    facebook = models.URLField(blank=True, default='')
    instagram = models.URLField(blank=True, default='')
    twitter = models.URLField(blank=True, default='')
    
    # MPESA Settings (extending existing MPESA fields)
    mpesa_consumer_key = models.CharField(max_length=255, blank=True, default='')
    mpesa_consumer_secret = models.CharField(max_length=255, blank=True, default='')
    mpesa_passkey = models.CharField(max_length=255, blank=True, default='')
    mpesa_environment = models.CharField(
        max_length=20, 
        choices=[('sandbox', 'Sandbox'), ('production', 'Production')], 
        default='sandbox'
    )
    
    # Shipping Settings
    shipping_enabled = models.BooleanField(default=True)
    free_shipping_threshold = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default= None)
    shipping_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=None)
    processing_time = models.CharField(max_length=20, default='1-3')
    
    # Appearance
    theme_color = models.CharField(max_length=7, default='#3498db')
    logo = models.ImageField(upload_to='store_logos/', null=True, blank=True)
    store_layout = models.CharField(
        max_length=20, 
        choices=[
            ('standard', 'Standard'), 
            ('modern', 'Modern'), 
            ('minimal', 'Minimal'), 
            ('grid', 'Grid')
        ], 
        default='standard'
    )
    
    # Notifications
    email_notifications = models.BooleanField(default=True)
    order_notifications = models.BooleanField(default=True)
    low_stock_alerts = models.BooleanField(default=True)
    customer_emails = models.BooleanField(default=True)
    newsletter_subscription = models.BooleanField(default=False)
    notification_email = models.EmailField(blank=True, default='')
    
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Settings for {self.store.name}"

    class Meta:
        verbose_name_plural = "Store Settings"
