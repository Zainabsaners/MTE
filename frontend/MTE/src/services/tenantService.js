import api from './api';

export const tenantService = {
  // Get all tenants (ADD THIS METHOD)
  getAllTenants: () => api.get('/tenants/'),
  
  // Get tenant by subdomain (ADD THIS METHOD)
  getTenantBySubdomain: (subdomain) => api.get(`/tenants/by-subdomain/${subdomain}/`),
  
  // Get current user's tenants (ADD THIS METHOD)
  getUserTenants: () => api.get('/tenants/my-tenants/'),
  
  // Get tenant by ID (ADD THIS METHOD)
  getTenant: (id) => api.get(`/tenants/${id}/`),
  
  // Your existing methods:
  registerTenant: async (tenantData) => {
    return await api.post('/tenants/tenant-register/', tenantData);
  },

  getTenantStatus: async (tenantId) => {
    return await api.get(`/tenants/tenant-status/${tenantId}/`);
  },

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