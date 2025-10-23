from django.http import Http404
from .models import Tenant

class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Extract subdomain from host
        host = request.get_host().split(':')[0]
        subdomain_parts = host.split('.')
        
        # For local development
        if len(subdomain_parts) == 1 or subdomain_parts[-1] in ['localhost', '127.0.0.1']:
            if len(subdomain_parts) > 1 and subdomain_parts[0] not in ['www', 'api', 'admin']:
                subdomain = subdomain_parts[0]
                try:
                    tenant = Tenant.objects.get(subdomain=subdomain, is_active=True)
                    request.tenant = tenant
                except Tenant.DoesNotExist:
                    request.tenant = None
            else:
                request.tenant = None
        else:
            # For production (domain.com)
            if len(subdomain_parts) > 2 and subdomain_parts[0] not in ['www', 'api', 'admin']:
                subdomain = subdomain_parts[0]
                try:
                    tenant = Tenant.objects.get(subdomain=subdomain, is_active=True)
                    request.tenant = tenant
                except Tenant.DoesNotExist:
                    request.tenant = None
            else:
                request.tenant = None
        
        response = self.get_response(request)
        return response