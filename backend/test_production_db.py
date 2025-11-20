# test_production_db.py
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
import django
django.setup()

from django.db import connection

print("=== PRODUCTION DATABASE TEST ===")
try:
    connection.ensure_connection()
    print("✅ PRODUCTION Database connected successfully!")
    print(f"Database: {connection.settings_dict['NAME']}")
    print(f"Host: {connection.settings_dict['HOST']}")
    print(f"Port: {connection.settings_dict['PORT']}")
    print(f"User: {connection.settings_dict['USER']}")
    print("✅ Ready for Render deployment!")
except Exception as e:
    print(f"❌ Connection failed: {e}")