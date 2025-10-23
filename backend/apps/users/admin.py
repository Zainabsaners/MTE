from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import customUser

# Register your models here.
admin.register(customUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'Email', 'phone_number', 'tenant', 'is_vendor_admin', 'is_vendor_staff', 'is_customer', 'is_active']
    list_filter = ['tenant', 'is_vendor_admin', 'is_vendor_staff', 'is_customer', 'is_active', 'is_staff']
    search_fields =['username', 'Email', 'phone_number','first_name', 'last_name']
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {
            'fields': ('phone_number', 'tenant', 'is_vendor_admin','is_vendor_staff','is_customer')
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {
            'fields': ('phone_number', 'tenant', 'is_vendor_admin', 'is_vendor_staff', 'is_customer')
        }),
    )