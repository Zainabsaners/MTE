// src/components/Settings/ShippingSettings.jsx
import React, { useState } from 'react';

const ShippingSettings = ({ store, onSave }) => {
  const [formData, setFormData] = useState({
    shipping_enabled: store.shipping_enabled !== false,
    free_shipping_threshold: store.free_shipping_threshold || '',
    shipping_rate: store.shipping_rate || '',
    shipping_zones: store.shipping_zones || [],
    processing_time: store.processing_time || '1-3',
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
    await onSave('Shipping', formData);
    setSaving(false);
  };

  return (
    <div style={{ 
      background: '#f8f9fa', 
      padding: '25px', 
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}>
      <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Shipping Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '20px' }}>

          {/* Shipping Configuration */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '6px',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Shipping Configuration</h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  name="shipping_enabled"
                  checked={formData.shipping_enabled}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px' }}
                />
                <label style={{ 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#2c3e50'
                }}>
                  Enable Shipping
                </label>
              </div>

              {formData.shipping_enabled && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '5px', 
                        fontWeight: '600',
                        fontSize: '14px',
                        color: '#2c3e50'
                      }}>
                        Shipping Rate (KES)
                      </label>
                      <input
                        type="number"
                        name="shipping_rate"
                        value={formData.shipping_rate}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '5px', 
                        fontWeight: '600',
                        fontSize: '14px',
                        color: '#2c3e50'
                      }}>
                        Free Shipping Threshold (KES)
                      </label>
                      <input
                        type="number"
                        name="free_shipping_threshold"
                        value={formData.free_shipping_threshold}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '5px', 
                      fontWeight: '600',
                      fontSize: '14px',
                      color: '#2c3e50'
                    }}>
                      Order Processing Time
                    </label>
                    <select
                      name="processing_time"
                      value={formData.processing_time}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="same_day">Same day</option>
                      <option value="1-3">1-3 business days</option>
                      <option value="3-5">3-5 business days</option>
                      <option value="5-7">5-7 business days</option>
                      <option value="7-14">1-2 weeks</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '6px',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Shipping Information</h3>
            
            <div style={{ 
              background: '#e7f3ff', 
              padding: '15px', 
              borderRadius: '6px',
              border: '1px solid #b3d9ff'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#0066cc' }}>
                📦 <strong>Default Shipping:</strong> Currently set to standard shipping within Kenya.
                Additional shipping zones and international shipping can be configured when needed.
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
            {saving ? '💾 Saving...' : '💾 Save Shipping Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShippingSettings;