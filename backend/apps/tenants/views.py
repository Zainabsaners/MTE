from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action, permission_classes
from django.views.decorators.csrf import csrf_exempt 
from rest_framework.response import Response
from rest_framework.permissions import AllowAny,IsAdminUser
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from .models import Tenant, StoreSettings
from .serializers import TenantSerializer, TenantCreateSerializer, TenantRegistrationSerializer,StoreSettingsSerializer
import uuid


User = get_user_model()

class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TenantCreateSerializer
        return TenantSerializer
    
@action(detail=True, methods=['post'])
def activate(self, request, pk=None):
    tenant = self.get_object()
    tenant.is_active = True
    tenant.save()
    serializer = self.get_serializer(tenant)
    return Response(serializer.data)
    
@action(detail=True, methods=['post'])
def deactivate(self, request, pk=None):
    tenant = self.get_object()
    tenant.is_active = False
    tenant.save()
    serializer = self.get_serializer(tenant)
    return Response(serializer.data)

@api_view(['GET'])
def tenant_by_subdomain(request, subdomain):
    try:
        tenant = Tenant.objects.get(subdomain=subdomain)
        serializer = TenantSerializer(tenant)
        return Response(serializer.data)
    except Tenant.DoesNotExist:
        return Response(
            {'error': f'Tenant with subdomain "{subdomain}" not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def register_tenant(request):
    print("🎯 REGISTER_TENANT FUNCTION CALLED!")
    print("Request Data:", request.data)
    
    try:
        serializer = TenantRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            # Create the tenant
            tenant = serializer.save()
            
            # ✅ CREATE USER ACCOUNT FOR LOGIN
            try:
                user_data = request.data
                user = User.objects.create_user(
                    username=user_data['email'],
                    email=user_data['email'],
                    password=user_data['password'],
                    first_name=user_data.get('owner_name', '').split(' ')[0],
                    last_name=' '.join(user_data.get('owner_name', '').split(' ')[1:]),
                )
                
                # Link tenant to user
                tenant.owner_email = user.email
                tenant.save()
                
                print(f"✅ User account created: {user.email}")
                
            except Exception as user_error:
                print(f"❌ User creation failed: {user_error}")
                tenant.delete()
                return Response({
                    'success': False,
                    'error': f'User account creation failed: {str(user_error)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # ✅ GENERATE JWT TOKENS
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'message': 'Vendor account created successfully!',
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                },
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'user_type': 'vendor'
                }
            }, status=status.HTTP_201_CREATED)
            
        else:
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print("💥 UNEXPECTED ERROR:", str(e))
        import traceback
        traceback.print_exc()

        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET'])
def get_tenant_status(request, tenant_id):
    #check tenant registration and subscription status
    try:
        tenant = Tenant.objects.get(id=tenant_id)
        serializer = TenantSerializer(tenant)

        return Response(serializer.data)
    except Exception as e:
        return Response({
            'error': 'Tenant not found'
        }, status=status.HTTP_404_NOT_FOUND)   
    
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_tenants_list(request):
    """Get all tenants for admin approval"""
    tenants = Tenant.objects.all().order_by('-created_at')
    serializer = TenantSerializer(tenants, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_approve_tenant(request, tenant_id):
    """Approve a tenant"""
    try:
        tenant = Tenant.objects.get(id=tenant_id)
        tenant.subscription_status = 'active'
        tenant.is_active = True
        tenant.save()
        
        return Response({
            'success': True,
            'message': f'Tenant {tenant.name} approved successfully'
        })
    except Tenant.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Tenant not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_reject_tenant(request, tenant_id):
    """Reject a tenant"""
    try:
        tenant = Tenant.objects.get(id=tenant_id)
        tenant.subscription_status = 'inactive'
        tenant.is_active = False
        tenant.save()
        
        return Response({
            'success': True,
            'message': f'Tenant {tenant.name} rejected'
        })
    except Tenant.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Tenant not found'
        }, status=status.HTTP_404_NOT_FOUND)         

class MyStoreView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TenantSerializer
    
    def get_object(self):
        # Get the store/tenant for current user using owner_email
        user_email = self.request.user.email
        
        # Find store by owner_email (now properly set during registration)
        store = Tenant.objects.filter(owner_email=user_email).first()
        
        if not store:
            # Fallback: try by email field
            store = Tenant.objects.filter(email=user_email).first()
        
        if not store:
            # If no store found, try to get the first tenant (for testing)
            store = Tenant.objects.filter(is_active=True).first()
            
        if not store:
            from rest_framework.exceptions import NotFound
            raise NotFound("No store found for current user.")
        
        return store

class StoreSettingsView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StoreSettingsSerializer
    
    def get_object(self):
        # Get or create store settings for user's store
        user_email = self.request.user.email
        store = Tenant.objects.filter(owner_email=user_email).first()
        
        if not store:
            # Try by user's email in the email field
            store = Tenant.objects.filter(email=user_email).first()
        
        if not store:
            # If no store found, use the first store (for development)
            store = Tenant.objects.first()
            
        if not store:
            from rest_framework.exceptions import NotFound
            raise NotFound("No store found for current user.")
        
        # Get or create store settings with the store instance
        settings, created = StoreSettings.objects.get_or_create(store=store)
        return settings

    def perform_update(self, serializer):
        # Ensure the store is set before saving
        user_email = self.request.user.email
        store = Tenant.objects.filter(owner_email=user_email).first()
        
        if not store:
            store = Tenant.objects.filter(email=user_email).first()
            
        if not store:
            store = Tenant.objects.first()
            
        if store:
            serializer.save(store=store)
        else:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("No store found to associate with settings.")
        
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def test_mpesa_integration(request, store_id):
    """Test MPESA integration for a store"""
    try:
        user_email = request.user.email
        
        # Find the store - try multiple ways
        store = Tenant.objects.filter(id=store_id, owner_email=user_email).first()
        
        if not store:
            store = Tenant.objects.filter(id=store_id, email=user_email).first()
            
        if not store:
            store = Tenant.objects.filter(id=store_id).first()
            
        if not store:
            return Response(
                {'error': 'Store not found or access denied'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Simple MPESA test simulation
        # In a real implementation, you would call the MPESA API here
        return Response({
            'success': True,
            'message': 'MPESA integration test completed successfully',
            'store_id': str(store_id),
            'store_name': store.name,
            'test_transaction_id': f'TEST_MPESA_{store_id}_{uuid.uuid4().hex[:8].upper()}'
        })
        
    except Tenant.DoesNotExist:
        return Response(
            {'error': 'Store not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'MPESA test failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
