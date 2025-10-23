from django.contrib import admin
from .models import Tenant
# Register your models here.

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ['name','subdomain', 'email','phone_number','is_active', 'subscription_tier', 'subscription_status', 'created_at']
    list_filter = ['is_active', 'subscription_tier', 'subscription_status','created_at']
    search_fields = ['name', 'subdomain', 'email','phone_number']
    list_editable = ['is_active', 'subscription_status']
    readonly_fields = ['created_at']
    actions = ['approve_tenants', 'reject_tenants']

    def approve_tenants(self, request,queryset):
        updated = queryset.update(subscription_status='active', is_active=True)
        self.message_user(request, f'{updated} tenants approved successfully.')
    approve_tenants.short_description = "Approve selected tenants"

    def reject_tenants(self, request,queryset):
        updated = queryset.update(subscription_status='inactive', is_active=False)
        self.message_user(request, f'{updated} tenants rejected.')
    reject_tenants.short_description = "Reject selected tenants"
