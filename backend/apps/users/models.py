from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class customUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, null=True, blank=True)
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    
    is_vendor_admin = models.BooleanField(default=False)
    is_vendor_staff = models.BooleanField(default=False)
    is_vendor_customer = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.username} ({self.email})"
    
    # Add create_user method for convenience
    @classmethod
    def create_user(cls, username, email, password, **extra_fields):
        user = cls(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user