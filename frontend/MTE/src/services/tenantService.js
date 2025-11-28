import api from './api';

export const tenantService = {
  // Get all tenants - CORRECT
  getAllTenants: () => api.get('/api/tenants/'),
  
  // Get tenant by subdomain - CORRECT
  getTenantBySubdomain: (subdomain) => api.get(`/api/tenants/by-subdomain/${subdomain}/`),
  
  // Get current user's tenants - WRONG: Change to correct endpoint
  getUserTenants: () => api.get('/api/tenants/my-store/'), // ✅ FIXED: my-store not my-tenants
  
  // Get tenant by ID - CORRECT
  getTenant: (id) => api.get(`/api/tenants/${id}/`),
  
  // Tenant registration - CORRECT
  registerTenant: async (tenantData) => {
    return await api.post('/api/tenants/tenant-register/', tenantData);
  },

  // Get tenant status - CORRECT
  getTenantStatus: async (tenantId) => {
    return await api.get(`/api/tenants/tenant-status/${tenantId}/`);
  },

  // Store settings - ADD THIS (exists in your URLs)
  getStoreSettings: () => api.get('/api/tenants/store-settings/'),
  
  // Admin endpoints - ADD THESE (exists in your URLs)
  getAdminTenants: () => api.get('/api/tenants/admin/tenants/'),
  approveTenant: (tenantId) => api.post(`/api/tenants/admin/tenants/${tenantId}/approve`),
  rejectTenant: (tenantId) => api.post(`/api/tenants/admin/tenants/${tenantId}/reject`),

  getSubscriptionPlans: () => {
    return [
      {
        id: 'basic',
        name: 'BASIC - 100 products',
        price: 200,
        product_limit: 100,
        features: ['100 products', 'Basic storefront', 'Email support']
      },
      {
        id: 'premium', 
        name: 'Premium - 1000 products',
        price: 500,
        product_limit: 1000,
        features: ['1000 products', 'Advanced analytics', 'Priority support']
      },
      {
        id: 'enterprise',
        name: 'Enterprise - Unlimited products',
        price: 1000,
        product_limit: 9999,
        features: ['Unlimited products', 'Custom domain', '24/7 support']
      }
    ];
  }
};

export default tenantService;