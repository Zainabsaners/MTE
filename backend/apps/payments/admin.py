from django.contrib import admin
from .models import SubscriptionPayment, MpesaPayment
# Register your models here.
@admin.register(SubscriptionPayment)
class SubscriptionPaymentAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'amount', 'status', 'mpesa_transaction_id', 'created_at']
    list_filter = ['tenant', 'status', 'created_at']
    search_fields = ['tenant__name', 'mpesa_transaction_id']
    readonly_fields = ['created_at']
    list_select_related = ['tenant']

    
@admin.register(MpesaPayment)
class MpesaPaymentAdmin(admin.ModelAdmin):
    list_display = ['phone_number', 'amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['phone_number', 'mpesa_receipt_number']