# import_complete.py
import os
import json
import django
from django.apps import apps
from django.db import transaction
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

def import_complete():
    print("🚀 COMPLETE DATA IMPORT TO NEON POSTGRESQL")
    print("=" * 55)
    
    try:
        with open('backups/railway_backup_20251218_120227.json', 'r') as f:
            all_data = json.load(f)
        
        # ALL tables from your backup - import everything
        all_tables = list(all_data.keys())
        
        print(f"📊 Found {len(all_tables)} tables to import")
        
        imported_count = 0
        
        # Use transaction for atomic import
        with transaction.atomic():
            for table in all_tables:
                if all_data[table]['data']:
                    try:
                        print(f"\n📦 Importing {table}...")
                        
                        # Find the correct model
                        model = find_model_for_table(table)
                        
                        if model:
                            # Clear existing data
                            model.objects.all().delete()
                            
                            # Import each row
                            successful_rows = 0
                            for row_data in all_data[table]['data']:
                                try:
                                    # Clean and prepare row data
                                    cleaned_data = clean_row_data_for_model(row_data, model)
                                    
                                    # Create object
                                    obj = model(**cleaned_data)
                                    obj.save()
                                    successful_rows += 1
                                    
                                except Exception as e:
                                    print(f"   ⚠️  Row error: {e}")
                                    continue
                            
                            print(f"   ✅ Imported {successful_rows}/{len(all_data[table]['data'])} records")
                            imported_count += 1
                        else:
                            print(f"   ⚠️  No Django model found for {table} - skipping")
                            
                    except Exception as e:
                        print(f"   ❌ Error importing {table}: {e}")
                else:
                    print(f"\n📦 {table}: 0 records (skipping)")
        
        print(f"\n🎉 COMPLETE IMPORT FINISHED!")
        print(f"   Tables imported: {imported_count}/{len(all_tables)}")
        
        # Final verification
        verify_import()
        
    except Exception as e:
        print(f"❌ Import failed: {e}")
        import traceback
        traceback.print_exc()

def find_model_for_table(table_name):
    """Map MySQL table names to Django models"""
    # Your custom models
    if table_name == 'users':
        from apps.users.models import customUser
        return customUser
    elif table_name == 'tenants':
        from apps.tenants.models import Tenant
        return Tenant
    elif table_name == 'categories':
        from apps.products.models import Category
        return Category
    elif table_name == 'products':
        from apps.products.models import Product
        return Product
    elif table_name == 'orders':
        from apps.orders.models import Order
        return Order
    elif table_name == 'order_items':
        from apps.orders.models import OrderItem
        return OrderItem
    elif table_name == 'mpesa_payments':
        from apps.payments.models import MpesaPayment
        return MpesaPayment
    elif table_name == 'subscription_payments':
        from apps.payments.models import SubscriptionPayment
        return SubscriptionPayment
    elif table_name == 'tenants_storesettings':
        from apps.tenants.models import StoreSettings
        return StoreSettings
    
    # Django auth tables
    elif table_name == 'auth_group':
        from django.contrib.auth.models import Group
        return Group
    elif table_name == 'auth_permission':
        from django.contrib.auth.models import Permission
        return Permission
    elif table_name == 'auth_group_permissions':
        # This is a through table, handled specially
        return None
    elif table_name == 'django_content_type':
        from django.contrib.contenttypes.models import ContentType
        return ContentType
    elif table_name == 'django_admin_log':
        from django.contrib.admin.models import LogEntry
        return LogEntry
    elif table_name == 'django_session':
        from django.contrib.sessions.models import Session
        return Session
    elif table_name == 'django_migrations':
        from django.db.migrations.recorder import MigrationRecorder
        return MigrationRecorder.Migration
    elif table_name == 'django_celery_beat_periodictask':
        from django_celery_beat.models import PeriodicTask
        return PeriodicTask
    elif table_name == 'django_celery_beat_crontabschedule':
        from django_celery_beat.models import CrontabSchedule
        return CrontabSchedule
    elif table_name == 'django_celery_beat_intervalschedule':
        from django_celery_beat.models import IntervalSchedule
        return IntervalSchedule
    
    # Through tables (many-to-many)
    elif table_name == 'users_groups':
        # This is a through table for customUser.groups
        return None
    elif table_name == 'users_user_permissions':
        # This is a through table for customUser.user_permissions
        return None
    
    return None

