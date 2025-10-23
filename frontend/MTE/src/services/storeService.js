// src/services/storeService.js - UPDATED WITH AUTH CONTEXT
import api from './api';

const cleanSettingsData = (data) => {
  console.log('🧹 Cleaning settings data before sending:', data);
  
  const cleaned = { ...data };
  
  // Convert empty strings to null for decimal fields
  if (cleaned.free_shipping_threshold === '') {
    cleaned.free_shipping_threshold = null;
  }
  if (cleaned.shipping_rate === '') {
    cleaned.shipping_rate = null;
  }
  
  // Ensure boolean fields are actual booleans
  const booleanFields = [
    'shipping_enabled', 'email_notifications', 'order_notifications',
    'low_stock_alerts', 'customer_emails', 'newsletter_subscription'
  ];
  
  booleanFields.forEach(field => {
    if (field in cleaned) {
      cleaned[field] = Boolean(cleaned[field]);
    }
  });
  
  // Appearance-specific cleaning
  if (cleaned.theme_color && !cleaned.theme_color.startsWith('#')) {
    cleaned.theme_color = `#${cleaned.theme_color}`;
  }
  
  // Ensure store_layout is one of the valid choices
  const validLayouts = ['standard', 'modern', 'minimal', 'grid'];
  if (cleaned.store_layout && !validLayouts.includes(cleaned.store_layout)) {
    console.warn('⚠️ Invalid store_layout, using default');
    cleaned.store_layout = 'standard';
  }
  
  console.log('🧹 Cleaned data:', cleaned);
  return cleaned;
};

// Helper function to find user's store
const findUserStore = (stores, user) => {
  if (!user || !stores.length) return null;
  
  console.log('🔍 Searching for store matching user:', user);
  
  // Try different methods to match user with store
  const userStore = stores.find(store => {
    // Method 1: Match by owner ID
    if (store.owner && user.id && store.owner === user.id) {
      console.log('✅ Found store by owner ID match');
      return true;
    }
    
    // Method 2: Match by owner email
    if (store.owner_email && user.email && store.owner_email === user.email) {
      console.log('✅ Found store by owner email match');
      return true;
    }
    
    // Method 3: Match by store email
    if (store.email && user.email && store.email === user.email) {
      console.log('✅ Found store by store email match');
      return true;
    }
    
    // Method 4: Match by username in store name (common pattern)
    if (store.name && user.username && store.name.toLowerCase().includes(user.username.toLowerCase())) {
      console.log('✅ Found store by username in store name');
      return true;
    }
    
    // Method 5: Match by user ID in store data
    if (store.user && user.id && store.user === user.id) {
      console.log('✅ Found store by user ID in store data');
      return true;
    }
    
    return false;
  });
  
  return userStore;
};

export const storeService = {
  getCurrentStore: async (currentUser) => {
    try {
      console.log('🔄 Fetching all stores and filtering for current user...');
      
      if (!currentUser) {
        throw new Error('User not authenticated. Please login again.');
      }
      
      console.log('👤 Current user from AuthContext:', currentUser);
      
      // Get all stores from the API
      const response = await api.get('/tenants/tenants/');
      
      let stores = [];
      if (response.data.results && Array.isArray(response.data.results)) {
        stores = response.data.results;
      } else if (Array.isArray(response.data)) {
        stores = response.data;
      }
      
      console.log(`📊 Found ${stores.length} total stores`);
      
      if (stores.length === 0) {
        throw new Error('No stores found in API response');
      }
      
      // Find the store that belongs to the current user
      const userStore = findUserStore(stores, currentUser);
      
      if (!userStore) {
         
        // Fallback: Try to use first store with a warning
        const fallbackStore = stores[0];
        console.log(`✅ Using store: ${fallbackStore.name}`);
        
        return { data: fallbackStore };
      }
      
      console.log('✅ Found current user store:', userStore.name);
      return { data: userStore };
      
    } catch (error) {
      console.error('❌ Error in getCurrentStore:', error);
      throw error;
    }
  },
  
  updateStore: async (storeId, data, currentUser) => {
    try {
      // Verify this store belongs to current user before updating
      const currentStore = await storeService.getCurrentStore(currentUser);
      if (currentStore.data.id !== storeId) {
        throw new Error('You can only update your own store');
      }
      return await api.patch(`/tenants/tenants/${storeId}/`, data);
    } catch (error) {
      console.error('❌ Error updating store:', error);
      throw error;
    }
  },
  
  updateStoreSettings: async (data, currentUser) => {
    try {
      console.log('💾 Updating store settings for current user...');
      
      // First get current store to ensure we're updating the right one
      const currentStore = await storeService.getCurrentStore(currentUser);
      console.log('🔒 Updating settings for store:', currentStore.data.name);
      
      const cleanedData = cleanSettingsData(data);
      const response = await api.patch('/tenants/store-settings/', cleanedData);
      
      console.log('✅ Store settings updated successfully');
      return response;
    } catch (error) {
      console.error('❌ Error updating store settings:', error);
      throw error;
    }
  },
  
  uploadLogo: async (logoFile, currentUser) => {
    try {
      console.log('🖼️ Uploading logo for current user store...');
      
      // Verify we have the right store context
      const currentStore = await storeService.getCurrentStore(currentUser);
      console.log('🔒 Uploading logo for store:', currentStore.data.name);
      
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      const response = await api.patch('/tenants/store-settings/', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        }
      });
      
      console.log('✅ Logo uploaded successfully');
      return response;
    } catch (error) {
      console.error('❌ Logo upload failed:', error);
      throw error;
    }
  },

  testMpesa: async (currentUser) => {
    try {
      console.log('🧪 Testing MPESA for current user store...');
      
      // Get current store first to ensure we're testing the right one
      const currentStore = await storeService.getCurrentStore(currentUser);
      const storeId = currentStore.data.id;
      
      console.log('🔒 Testing MPESA for store:', currentStore.data.name);
      
      const response = await api.post(`/tenants/stores/${storeId}/test-mpesa/`);
      console.log('✅ MPESA test initiated successfully');
      return response;
    } catch (error) {
      console.error('❌ MPESA test failed:', error);
      throw error;
    }
  }
};