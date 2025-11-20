# check_urls.py
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
import django
django.setup()

from django.urls import get_resolver

def list_all_urls(urlpatterns=None, namespace=None, prefix=''):
    if urlpatterns is None:
        urlpatterns = get_resolver().url_patterns
    
    for pattern in urlpatterns:
        if hasattr(pattern, 'url_patterns'):
            # This is an include
            new_namespace = pattern.namespace
            if namespace and new_namespace:
                new_namespace = f"{namespace}:{new_namespace}"
            elif new_namespace:
                new_namespace = new_namespace
            else:
                new_namespace = namespace
            list_all_urls(pattern.url_patterns, new_namespace, prefix + str(pattern.pattern))
        else:
            # This is a direct pattern
            if namespace:
                name = f"{namespace}:{pattern.name}" if pattern.name else None
            else:
                name = pattern.name
            print(f"{prefix + str(pattern.pattern)} -> {name}")

print("=== ALL REGISTERED URL PATTERNS ===")
list_all_urls()