from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import customUser

class UserSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)

    class Meta:
        model = customUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'tenant', 'tenant_name', 'is_vendor_admin', 'is_vendor_staff', 'is_vendor_customer', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = customUser
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'phone_number']
    
    def validate(self, attrs):
        print("🔍 Validating registration data...")
        
        # Check if passwords match
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Check for existing username
        if customUser.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "A user with that username already exists."})
            
        # Check for existing email
        if customUser.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "A user with that email already exists."})
            
        print("✅ All validation passed")
        return attrs

    def create(self, validated_data):
        print("🎯 Creating user with data:", validated_data.keys())
        
        # Remove password2 before creating user
        password = validated_data.pop('password')
        validated_data.pop('password2')
        
        try:
            # FIXED: Use create_user instead of create_User
            user = customUser.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=password,
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                phone_number=validated_data.get('phone_number', '')
            )
            print(f"✅ User created successfully: {user.username}")
            return user
            
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            raise serializers.ValidationError(f"User creation failed: {str(e)}")

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)