from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    Product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ['id', 'Product_count']

    def get_Product_count(self, obj):
        return obj.product_set.count()
    
class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='Category.name', read_only=True)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    in_stock = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()  # ✅ Add this

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['id','sku','barcode', 'created_at', 'updated_at']

    def get_in_stock(self, obj):
        if obj.track_quantity:
            return obj.stock_quantity > 0
        return True

    def get_image_url(self, obj):
        """Get full URL for product image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['id','sku','barcode', 'created_at', 'updated_at']

    def validate_sku(self, value):
        """Ensure SKU is unique for the tenant"""
        request = self.context.get('request')
        if request and hasattr(request, 'tenant'):
            if Product.objects.filter(tenant=request.tenant, sku=value).exists():
                raise serializers.ValidationError("A product with this SKU already exists in your store.")
        return value