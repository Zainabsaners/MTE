from django.urls import path,include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'products', views.ProductViewSet, basename='product')

urlpatterns = [
    path('',include(router.urls)),
    path('api-auth/', include('rest_framework.urls')), #for session auth
    path('api-token-auth/', obtain_auth_token), # for token auth
    path('by_vendor/<str:vendor_subdomain>/', views.ProductViewSet.as_view({'get': 'by_vendor'}), name='products-by-vendor'),
    path('by_tenant/<uuid:tenant_id>/', views.ProductViewSet.as_view({'get': 'by_tenant'}), name='products-by-tenant'),
    path('vendor/<str:vendor_subdomain>/', views.ProductViewSet.as_view({'get': 'vendor_products'}), name='vendor-products'),
    path('for_vendor/', views.ProductViewSet.as_view({'get': 'for_vendor'}), name='products-for-vendor'),

    
    ]