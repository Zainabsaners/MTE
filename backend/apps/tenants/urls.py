from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'tenants', views.TenantViewSet, basename='tenant')
# Then include router URLs


urlpatterns = [
    path('', include(router.urls)),
    # PUT FUNCTION-BASED VIEWS FIRST (before router)
    path('by-subdomain/<str:subdomain>/', views.tenant_by_subdomain, name='tenant-by-subdomain'),
    path('tenant-register/', views.register_tenant, name='register-tenant'),
    path('tenant-status/<uuid:tenant_id>/', views.get_tenant_status, name='tenant-status'),

    path('admin/tenants/', views.admin_tenants_list, name='admin-tenants-list'),
    path('admin/tenants/<uuid:tenant_id>/approve', views.admin_approve_tenant, name='admin.approve_tenant'),
    path('admin/tenants/<uuid:tenant_id>/reject', views.admin_reject_tenant, name='admin-reject-tenant'),
    path('my-store/', views.MyStoreView.as_view(), name='my-store'),
    path('store-settings/', views.StoreSettingsView.as_view(), name='store-settings'),
    path('stores/<uuid:store_id>/test-mpesa/', views.test_mpesa_integration, name='test-mpesa'),

    
]