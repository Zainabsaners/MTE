from rest_framework import serializers
from .models import Category, Product
from cloudinary.models import CloudinaryField 
from cloudinary import CloudinaryImage
from django.conf import settings

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
        if obj.image:
            try:
                if hasattr(obj.image, 'url'):
                    return obj.image.url
                elif isinstance(obj.image, str):
                    if obj.image.startswith('http'):
                        return obj.image
                    
            except Exception as e:
                print(f"⚠️ Simple image_url failed: {e}")
                return None
            return None      
                                                 
class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['id','sku','barcode', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        image_url = validated_data.pop('image', None)
        product = Product.objects.create(**validated_data)
        if image_url:
            if isinstance(image_url, str) and image_url.startswith('http'):
                import re
                match = re.search(r'/upload/(?:v\d+/)?([^/.]+)', image_url)

                if match:
                    public_id = match.group(1)
                    print(f"✅ Extracted Cloudinary public_id: {public_id}")
                    product.image = {'public_id': public_id}
            else:
                product.image = image_url
            product.save()
            print(f"✅ Image set successfully: {product.image}")
            
            
        return product

    def validate_sku(self, value):
        """Ensure SKU is unique for the tenant"""
        request = self.context.get('request')
        if request and hasattr(request, 'tenant'):
            if Product.objects.filter(tenant=request.tenant, sku=value).exists():
                raise serializers.ValidationError("A product with this SKU already exists in your store.")
        return value