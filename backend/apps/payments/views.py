# apps/payments/views.py - CLEAN VERSION
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from .models import MpesaPayment, SubscriptionPayment
from .services.mpesa_service import MpesaService
from apps.orders.models import Order
from .serializers import MpesaPaymentSerializer, SubscriptionPaymentSerializer, SubscriptionPaymentCreateSerializer
from django_filters.rest_framework import DjangoFilterBackend
import json

class SubscriptionPaymentViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionPaymentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'tenant']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SubscriptionPaymentCreateSerializer
        return SubscriptionPaymentSerializer
    
    def get_queryset(self):
        queryset = SubscriptionPayment.objects.select_related('tenant')
        if hasattr(self.request, 'tenant') and self.request.tenant:
            queryset = queryset.filter(tenant=self.request.tenant)
        return queryset

@api_view(['GET','POST'])
@permission_classes([AllowAny])
@csrf_exempt
def initiate_stk_push(request):
    """Initiate STK push payment"""
    try:
        data = request.data
        order_id = data.get('order_id')
        phone_number = data.get('phone_number')

        if not order_id or not phone_number:
            return Response(
                {'error': 'Order ID and phone number are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        order = Order.objects.get(id=order_id)
        mpesa_service = MpesaService()

        result, error = mpesa_service.stk_push(
            phone_number, int(order.total), f"ORDER_{order.id}", f"payment for order {order.id}"
        )
        
        if error:
            return Response(
                {'error': f'Payment initiation failed: {error}'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Save payment record
        payment = MpesaPayment.objects.create(
            order=order,
            user=request.user if request.user.is_authenticated else None,
            phone_number=phone_number,
            amount=order.total,
            merchant_request_id=result.get('MerchantRequestID', ''),
            checkout_request_id=result.get('CheckoutRequestID', ''),
            status='pending'
        )
        
        return Response({
            'success': True,
            'message': 'Payment initiated successfully',
            'checkout_request_id': result.get('CheckoutRequestID'),
            'merchant_request_id': result.get('MerchantRequestID'),
            'payment_id': payment.id
        })
    except Order.DoesNotExist:
        return Response({'error':'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response(
            {'error': f'Internal server error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def payment_callback(request):
    """Handle MPESA payment callback"""
    try:
        callback_data = request.data
        result_code = callback_data.get('Body', {}).get('stkCallback',{}).get('ResultCode')
        checkout_request_id = callback_data.get('Body', {}).get('stkCallback',{}).get('CheckoutRequestID')
        merchant_request_id = callback_data.get('Body', {}).get('stkCallback',{}).get('MerchantRequestID')
        
        payment = MpesaPayment.objects.get(
            checkout_request_id=checkout_request_id,
            merchant_request_id=merchant_request_id
        )
        
        if result_code == 0:
            # Payment successful
            callback_metadata = callback_data.get('Body', {}).get('stkCallback',{}).get('CallbackMetadata', {}).get('Item',[])
            for item in callback_metadata:
                if item.get('Name') == 'MpesaReceiptNumber':
                    payment.mpesa_receipt_number = item.get('Value')
                elif item.get('Name') == 'TransactionDate':
                    payment.transaction_date = item.get('Value')
                elif item.get('Name') == 'PhoneNumber':
                    payment.phone_number = item.get('Value')

            payment.status = 'successful'
            payment.order.status = 'completed'
            payment.order.save()
        else:
            payment.status = 'failed'
            
        payment.save()
        return Response({'ResultCode': 0, 'ResultDesc': 'Success'})
        
    except MpesaPayment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'ResultCode': 1, 'ResultDesc': 'Failed'})

@api_view(['GET'])
def get_payment_status(request, payment_id):
    """Check payment status"""
    try:
        payment = MpesaPayment.objects.get(id=payment_id)
        serializer = MpesaPaymentSerializer(payment)
        return Response(serializer.data)
    except MpesaPayment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
@csrf_exempt
def test_mpesa_connection(request):
    """Test MPESA connection with current credentials"""
    try:
        mpesa_service = MpesaService()
        access_token = mpesa_service.get_access_token()
        
        if access_token:
            return Response({
                'success': True,
                'message': '✅ MPESA connection successful! Your credentials are valid.'
            })
        else:
            return Response({
                'success': False,
                'error': '❌ Failed to get access token. Check your MPESA credentials.'
            })
    except Exception as e:
        return Response({
            'success': False,
            'error': f'❌ Connection failed: {str(e)}'
        })