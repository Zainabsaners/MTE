from django.db import models
from apps.tenants.models import Tenant
from django.contrib.auth.models import User  # Add this import
from django.conf import settings
import uuid
import random
import string
from django.utils import timezone  # Fixed import
from cloudinary.models import CloudinaryField 

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        db_table = 'categories'
        unique_together = ['tenant', 'name']
        ordering = ['name']

    def __str__(self):
        return self.name

class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='products')
    Category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)  # Keep as Category
    vendor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='products', null=True, blank= True)  # ADD THIS FIELD
    name = models.CharField(max_length=255)
    description = models.TextField()  # Fixed: TextField instead of TimeField
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_at_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  
    sku = models.CharField(max_length=100, unique=True, blank=True)
    barcode = models.CharField(max_length=100, unique=True, blank=True)
    track_quantity = models.BooleanField(default=True)
    stock_quantity = models.IntegerField(default=0)
    allow_backorder = models.BooleanField(default=False)
    image = CloudinaryField('image', folder='products/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.TextField(blank=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']  

    def __str__(self):
        return self.name    
    
    def generate_sku(self):
        tenant_prefix = self.tenant.name[:3].upper() if self.tenant else 'TEN'
        category_prefix = self.Category.name[:3].upper() if self.Category else 'GEN'  # Keep as Category
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

        sku = f"{tenant_prefix}-{category_prefix}-{random_part}"

        while Product.objects.filter(sku=sku).exists():
            random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            sku = f"{tenant_prefix}-{category_prefix}-{random_part}"
        return sku
    
    def generate_barcode(self):
        if not self.sku:
            self.sku = self.generate_sku()
        base_barcode = f"MTE{self.sku.replace('-', '')}"
        barcode = base_barcode

        counter = 1
        while Product.objects.filter(barcode=barcode).exists():
            barcode = f"{base_barcode}{counter:02d}"
            counter += 1
        return barcode
           
    def save(self, *args, **kwargs):
        if not self.sku:
            self.sku = self.generate_sku()
        
        if not self.barcode:
            self.barcode = self.generate_barcode()

        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)