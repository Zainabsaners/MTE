import api from './api';

export const productService = {
  // Get vendor products - ✅ FIXED: Added /api/
  getVendorProducts: async (params = {}) => {
    const response = await api.get('/api/products/products/', {params});
    // Always return the products array directly
    if(Array.isArray(response.data )){
      return response;
    } else if (response.data && Array.isArray(response.data.results)){
      return {
        ...response,
        data: response.data.results
      };
    } else {
      return response;
    }
  },

  // Get single product - ✅ FIXED: Added /api/
  getVendorProduct: async (productId) => {
    return await api.get(`/api/products/products/${productId}/`);
  },

  // Create product - ✅ FIXED: Added /api/
  createProduct: async (productData) => {
    return await api.post('/api/products/products/', productData);
  },

  // Update product - ✅ FIXED: Added /api/
  updateProduct: async (productId, productData) => {
    return await api.patch(`/api/products/products/${productId}/`, productData);
  },

  // Delete product - ✅ FIXED: Added /api/
  deleteProduct: async (productId) => {
    return await api.delete(`/api/products/products/${productId}/`);
  },

  // Publish product - ✅ FIXED: Added /api/
  publishProduct: async (productId) => {
    return await api.post(`/api/products/products/${productId}/publish/`);
  },

  // Unpublish product - ✅ FIXED: Added /api/
  unpublishProduct: async (productId) => {
    return await api.post(`/api/products/products/${productId}/unpublish/`);
  },

  // Get product stats - ✅ FIXED: Added /api/
  getProductStats: async () => {
    return await api.get('/api/products/products/stats/');
  },

  // Get categories - ✅ FIXED: Added /api/
  getCategories: async () => {
    const response = await api.get('/api/products/categories/');
    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response; // Direct array
    } else if (response.data && Array.isArray(response.data.results)) {
      // Django REST framework paginated response
      return { ...response, data: response.data.results };
    } else if (response.data && Array.isArray(response.data.categories)){
      // Custom format with categories key
      return { ...response, data: response.data.categories };
    } else {
      // Return as is, let the component handle it
      return response;
    }
  },
  
  // Update product category specifically - ✅ FIXED: Added /api/
  updateProductCategory: async(productId, categoryId) => {
    return await api.patch(`/api/products/products/${productId}/`, { // ✅ FIXED: Template literal
      category: categoryId
    });
  },
  
  // Bulk update products - ✅ FIXED: Added /api/
  bulkUpdateProducts: async(updates) => {
    return await api.patch('/api/products/products/bulk-update/', updates);
  }
};