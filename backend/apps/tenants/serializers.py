# tenants/serializers.py - UPDATED WITH CORRECT FIELDS
from rest_framework import serializers
from .models import Tenant, StoreSettings

class TenantSerializer(serializers.ModelSerializer):
    settings = serializers.SerializerMethodField()
    
    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'subdomain', 'is_active', 'created_at',
            'subscription_tier', 'subscription_status', 'email', 'phone_number',
            'mpesa_business_shortcode', 'mpesa_account_number', 'description',
            'owner_name', 'owner_email', 'business_registration', 'address',
            'store_logo', 'settings'
        ]
        read_only_fields = ['id', 'created_at', 'settings']
    
    def get_settings(self, obj):
        # Get or create settings for this tenant
        settings, created = StoreSettings.objects.get_or_create(store=obj)
        return StoreSettingsSerializer(settings).data

class TenantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ['name', 'subdomain', 'email', 'phone_number', 'subscription_tier']

    def validate_subdomain(self, value):
        if Tenant.objects.filter(subdomain=value).exists():
            raise serializers.ValidationError("A tenant with this subdomain already exists.")
        return value

class TenantRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, required=True)
    confirm_password = serializers.CharField(write_only=True, min_length=8, required=True)
    
    class Meta:
        model = Tenant
        fields = [ 
            'name', 'subdomain', 'email', 'phone_number', 'subscription_tier', 
            'password', 'confirm_password', 
            'mpesa_business_shortcode',
            'mpesa_account_number', 'description', 'owner_name', 'owner_email', 
            'business_registration', 'address'
        ]

    def validate(self, data):
        print("🔍 Validating tenant registration data...")
        
        # Ensure passwords match
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        
        # Ensure subdomain is unique
        if Tenant.objects.filter(subdomain=data['subdomain']).exists():
            raise serializers.ValidationError("A tenant with this subdomain already exists.")
        
        # Check if email is unique
        if data.get('email') and Tenant.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("A tenant with this email already exists.")
        
        print("✅ Tenant validation passed")
        return data

    def create(self, validated_data):
        print("🎯 Creating tenant with data:", validated_data.keys())
        
        # Remove password fields from tenant data
        password = validated_data.pop('password')
        validated_data.pop('confirm_password')
        
        # Set default values for new tenant
        validated_data['is_active'] = False  # Wait for admin activation
        validated_data['subscription_status'] = 'pending'  # Wait for payment

        try:
            # Create tenant
            tenant = Tenant.objects.create(**validated_data)
            print(f"✅ Tenant created successfully: {tenant.name} (ID: {tenant.id})")
            
            return tenant
            
        except Exception as e:
            print(f"❌ Error creating tenant: {e}")
            raise serializers.ValidationError(f"Tenant creation failed: {str(e)}")

class StoreSettingsSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source='store.name', read_only=True)
    store_id = serializers.UUIDField(source='store.id', read_only=True)
    
    class Meta:
        model = StoreSettings
        fields = '__all__'
        read_only_fields = ('store', 'id')
    
    def to_internal_value(self, data):
        # Convert string booleans to actual booleans
        boolean_fields = [
            'shipping_enabled', 'email_notifications', 'order_notifications',
            'low_stock_alerts', 'customer_emails', 'newsletter_subscription'
        ]
        
        for field in boolean_fields:
            if field in data and isinstance(data[field], str):
                data[field] = data[field].lower() == 'true'
        
        return super().to_internal_value(data)
