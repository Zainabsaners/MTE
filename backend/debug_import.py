# debug_import.py
import os
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')

import django
django.setup()

from apps.products.models import Product, Category

print("🔍 DEBUGGING IMPORT ISSUE")
print("=" * 40)

# 1. Check what's in the backup file
with open('backups/railway_backup_20251218_120227.json', 'r') as f:
    data = json.load(f)

print(f"📊 Backup file contains:")
print(f"  Products: {len(data.get('products', {}).get('data', []))} records")
print(f"  Categories: {len(data.get('categories', {}).get('data', []))} records")

# 2. Check database connection
from django.db import connection
print(f"\n🔌 Database: {connection.settings_dict['ENGINE']}")

# 3. Check if tables exist
cursor = connection.cursor()
cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
tables = [table[0] for table in cursor.fetchall()]
print(f"\n📋 Tables in database: {len(tables)}")

# 4. Check products table specifically
cursor.execute("SELECT COUNT(*) FROM products_product")
product_count = cursor.fetchone()[0]
print(f"📦 Products in database (raw SQL): {product_count}")

cursor.execute("SELECT COUNT(*) FROM products_category")
category_count = cursor.fetchone()[0]
print(f"🗂️  Categories in database (raw SQL): {category_count}")

# 5. Try direct SQL insert if needed
if product_count == 0 and 'products' in data:
    print(f"\n⚠️  Products table exists but Django can't see them")
    print(f"   Let's check the data structure...")
    
    # Show first product from backup
    if data['products']['data']:
        first_product = data['products']['data'][0]
        print(f"\n📝 First product in backup:")
        for key, value in list(first_product.items())[:5]:
            print(f"   {key}: {value}")