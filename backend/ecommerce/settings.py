"""
Django settings for ecommerce project - PRODUCTION READY
"""

import os
from pathlib import Path
from decouple import config
import dj_database_url
# Generate secure secret key for production
import secrets
SECRET_KEY = config('SECRET_KEY', default=secrets.token_urlsafe(50))

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Security - will be overridden in production
SECRET_KEY = config('SECRET_KEY', default='django-insecure-development-key-change-in-production')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='https://ecommerce-backend-xz2q.onrender.com').split(',')

# Application definition
INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'django_celery_beat',
    'cloudinary',
    'cloudinary_storage',
    'apps.tenants',
    'apps.users',
    'apps.products',
    'apps.orders',
    'apps.payments',
    'cloudinary',
    'cloudinary_storage',
]

# MPESA Configuration
MPESA_ENVIRONMENT = config('MPESA_ENVIRONMENT', default='sandbox')
MPESA_CONSUMER_KEY = config('MPESA_CONSUMER_KEY', '')
MPESA_CONSUMER_SECRET = config('MPESA_CONSUMER_SECRET', '')
MPESA_SHORTCODE = config('MPESA_SHORTCODE', '')
MPESA_PASSKEY = config('MPESA_PASSKEY', '')
MPESA_CALLBACK_URL = config('MPESA_CALLBACK_URL', 'http://localhost:8000/api/payments/callback/')

MPESA_BASE_URL = config(
    'MPESA_BASE_URL',
    default=('https://sandbox.safaricom.co.ke' if config('MPESA_ENVIRONMENT', default='sandbox') == 'sandbox' else 'https://api.safaricom.co.ke')
)

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.tenants.middleware.TenantMiddleware',
]

ROOT_URLCONF = 'ecommerce.urls'

# TEMPLATES Configuration
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ecommerce.wsgi.application'

# Database Configuration - PRODUCTION READY
DATABASE_URL = config('DATABASE_URL', default=None)

if DATABASE_URL:
    # PRODUCTION - Use Railway MySQL
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL)
    }
    print(f"✅ Using Production Database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else DATABASE_URL[:50]}...")
else:
    # FALLBACK - Use SQLite for local testing only
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
    print("⚠️ Using SQLite (for local testing only)")

# Cloudinary configuration
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': config(' dwotnbvhz', ''),
    'API_KEY': config('	584391927331488', ''),
    'API_SECRET': config('XQN4nXNzoJsT1ypfw9KU6M7jgEQ', ''),
}

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# WhiteNoise configuration
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'users.CustomUser'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        #'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}

# JWT Settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# CORS Settings for Production
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ecommerce-frontend-nine-lemon.vercel.app",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173", 
    "https://ecommerce-backend-xz2q.onrender.com", 
    "https://ecommerce-frontend-nine-lemon.vercel.app",
     
]

# Security settings for production
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True

CORS_ALLOW_CREDENTIALS = True

# Jazzmin Settings
JAZZMIN_SETTINGS = {
    "site_title": "My Project Admin",
    "site_header": "My Dashboard",
    "site_brand": "My Admin",
    "welcome_sign": "Welcome to my project Admin",
    "copyright": "zainab © 2025",
}