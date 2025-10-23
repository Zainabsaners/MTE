from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from apps.tenants.models import Tenant
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer, ProductCreateSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Category.objects.all()
    
    def perform_create(self, serializer):
        if hasattr(self.request, 'tenant') and self.request.tenant:
            serializer.save(tenant=self.request.tenant)

class IsProductOwner(permissions.BasePermission):
    """
    Object-level permission to only allow owners of a product to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.vendor == request.user

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    
    filterset_fields = ['status', 'Category', 'is_featured']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateSerializer
        return ProductSerializer
    
    def get_queryset(self):
        queryset = Product.objects.select_related('Category', 'tenant')
        
        # Handle tenant filtering
        tenant_slug = self.request.GET.get('tenant')
        if tenant_slug:
            try:
                tenant = Tenant.objects.get(slug=tenant_slug)
                queryset = queryset.filter(tenant=tenant)
            except (Tenant.DoesNotExist, ValueError):
                return Product.objects.none()
        
        # Handle vendor subdomain filtering
        vendor_subdomain = self.request.GET.get('vendor')
        if vendor_subdomain:
            try:
                # ✅ FIX: Remove is_active filter since tenants might not have this field
                tenant = Tenant.objects.get(subdomain=vendor_subdomain)
                queryset = queryset.filter(tenant=tenant)
                print(f"✅ Filtering products for vendor: {vendor_subdomain}, found {queryset.count()} products")
            except Tenant.DoesNotExist:
                print(f"❌ Vendor not found: {vendor_subdomain}")
                return Product.objects.none()
            except Exception as e:
                print(f"❌ Error filtering by vendor: {e}")
    
        return queryset
    
    def perform_create(self, serializer):
        print("🎯 PERFORM_CREATE CALLED!")
        print("📦 Data:", serializer.validated_data)
        print("👤 Current user:", self.request.user)
        
        tenant = None
        tenant_slug = self.request.GET.get('tenant')
        if tenant_slug:
            try:
                tenant = Tenant.objects.get(slug=tenant_slug)
            except Tenant.DoesNotExist:
                print(f"❌ Tenant with slug '{tenant_slug}' not found")
        
        try:
            if tenant:
                serializer.save(tenant=tenant, vendor=self.request.user)
            else:
                serializer.save(vendor=self.request.user)
            print("✅ Product saved successfully!")
        except Exception as e:
            print(f"❌ Error saving product: {e}")
            raise

    def update(self, request, *args, **kwargs):
        print("=== UPDATE METHOD CALLED ===")
        print("Request user:", request.user)
        print("User authenticated:", request.user.is_authenticated)
        print("User ID:", request.user.id if request.user.is_authenticated else "No user")
        print("Product ID:", kwargs.get('pk'))
    
        product = self.get_object()
        print("Product vendor:", product.vendor)
        print("Product vendor ID:", product.vendor.id)
    
        if request.user != product.vendor:
            print("❌ PERMISSION DENIED: User doesn't own this product")
            return Response(
                {'detail': 'You do not have permission to perform this action.'},
                status=status.HTTP_403_FORBIDDEN
            )

        print("✅ User has permission to update this product")
        return super().update(request, *args, **kwargs)
    def get_serializer_context(self):
        """Add request to serializer context for absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    
    
    # ✅ FIXED: Get products by vendor subdomain
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def by_vendor(self, request, vendor_subdomain=None):
        """
        Get all products for a specific vendor by subdomain
        URL: /api/products/by_vendor/{vendor_subdomain}/
        """
        try:
            print(f"🎯 Fetching products for vendor: {vendor_subdomain}")
            
            # ✅ FIX: Remove is_active filter
            tenant = get_object_or_404(Tenant, subdomain=vendor_subdomain)
            
            # Filter products by this tenant
            products = Product.objects.filter(tenant=tenant)
            
            # Serialize the products
            serializer = self.get_serializer(products, many=True)
            
            return Response({
                'success': True,
                'vendor': {
                    'id': str(tenant.id),
                    'name': tenant.name,
                    'subdomain': tenant.subdomain,
                    'description': tenant.description
                },
                'products': serializer.data,
                'count': products.count()
            })
            
        except Tenant.DoesNotExist:
            return Response({
                'success': False,
                'error': f'Vendor with subdomain "{vendor_subdomain}" not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"❌ Error fetching products by vendor: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # ✅ FIXED: Get products by tenant ID
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def by_tenant(self, request, tenant_id=None):
        """
        Get all products for a specific vendor by tenant ID
        URL: /api/products/by_tenant/{tenant_id}/
        """
        try:
            print(f"🎯 Fetching products for tenant ID: {tenant_id}")
            
            # ✅ FIX: Remove is_active filter
            tenant = get_object_or_404(Tenant, id=tenant_id)
            
            # Filter products by this tenant
            products = Product.objects.filter(tenant=tenant)
            
            # Serialize the products
            serializer = self.get_serializer(products, many=True)
            
            return Response({
                'success': True,
                'vendor': {
                    'id': str(tenant.id),
                    'name': tenant.name,
                    'subdomain': tenant.subdomain,
                    'description': tenant.description
                },
                'products': serializer.data,
                'count': products.count()
            })
            
        except (Tenant.DoesNotExist, ValueError):
            return Response({
                'success': False,
                'error': f'Vendor with ID "{tenant_id}" not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"❌ Error fetching products by tenant: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # ✅ FIXED: Vendor products endpoint
    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='vendor/(?P<vendor_subdomain>[^/.]+)')
    def vendor_products(self, request, vendor_subdomain=None):
        """
        Alternative endpoint for vendor products
        URL: /api/products/vendor/{vendor_subdomain}/
        """
        return self.by_vendor(request, vendor_subdomain)
    
    # ✅ FIXED: Simple query parameter endpoint
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def for_vendor(self, request):
        """
        Get products for a vendor using query parameters
        URL: /api/products/for_vendor/?vendor=shavia
        """
        vendor_subdomain = request.GET.get('vendor')
        tenant_id = request.GET.get('tenant_id')
        
        if vendor_subdomain:
            try:
                # ✅ FIX: Remove is_active filter
                tenant = Tenant.objects.get(subdomain=vendor_subdomain)
                products = Product.objects.filter(tenant=tenant)
                serializer = self.get_serializer(products, many=True)
                
                return Response({
                    'success': True,
                    'vendor': {
                        'id': str(tenant.id),
                        'name': tenant.name,
                        'subdomain': tenant.subdomain,
                        'description': tenant.description
                    },
                    'products': serializer.data,
                    'count': products.count()
                })
            except Tenant.DoesNotExist:
                return Response({
                    'success': False,
                    'error': f'Vendor with subdomain "{vendor_subdomain}" not found'
                }, status=status.HTTP_404_NOT_FOUND)
        elif tenant_id:
            return self.by_tenant(request, tenant_id)
        else:
            return Response({
                'success': False,
                'error': 'Please provide either "vendor" or "tenant_id" parameter'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        product = self.get_object()
        product.status = 'published'
        product.save()
        return Response({'status': 'product published'})
    
    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        product = self.get_object()
        product.status = 'draft'
        product.save()
        return Response({'status': 'product unpublished'})
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response({
            'total_products': 0,
            'published_products': 0,
            'draft_products': 0,
            'out_of_stock': 0
        })
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def test_create(self, request):
        """Test product creation that always works"""
        print("🎯 TEST_CREATE ENDPOINT CALLED!")
        print("📦 Request data:", request.data)
        
        return Response({
            'success': True,
            'message': 'Test product created successfully!',
            'product_id': 'test-id-123',
            'received_data': request.data
        }, status=status.HTTP_201_CREATED)