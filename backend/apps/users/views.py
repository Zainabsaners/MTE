from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.views import APIView
from django.utils.decorators import method_decorator
from django.middleware.csrf import _get_new_csrf_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import authenticate, login, logout
from rest_framework_simplejwt.tokens import RefreshToken
from .models import customUser
from .serializers import UserSerializer, UserRegistrationSerializer, UserLoginSerializer
import json

@ensure_csrf_cookie
def csrf_token_view(request):
    """Get CSRF token for frontend"""
    token = get_token(request)
    if not token:
        token = _get_new_csrf_token()
    response = JsonResponse({'csrfToken': token, 'message': 'CSRF token set'})
    response.set_cookie(
        'csrftoken',
        token,
        max_age=3600 * 24 * 7,  # 7 days
        secure=True,
        samesite='None',
        httponly=False  # Must be False for JavaScript to read
    )
    return response
@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return JsonResponse({'message': 'CSRF cookie set'})

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        if hasattr(self.request, 'tenant') and self.request.tenant:
            return customUser.objects.filter(tenant=self.request.tenant)
        return customUser.objects.none()
    
    # Override create method for registration
    def create(self, request):
        print("🎯 REGISTRATION ATTEMPT - UserViewSet.create()")
        print("📦 Request data:", request.data)
        
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            print("✅ Registration data is valid")
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        else:
            print("❌ REGISTRATION VALIDATION ERRORS:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Keep login as a custom action
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        print("🎯 LOGIN ATTEMPT")
        print("📦 Login data:", request.data)
        
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(username=username, password=password)
            
            if user is not None:
                login(request, user)
                
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'message': 'Login successful',
                    'user':{
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'is_vendor_admin': user.is_vendor_admin,
                        'is_vendor_staff': user.is_vendor_staff,
                        'is_vendor_customer': user.is_vendor_customer,
                        'is_vendor': user.is_vendor_admin or user.is_vendor_staff or user.is_vendor_customer,
                        'user_type': 'vendor' if (user.is_vendor_admin or user.is_vendor_staff ) else 'customer',
                    },
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            print("❌ LOGIN VALIDATION ERRORS:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response({'message': 'Logout successful'})
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get current user profile"""
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    # Add this to your UserViewSet class
    @action(detail=False, methods=['get'], url_path='me')
    def current_user(self, request):
        """Get current user profile - alternative endpoint"""
        if request.user.is_authenticated:
           serializer = UserSerializer(request.user)
           return Response(serializer.data)
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

# Add a separate simple registration view for testing
class SimpleRegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        print("🎯 SIMPLE REGISTRATION - Detailed Debug")
        print("📦 Raw request data:", request.data)
        
        # Test with minimal required data
        test_data = {
            'username': request.data.get('username', f'testuser_{request.data}'),
            'email': request.data.get('email', f'test{request.data}@example.com'),
            'password': request.data.get('password', 'TestPass123!'),
            'password2': request.data.get('password2', 'TestPass123!'),
        }
        
        print("🔍 Testing with data:", test_data)
        
        serializer = UserRegistrationSerializer(data=test_data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Simple registration successful',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        else:
            print("❌ SIMPLE REGISTRATION ERRORS:", serializer.errors)
            return Response({
                'error': 'Registration failed',
                'validation_errors': serializer.errors,
                'test_data_used': test_data
            }, status=status.HTTP_400_BAD_REQUEST)