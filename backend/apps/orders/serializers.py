from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.serializers import ProductSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source= 'product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.SerializerMethodField()
      
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'price', 'total_price']
        read_only_fields = ['id', 'price']

    def get_total_price(self,obj):
        return obj.quantity * obj.price
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    customer_username = serializers.CharField(source='customer.username',read_only=True)

    class Meta:
        model= Order
        fields = ['id', 'tenant', 'tenant_name','customer', 'customer_username', 
                  'total_amount', 'status', 'customer_name', 'customer_email',
                  'customer_phone', 'shipping_address', 'items',
                  'mpesa_checkout_request_id', 'mpesa_transaction_id',
                  'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['customer_name', ' customer_emai,', 'customer_phone', 'shipping_address','items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order =Order.objects.create(**validated_data)

        total_amount = 0
        for item_data in item_data:
            product = item_data['product']
            quantity = item_data['quantity']
            price = product.price

            OrderItem.objects.create(
                order= order,
                product =product,
                quantity = quantity,
                price = price
            )
            total_amount += quantity * price
        order.total_amount = total_amount
        order.save()
        return order