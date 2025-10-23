import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Function to get CSRF token from cookies
const getCSRFToken = () => {
  const name = 'csrftoken';
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
  return cookieValue;
};



// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending cookies
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    const csrfToken = getCSRFToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const method = config.method?.toUpperCase();
    if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    console.log('🔄 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullURL: config.baseURL + config.url,
      hasJWR: !!token,
      hasCSRF: !!csrfToken,
    });
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Handle token refresh for 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          console.log('🔄 Attempting token refresh...');
          
          // Use axios directly to avoid circular interceptor calls
          const response = await axios.post(
            `${API_BASE_URL}/token/refresh/`,
            { refresh: refreshToken },
            
            {
              withCredentials: true,
              headers: {
                'X-CSRFToken': getCSRFToken(),

                
              }
            }
          );
          
          const newAccessToken = response.data.access;
          localStorage.setItem('access_token', newAccessToken);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          console.log('✅ Token refreshed successfully');
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        
        // Redirect to login page if we're not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Tenant API functions
export const tenantAPI = {
  getTenantBySubdomain: (subdomain) => {
    const url = '/tenants/by-subdomain/' + subdomain;
    console.log('🔗 Constructed URL:', url);
    console.log('🔗 Subdomain value:', subdomain);
    return api.get(url);
  },
  
  getAllTenants: () => 
    api.get('/tenants/'),

  getTenantsList: () =>
    api.get('/tenants/tenants/'),

  getUserStores: () =>
    api.get('/tenants/my-stores/'),

  getUserTenants: () =>
    api.get('/tenants/user-tenants/'),
  getTenantById: () =>
    api.get('/tenants/${id}/'),

  createTenant:(tenantData) =>
    api.post('/tenants/', tenantData),

};

// Product API functions
export const productAPI = {
  getProducts: (params = {}) => 
    api.get('/products/products/', { params }),
  
  getProduct: (id) => 
    api.get(`/products/products/${id}/`),
  
  getCategories: () => 
    api.get('/products/categories/'),
  
  createProduct: (productData, config = {}) => {
   return api.post('/products/products/', productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config.headers,
    },
    ...config,
   });
  },
  
  updateProduct: (id, productData, config = {}) => {
    return api.patch(`/products/products/${id}/`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
      ...config,
    });
  },

  
  deleteProduct: (id) => 
    api.delete(`/products/products/${id}/`),
  
  publishProduct: (id) => 
    api.post(`/products/products/${id}/publish/`),
  
  unpublishProduct: (id) => 
    api.post(`/products/products/${id}/unpublish/`),

  getProductsByVendorSubdomain: (vendorSubdomain) => {
    return api.get(`/products/by_vendor/${vendorSubdomain}/`);
  },
  getProductsByTenant: (tenantId) => {
    return api.get(`/products/by_tenant/${tenantId}/`);
  },
  getVendorProducts: (vendorSubdomain) => {
    return api.get(`/products/vendor/${vendorSubdomain}/`);
  },

  getProductsForVendor: (vendorSubdomain) => {
    return api.get(`/products/for_vendor/?vendor=${vendorSubdomain}`);
  },

  getProductsWithVendorFilter: (vendorSubdomain) => {
    return api.get(`/products/products/?vendor=${vendorSubdomain}`);
  }
};

// User API functions
export const userAPI = {
  register: (userData) => 
    api.post('/users/register/', userData),
  
  login: (credentials) => 
    api.post('/users/login/', credentials),
  
  logout: () => 
    api.post('/users/logout/'),
  
  getProfile: () => 
    api.get('/users/profile/'),
  
  updateProfile: (userData) => 
    api.patch('/users/profile/', userData),
};

// Payment API functions
export const paymentAPI = {
  initiatePayment: (paymentData) => 
    api.post('/payments/initiate-payment/', paymentData),
  
  checkPaymentStatus: (paymentId) => 
    api.get(`/payments/status/${paymentId}/`),
  
  createOrder: (orderData) => 
    api.post('/orders/', orderData),
};

// Cart API functions (if you have them)
export const cartAPI = {
  getCart: () => 
    api.get('/cart/'),
  
  addToCart: (itemData) => 
    api.post('/cart/items/', itemData),
  
  updateCartItem: (itemId, quantity) => 
    api.patch(`/cart/items/${itemId}/`, { quantity }),
  
  removeFromCart: (itemId) => 
    api.delete(`/cart/items/${itemId}/`),
  
  clearCart: () => 
    api.delete('/cart/clear/'),
};

export default api;