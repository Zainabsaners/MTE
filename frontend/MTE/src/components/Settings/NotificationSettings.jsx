// src/components/Settings/NotificationSettings.jsx
import React, { useState } from 'react';

const NotificationSettings = ({ store, onSave }) => {
  const [formData, setFormData] = useState({
    email_notifications: store.email_notifications !== false,
    order_notifications: store.order_notifications !== false,
    low_stock_alerts: store.low_stock_alerts !== false,
    customer_emails: store.customer_emails !== false,
    newsletter_subscription: store.newsletter_subscription || false,
    notification_email: store.notification_email || '',
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave('Notification', formData);
    setSaving(false);
  };

  return (
    <div style={{ 
      background: '#f8f9fa', 
      padding: '25px', 
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}>
      <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Notification Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '20px' }}>

          {/* Email Notifications */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '6px',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Email Notifications</h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  name="email_notifications"
                  checked={formData.email_notifications}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px' }}
                />
                <label style={{ 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#2c3e50'
                }}>
                  Enable Email Notifications
                </label>
              </div>

              {formData.email_notifications && (
                <>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '10px', 
                      fontWeight: '600',
                      fontSize: '14px',
                      color: '#2c3e50'
                    }}>
                      Notification Email Address
                    </label>
                    <input
                      type="email"
                      name="notification_email"
                      value={formData.notification_email}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                      placeholder="notifications@yourstore.com"
                    />
                  </div>

                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '15px', 
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Notification Types</h4>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          name="order_notifications"
                          checked={formData.order_notifications}
                          onChange={handleInputChange}
                          style={{ width: '16px', height: '16px' }}
                        />
                        <label style={{ fontSize: '14px', color: '#2c3e50' }}>
                          New Order Notifications
                        </label>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          name="low_stock_alerts"
                          checked={formData.low_stock_alerts}
                          onChange={handleInputChange}
                          style={{ width: '16px', height: '16px' }}
                        />
                        <label style={{ fontSize: '14px', color: '#2c3e50' }}>
                          Low Stock Alerts
                        </label>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          name="customer_emails"
                          checked={formData.customer_emails}
                          onChange={handleInputChange}
                          style={{ width: '16px', height: '16px' }}
                        />
                        <label style={{ fontSize: '14px', color: '#2c3e50' }}>
                          Customer Email Updates
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Marketing & Communication */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '6px',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Marketing & Communication</h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  name="newsletter_subscription"
                  checked={formData.newsletter_subscription}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px' }}
                />
                <label style={{ 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#2c3e50'
                }}>
                  Enable Newsletter Subscription
                </label>
              </div>
              
              <div style={{ 
                background: '#fff3cd', 
                padding: '15px', 
                borderRadius: '6px',
                border: '1px solid #ffeaa7'
              }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
                  📧 <strong>Email Marketing:</strong> When enabled, customers can subscribe to your store newsletter 
                  for updates on new products and promotions.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Notifications */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '6px',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Mobile Notifications</h3>
            
            <div style={{ 
              background: '#e7f3ff', 
              padding: '15px', 
              borderRadius: '6px',
              border: '1px solid #b3d9ff'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#0066cc' }}>
                📱 <strong>Coming Soon:</strong> Push notifications for mobile devices will be available 
                in the next update. You'll receive instant alerts for new orders and important store activities.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ marginTop: '25px', textAlign: 'right' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 30px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? '💾 Saving...' : '💾 Save Notifications'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSettings;