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
                full_url = obj.image.public_id
                clean_public_id = full_url.rsplit('/', 1)[-1]
                cloudinary_img = CloudinaryImage(
                    clean_public_id,
                    cloud_name='dg7gwfpck',
                    api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
                    api_secret=settings.CLOUDINARY_STORAGE['API_SECRET']
                )
                                                 
                return cloudinary_img.build_url(
                    width=800,
                    height=600,
                    crop="fill",
                    quality="auto",
                    format="auto",
                    fetch_format="auto"
                )
            except Exception as e:
                print(f"⚠️ Image transformation failed: {e}")
                return obj.image.url if hasattr(obj.image, 'url') else None
        return None
        

class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['id','sku','barcode', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        image_url = validated_data.pop('image', None)
        product = Product.objects.create(**validated_data)
        if image_url and isinstance(image_url, str):
            try:
                import re
                match = re.search(r'/upload/(?:v\d+/)?([^/.]+)', image_url)

                if match:
                    public_id = match.group(1)
                    from cloudinary.models import CloudinaryResource
                    product.image = CloudinaryResource(public_id=public_id)

                    product.save()
            except Exception as e:
                print(f"⚠️ Failed to process Cloudinary URL: {e}")
            
        return product

    def validate_sku(self, value):
        """Ensure SKU is unique for the tenant"""
        request = self.context.get('request')
        if request and hasattr(request, 'tenant'):
            if Product.objects.filter(tenant=request.tenant, sku=value).exists():
                raise serializers.ValidationError("A product with this SKU already exists in your store.")
        return value