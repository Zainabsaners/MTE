import api from './api';

export const productService = {
  // Get vendor products
  getVendorProducts: async (params = {}) => {
    const response = await api.get('/products/products/', {params});
    //Always return the products array directly
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

  // Get single product
  getVendorProduct: async (productId) => {
    return await api.get(`/products/products/${productId}/`);
  },

  // Create product
  createProduct: async (productData) => {
    return await api.post('/products/products/', productData);
  },

  // Update product
  updateProduct: async (productId, productData) => {
    return await api.patch(`/products/products/${productId}/`, productData);
  },

  // Delete product
  deleteProduct: async (productId) => {
    return await api.delete(`/products/products/${productId}/`);
  },

  // Publish product
  publishProduct: async (productId) => {
    return await api.post(`/products/products/${productId}/publish/`);
  },

  // Unpublish product
  unpublishProduct: async (productId) => {
    return await api.post(`/products/products/${productId}/unpublish/`);
  },

  // Get product stats
  getProductStats: async () => {
    return await api.get('/products/products/stats/');
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/products/categories/');
    //Handle  different response formats
    if (Array.isArray(response.data)) {
      return response; //Direct array
    } else if (response.data && Array.isArray(response.data.results)) {
      //Django REST framework paginated response
      return { ...response, data: response.data.results };
    } else if (response.data && Array.isArray(response.data.categories)){
      //custom format with categories key
      return { ...response, data: response.data.categories };
    } else {
      //Return as is, let the component handleit
      return response;
    }
  },
  //update product category specifically
  updateProductCategory: async(productId, categoryId) => {
    return await api.patch('/products/products/${productId}/', {
      category: categoryId
    });
  },
  //Bulk update products
  bulkUpdateProducts: async(updates) => {
    return await api.patch('/products/products/bulk-update/', updates);
  }
}; 