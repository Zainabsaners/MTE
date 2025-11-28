import api from './api';

export const tenantService = {
  // Get all tenants
  getAllTenants: () => api.get('/api/tenants/'),
  
  // Get tenant by subdomain
  getTenantBySubdomain: (subdomain) => api.get(`/api/tenants/by-subdomain/${subdomain}/`),
  
  // Get current user's store
  getUserStores: () => api.get('/api/tenants/my-store/'),
  
  // Get tenant by ID
  getTenant: (id) => api.get(`/api/tenants/${id}/`),
  
  // Tenant registration
  registerTenant: async (tenantData) => {
    return await api.post('/api/tenants/tenant-register/', tenantData);
  },

  getTenantStatus: async (tenantId) => {
    return await api.get(`/api/tenants/tenant-status/${tenantId}/`);
  },

  // Store settings
  getStoreSettings: () => api.get('/api/tenants/store-settings/'),
  updateStoreSettings: (data) => api.patch('/api/tenants/store-settings/', data),

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