# apps/payments/urls.py - CLEAN AND WORKING VERSION
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'subscription-payments', views.SubscriptionPaymentViewSet, basename='subscriptionpayment')

urlpatterns = [
    path('', include(router.urls)),
    
    # MPESA URLs - ONLY ESSENTIAL ENDPOINTS
    path('test-connection/', views.test_mpesa_connection, name='test-connection'),
    path('initiate-payment/', views.initiate_stk_push, name='initiate-payment'),
    path('callback/', views.payment_callback, name='payment-callback'),
    path('status/<int:payment_id>/', views.get_payment_status, name='payment-status'),
]