def clean_row_data_for_model(row_data, model):
    """Clean row data for specific model"""
    cleaned = {}
    
    for field_name, value in row_data.items():
        if value is None:
            cleaned[field_name] = None
            continue
        
        # Fix common field name issues
        fixed_field_name = field_name
        
        # Handle _id_id to _id conversion
        if field_name.endswith('_id_id'):
            fixed_field_name = field_name.replace('_id_id', '_id')
        
        # Handle Category_id_id to category_id
        if field_name == 'Category_id_id':
            fixed_field_name = 'category_id'
        
        # Check if field exists in model
        try:
            field = model._meta.get_field(fixed_field_name)
            
            # Handle datetime fields
            if isinstance(value, str) and hasattr(field, 'get_internal_type'):
                if field.get_internal_type() in ['DateTimeField', 'DateField']:
                    try:
                        # Convert string to datetime
                        value = datetime.fromisoformat(value.replace('Z', '+00:00'))
                    except:
                        pass
            
            cleaned[fixed_field_name] = value
            
        except:
            # Field doesn't exist in model, but we'll try to save it anyway
            # This handles extra columns that might not be in Django model
            cleaned[field_name] = value
    
    return cleaned

def import_through_tables():
    """Import many-to-many through tables"""
    print("\n🔗 Importing many-to-many relationships...")
    
    try:
        with open('backups/railway_backup_20251218_120227.json', 'r') as f:
            all_data = json.load(f)
        
        # Import users_groups (customUser.groups.through)
        if 'users_groups' in all_data and all_data['users_groups']['data']:
            from apps.users.models import customUser
            from django.contrib.auth.models import Group
            
            print("📦 Importing users_groups...")
            for row in all_data['users_groups']['data']:
                try:
                    user = customUser.objects.get(id=row['customuser_id'])
                    group = Group.objects.get(id=row['group_id'])
                    user.groups.add(group)
                except Exception as e:
                    print(f"   ⚠️  Error: {e}")
            print(f"   ✅ Imported {len(all_data['users_groups']['data'])} records")
        
        # Import users_user_permissions (customUser.user_permissions.through)
        if 'users_user_permissions' in all_data and all_data['users_user_permissions']['data']:
            from apps.users.models import customUser
            from django.contrib.auth.models import Permission
            
            print("📦 Importing users_user_permissions...")
            for row in all_data['users_user_permissions']['data']:
                try:
                    user = customUser.objects.get(id=row['customuser_id'])
                    permission = Permission.objects.get(id=row['permission_id'])
                    user.user_permissions.add(permission)
                except Exception as e:
                    print(f"   ⚠️  Error: {e}")
            print(f"   ✅ Imported {len(all_data['users_user_permissions']['data'])} records")
        
        # Import auth_group_permissions (Group.permissions.through)
        if 'auth_group_permissions' in all_data and all_data['auth_group_permissions']['data']:
            from django.contrib.auth.models import Group, Permission
            
            print("📦 Importing auth_group_permissions...")
            for row in all_data['auth_group_permissions']['data']:
                try:
                    group = Group.objects.get(id=row['group_id'])
                    permission = Permission.objects.get(id=row['permission_id'])
                    group.permissions.add(permission)
                except Exception as e:
                    print(f"   ⚠️  Error: {e}")
            print(f"   ✅ Imported {len(all_data['auth_group_permissions']['data'])} records")
                    
    except Exception as e:
        print(f"❌ Through tables import failed: {e}")

def verify_import():
    """Verify the import was successful"""
    print("\n🔍 VERIFICATION:")
    print("=" * 30)
    
    try:
        from apps.users.models import customUser
        from apps.tenants.models import Tenant
        from apps.products.models import Product, Category
        
        print(f"📊 Users: {customUser.objects.count()}")
        print(f"🏪 Tenants: {Tenant.objects.count()}")
        print(f"📦 Products: {Product.objects.count()}")
        print(f"🗂️  Categories: {Category.objects.count()}")
        
        # Check specific data
        user = customUser.objects.filter(username='simpleuser123').first()
        if user:
            print(f"✅ Found test user: {user.username} ({user.email})")
        
        tenant = Tenant.objects.filter(subdomain='finalteststore').first()
        if tenant:
            print(f"✅ Found test tenant: {tenant.name} ({tenant.subdomain})")
        
        # Import through tables
        import_through_tables()
        
    except Exception as e:
        print(f"⚠️  Verification error: {e}")

if __name__ == "__main__":
    import_complete()