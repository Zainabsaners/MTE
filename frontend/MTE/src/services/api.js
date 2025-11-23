import axios from 'axios';

const API_BASE_URL = 'https://ecommerce-backend-xz2q.onrender.com';

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
      hasJWT: !!token,
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
            `${API_BASE_URL}/api/token/refresh/`, // FIXED: Added /api/
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
    const url = '/api/tenants/by-subdomain/' + subdomain; // FIXED
    console.log('🔗 Constructed URL:', url);
    console.log('🔗 Subdomain value:', subdomain);
    return api.get(url);
  },
  
  getAllTenants: () => 
    api.get('/api/tenants/'), // FIXED

  getTenantsList: () =>
    api.get('/api/tenants/tenants/'), // FIXED

  getUserStores: () =>
    api.get('/api/tenants/my-stores/'), // FIXED

  getUserTenants: () =>
    api.get('/api/tenants/user-tenants/'), // FIXED

  getTenantById: (id) => // FIXED: Added parameter and fixed template string
    api.get(`/api/tenants/${id}/`),

  createTenant: (tenantData) =>
    api.post('/api/tenants/', tenantData), // FIXED
};

// Product API functions
export const productAPI = {
  getProducts: (params = {}) => 
    api.get('/api/products/products/', { params }), // FIXED
  
  getProduct: (id) => 
    api.get(`/api/products/products/${id}/`), // FIXED
  
  getCategories: () => 
    api.get('/api/products/categories/'), // FIXED
  
  createProduct: (productData, config = {}) => {
    return api.post('/api/products/products/', productData, { // FIXED
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
      ...config,
    });
  },
  
  updateProduct: (id, productData, config = {}) => {
    return api.patch(`/api/products/products/${id}/`, productData, { // FIXED
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
      ...config,
    });
  },

  deleteProduct: (id) => 
    api.delete(`/api/products/products/${id}/`), // FIXED
  
  publishProduct: (id) => 
    api.post(`/api/products/products/${id}/publish/`), // FIXED
  
  unpublishProduct: (id) => 
    api.post(`/api/products/products/${id}/unpublish/`), // FIXED

  getProductsByVendorSubdomain: (vendorSubdomain) => {
    return api.get(`/api/products/by_vendor/${vendorSubdomain}/`); // FIXED
  },
  
  getProductsByTenant: (tenantId) => {
    return api.get(`/api/products/by_tenant/${tenantId}/`); // FIXED
  },
  
  getVendorProducts: (vendorSubdomain) => {
    return api.get(`/api/products/vendor/${vendorSubdomain}/`); // FIXED
  },

  getProductsForVendor: (vendorSubdomain) => {
    return api.get(`/api/products/for_vendor/?vendor=${vendorSubdomain}`); // FIXED
  },

  getProductsWithVendorFilter: (vendorSubdomain) => {
    return api.get(`/api/products/products/?vendor=${vendorSubdomain}`); // FIXED
  }
};

// User API functions
export const userAPI = {
  register: (userData) => 
    api.post('/api/users/register/', userData), // FIXED
  
  login: (credentials) => 
    api.post('/api/users/login/', credentials), // FIXED
  
  logout: () => 
    api.post('/api/users/logout/'), // FIXED
  
  getProfile: () => 
    api.get('/api/users/profile/'), // FIXED
  
  updateProfile: (userData) => 
    api.patch('/api/users/profile/', userData), // FIXED
};

// Payment API functions
export const paymentAPI = {
  initiatePayment: (paymentData) => 
    api.post('/api/payments/initiate-payment/', paymentData), // FIXED
  
  checkPaymentStatus: (paymentId) => 
    api.get(`/api/payments/status/${paymentId}/`), // FIXED
  
  createOrder: (orderData) => 
    api.post('/api/orders/', orderData), // FIXED
};

// Cart API functions
export const cartAPI = {
  getCart: () => 
    api.get('/api/cart/'), // FIXED
  
  addToCart: (itemData) => 
    api.post('/api/cart/items/', itemData), // FIXED
  
  updateCartItem: (itemId, quantity) => 
    api.patch(`/api/cart/items/${itemId}/`, { quantity }), // FIXED
  
  removeFromCart: (itemId) => 
    api.delete(`/api/cart/items/${itemId}/`), // FIXED
  
  clearCart: () => 
    api.delete('/api/cart/clear/'), // FIXED
};

export default api;