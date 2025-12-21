"""
URL configuration for ecommerce project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'message': 'Ecommerce API',
        'endpoints': {
            'stores': '/api/tenants/',
            'store_by_subdomain': '/api/tenants/{subdomain}/',
            'my_store': '/api/tenants/my-store/',
            'users': '/api/users/',
            'products': '/api/products/',
        }
    })
def health_check(request):
    return JsonResponse({'status': 'healthy'})

urlpatterns = [
    path('', api_root, name='api-root'),
    path('health/', health_check, name='health-check'),
    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # App URLs
    path('api/tenants/', include('apps.tenants.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)