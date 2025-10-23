import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from .mpesa_service import MpesaService
from .models import MpesaPayment  # This should work now

def test_mpesa_auth():
    """Test Mpesa authentication"""
    print("Testing Mpesa authentication...")
    
    mpesa_service = MpesaService()
    access_token = mpesa_service.get_access_token()
    
    if access_token:
        print("✅ SUCCESS: Access token obtained")
        print(f"Token: {access_token[:50]}...")
    else:
        print("❌ FAILED: Could not get access token")
        print("Please check your Mpesa credentials in .env file")

def test_mpesa_model():
    """Test MpesaPayment model"""
    print("\nTesting MpesaPayment model...")
    try:
        # Count existing payments
        count = MpesaPayment.objects.count()
        print(f"✅ MpesaPayment model works! Total payments: {count}")
    except Exception as e:
        print(f"❌ MpesaPayment model error: {e}")

if __name__ == "__main__":
    test_mpesa_auth()
    test_mpesa_model()