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
  withCredentials: true,
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          console.log('🔄 Attempting token refresh...');
          
          const response = await axios.post(
            `${API_BASE_URL}/api/token/refresh/`,
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
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          console.log('✅ Token refreshed successfully');
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// CSRF Token function (ADD THIS)
export const getCSRFTokenFromServer = async () => {
  try {
    const response = await api.get('/api/users/csrf/'); // FIXED: Added /api/
    return response.data.csrfToken;
  } catch (error) {
    console.error('❌ Failed to get CSRF token:', error);
    return null;
  }
};

// Tenant API functions
export const tenantAPI = {
  getTenantBySubdomain: (subdomain) => 
    api.get('/api/tenants/by-subdomain/' + subdomain),
  
  getAllTenants: () => 
    api.get('/api/tenants/'),

  getTenantsList: () =>
    api.get('/api/tenants/tenants/'),

  getUserStores: () =>
    api.get('/api/tenants/my-stores/'),

  getUserTenants: () =>
    api.get('/api/tenants/user-tenants/'),

  getTenantById: (id) =>
    api.get(`/api/tenants/${id}/`),

  createTenant: (tenantData) =>
    api.post('/api/tenants/', tenantData),
};

// Product API functions
export const productAPI = {
  getProducts: (params = {}) => 
    api.get('/api/products/products/', { params }),
  
  getProduct: (id) => 
    api.get(`/api/products/products/${id}/`),
  
  getCategories: () => 
    api.get('/api/products/categories/'),
  
  createProduct: (productData, config = {}) => {
    return api.post('/api/products/products/', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
      ...config,
    });
  },
  
  updateProduct: (id, productData, config = {}) => {
    return api.patch(`/api/products/products/${id}/`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
      ...config,
    });
  },

  deleteProduct: (id) => 
    api.delete(`/api/products/products/${id}/`),
  
  publishProduct: (id) => 
    api.post(`/api/products/products/${id}/publish/`),
  
  unpublishProduct: (id) => 
    api.post(`/api/products/products/${id}/unpublish/`),

  getProductsByVendorSubdomain: (vendorSubdomain) => 
    api.get(`/api/products/by_vendor/${vendorSubdomain}/`),
  
  getProductsByTenant: (tenantId) => 
    api.get(`/api/products/by_tenant/${tenantId}/`),
  
  getVendorProducts: (vendorSubdomain) => 
    api.get(`/api/products/vendor/${vendorSubdomain}/`),

  getProductsForVendor: (vendorSubdomain) => 
    api.get(`/api/products/for_vendor/?vendor=${vendorSubdomain}`),

  getProductsWithVendorFilter: (vendorSubdomain) => 
    api.get(`/api/products/products/?vendor=${vendorSubdomain}`)
};

// User API functions
export const userAPI = {
  register: (userData) => 
    api.post('/api/users/', userData),
  
  login: (credentials) => 
    api.post('/api/users/login/', credentials),
  
  logout: () => 
    api.post('/api/users/logout/'),
  
  getProfile: () => 
    api.get('/api/users/profile/'),
  
  updateProfile: (userData) => 
    api.patch('/api/users/profile/', userData),

  // ADD CSRF endpoint
  getCSRF: () => 
    api.get('/api/users/csrf/'), // FIXED: Added /api/
};

// Payment API functions
export const paymentAPI = {
  initiatePayment: (paymentData) => 
    api.post('/api/payments/initiate-payment/', paymentData),
  
  checkPaymentStatus: (paymentId) => 
    api.get(`/api/payments/status/${paymentId}/`),
  
  createOrder: (orderData) => 
    api.post('/api/orders/', orderData),
};

// Cart API functions
export const cartAPI = {
  getCart: () => 
    api.get('/api/cart/'),
  
  addToCart: (itemData) => 
    api.post('/api/cart/items/', itemData),
  
  updateCartItem: (itemId, quantity) => 
    api.patch(`/api/cart/items/${itemId}/`, { quantity }),
  
  removeFromCart: (itemId) => 
    api.delete(`/api/cart/items/${itemId}/`),
  
  clearCart: () => 
    api.delete('/api/cart/clear/'),
};

export default api;