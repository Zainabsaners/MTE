// src/components/Settings/Settings.jsx - UPDATED (NO OWNERSHIP WARNING)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { storeService } from '../../services/storeService';
import StoreProfile from './StoreProfile';
import PaymentSettings from './PaymentSettings';
import ShippingSettings from './ShippingSettings';
import AppearanceSettings from './AppearanceSettings';
import NotificationSettings from './NotificationSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Use your AuthContext
  const { user, isAuthenticated, logout } = useAuth();

  // Load store data when component mounts or user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadStoreData();
    } else if (!isAuthenticated) {
      setLoading(false);
      setMessage('❌ Please login to access store settings');
    }
  }, [isAuthenticated, user]);

  const loadStoreData = async () => {
    if (!user) {
      setMessage('❌ No user information available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage('🔄 Loading your store settings...');
    
    try {
      // Pass current user to store service for filtering
      const response = await storeService.getCurrentStore(user);
      console.log('✅ Store data loaded for current user:', response.data);
      
      let storeData = response.data;
      
      // Merge store data with settings for the form
      if (storeData.settings) {
        storeData = { 
          // Store basic info
          id: storeData.id,
          name: storeData.name || '',
          subdomain: storeData.subdomain || '',
          is_active: storeData.is_active || false,
          subscription_tier: storeData.subscription_tier || 'basic',
          subscription_status: storeData.subscription_status || 'inactive',
          owner: storeData.owner,
          owner_email: storeData.owner_email,
          
          // Contact info from store or settings
          description: storeData.description || storeData.settings.description || '',
          email: storeData.email || storeData.owner_email || storeData.settings.email || '',
          phone: storeData.phone_number || storeData.settings.phone || '',
          address: storeData.address || storeData.settings.address || '',
          
          // MPESA settings from store or settings
          mpesa_business_shortcode: storeData.mpesa_business_shortcode || storeData.settings.mpesa_business_shortcode || '',
          mpesa_account_number: storeData.mpesa_account_number || '',
          mpesa_consumer_key: storeData.settings.mpesa_consumer_key || '',
          mpesa_consumer_secret: storeData.settings.mpesa_consumer_secret || '',
          mpesa_passkey: storeData.settings.mpesa_passkey || '',
          mpesa_environment: storeData.settings.mpesa_environment || 'sandbox',
          
          // Shipping settings
          shipping_enabled: storeData.settings.shipping_enabled !== false,
          free_shipping_threshold: storeData.settings.free_shipping_threshold || '',
          shipping_rate: storeData.settings.shipping_rate || '',
          processing_time: storeData.settings.processing_time || '1-3',
          
          // Appearance
          theme_color: storeData.settings.theme_color || '#3498db',
          logo: storeData.store_logo || storeData.settings.logo || '',
          store_layout: storeData.settings.store_layout || 'standard',
          
          // Notifications
          email_notifications: storeData.settings.email_notifications !== false,
          order_notifications: storeData.settings.order_notifications !== false,
          low_stock_alerts: storeData.settings.low_stock_alerts !== false,
          customer_emails: storeData.settings.customer_emails !== false,
          newsletter_subscription: storeData.settings.newsletter_subscription || false,
          notification_email: storeData.settings.notification_email || '',
          
          // Social media
          website: storeData.settings.website || '',
          facebook: storeData.settings.facebook || '',
          instagram: storeData.settings.instagram || '',
          twitter: storeData.settings.twitter || '',
        };
      }
      
      setStore(storeData);
      
      // Simple success message without ownership verification
      setMessage(`✅ Loaded your store: ${storeData.name}`);
      
      setTimeout(() => setMessage(''), 4000);
      
    } catch (error) {
      console.error('❌ Error loading store data:', error);
      setMessage(`❌ Failed to load store: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section, formData) => {
    console.log('📤 Saving data for section:', section);
    
    try {
      // Pass current user to ensure we're updating the correct store
      const response = await storeService.updateStoreSettings(formData, user);
      console.log('✅ Save response:', response.data);
      
      // Update store state with new data
      setStore(prev => ({ 
        ...prev, 
        ...response.data 
      }));
      
      setMessage(`✅ ${section} settings saved successfully!`);
      
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          setMessage(`❌ Validation errors: ${errorMessages}`);
        } else {
          setMessage(`❌ Validation error: ${errorData}`);
        }
      } else {
        setMessage(`❌ Failed to save ${section} settings: ${error.message}`);
      }
    }
  };

  const handleLogoUpload = async (logoFile) => {
    try {
      // Pass current user to ensure we're uploading to the correct store
      const response = await storeService.uploadLogo(logoFile, user);
      console.log('✅ Logo upload response:', response.data);
      
      // Update store state with new logo
      setStore(prev => ({ 
        ...prev, 
        logo: response.data.logo 
      }));
      
      setMessage('✅ Store logo updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('❌ Error uploading logo:', error);
      setMessage(`❌ Failed to upload logo: ${error.message}`);
    }
  };

  const handleTestMpesa = async () => {
    try {
      // Pass current user to ensure we're testing the correct store
      const response = await storeService.testMpesa(user);
      setMessage('✅ MPESA test initiated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ MPESA test failed:', error);
      setMessage(`❌ MPESA test failed: ${error.message}`);
    }
  };

  const tabs = [
    { id: 'profile', name: '🏪 Store Profile', component: StoreProfile },
    { id: 'appearance', name: '🎨 Appearance', component: AppearanceSettings },
    { id: 'payments', name: '💳 Payments', component: PaymentSettings },
    { id: 'shipping', name: '🚚 Shipping', component: ShippingSettings },
    { id: 'notifications', name: '🔔 Notifications', component: NotificationSettings },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ color: '#e74c3c', fontSize: '18px', marginBottom: '20px' }}>
          🔒 Authentication Required
        </div>
        <p>Please log in to access store settings.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>Loading your store settings...</div>
        {user && (
          <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            User: {user.email || user.username}
          </div>
        )}
      </div>
    );
  }

  if (!store) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>No store data available.</div>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          {user ? `Logged in as: ${user.email || user.username}` : 'Please login first'}
        </div>
        <button 
          onClick={loadStoreData}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        borderBottom: '2px solid #3498db', 
        paddingBottom: '15px', 
        marginBottom: '30px' 
      }}>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>Store Settings</h1>
        <p style={{ margin: '5px 0 0 0', color: '#7f8c8d' }}>
          Managing: <strong>{store.name}</strong>
          {user && (
            <span style={{ fontSize: '12px', color: '#95a5a6', marginLeft: '10px' }}>
              (User: {user.email || user.username})
            </span>
          )}
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div style={{
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '14px',
          border: '1px solid transparent',
          ...(message.includes('✅') ? {
            background: '#d4edda',
            color: '#155724',
            borderColor: '#c3e6cb'
          } : {
            background: '#f8d7da',
            color: '#721c24',
            borderColor: '#f5c6cb'
          })
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Sidebar Navigation */}
        <div style={{ width: '250px', flexShrink: 0 }}>
          <nav style={{ 
            background: '#f8f9fa', 
            borderRadius: '8px', 
            padding: '10px',
            border: '1px solid #e9ecef'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: 'none',
                  background: activeTab === tab.id ? '#3498db' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#2c3e50',
                  textAlign: 'left',
                  borderRadius: '6px',
                  marginBottom: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.id ? '600' : '400',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {ActiveComponent && (
            <ActiveComponent 
              store={store} 
              onSave={handleSave}
              onLogoUpload={handleLogoUpload}
              onTestMpesa={handleTestMpesa}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;