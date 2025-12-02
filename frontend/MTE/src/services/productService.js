import api from './api';

export const productService = {
  // Get vendor products
  getVendorProducts: async (params = {}) => {
    const response = await api.get('/api/products/products/', {params});
    if(Array.isArray(response.data)){
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
    return await api.get(`/api/products/products/${productId}/`);
  },

  // ✅ CREATE PRODUCT WITH CLOUDINARY UPLOAD (UPDATED)
  createProduct: async (productData) => {
    return await api.post('/api/products/products/', productData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Add this for file uploads
      },
    });
  },

  // ✅ UPDATE PRODUCT WITH CLOUDINARY UPLOAD (UPDATED)
  updateProduct: async (productId, productData) => {
    return await api.patch(`/api/products/products/${productId}/`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Add this for file uploads
      },
    });
  },

  // Delete product
  deleteProduct: async (productId) => {
    return await api.delete(`/api/products/products/${productId}/`);
  },

  // Publish product
  publishProduct: async (productId) => {
    return await api.post(`/api/products/products/${productId}/publish/`);
  },

  // Unpublish product
  unpublishProduct: async (productId) => {
    return await api.post(`/api/products/products/${productId}/unpublish/`);
  },

  // Get product stats
  getProductStats: async () => {
    return await api.get('/api/products/products/stats/');
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/api/products/categories/');
    if (Array.isArray(response.data)) {
      return response;
    } else if (response.data && Array.isArray(response.data.results)) {
      return { ...response, data: response.data.results };
    } else if (response.data && Array.isArray(response.data.categories)){
      return { ...response, data: response.data.categories };
    } else {
      return response;
    }
  },
  
  // Update product category specifically
  updateProductCategory: async(productId, categoryId) => {
    return await api.patch(`/api/products/products/${productId}/`, {
      category: categoryId
    });
  },
  
  // ✅ UPLOAD PRODUCT IMAGE TO CLOUDINARY (NEW FUNCTION)
  uploadProductImage: async (productId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return await api.patch(`/api/products/products/${productId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // ✅ BULK UPLOAD MULTIPLE IMAGES (NEW FUNCTION)
  uploadMultipleImages: async (productId, imageFiles) => {
    const formData = new FormData();
    imageFiles.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
    
    return await api.post(`/api/products/products/${productId}/upload-images/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};