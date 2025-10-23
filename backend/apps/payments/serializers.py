from rest_framework import serializers
from .models import SubscriptionPayment, MpesaPayment


class MpesaPaymentSerializer(serializers.ModelSerializer):
    order_id = serializers.UUIDField(source='order.id', read_only=True)
    order_total = serializers.DecimalField(source='order.total', max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = MpesaPayment
        fields = [
            'id', 'order_id', 'order_total', 'phone_number', 'amount', 
            'status', 'mpesa_receipt_number', 'transaction_date',
            'result_code', 'result_description', 'created_at'
        ]
        read_only_fields = [
            'id', 'mpesa_receipt_number', 'transaction_date', 'result_code',
            'result_description', 'created_at'
        ]


class SubscriptionPaymentSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    
    class Meta:
        model = SubscriptionPayment
        fields = [
            'id', 'tenant', 'tenant_name', 'amount', 'status',
            'mpesa_transaction_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class SubscriptionPaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPayment
        fields = ['tenant', 'amount']