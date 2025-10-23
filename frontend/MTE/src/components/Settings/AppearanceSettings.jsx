// AppearanceSettings.jsx - ADD IMPORT
import React, { useState } from 'react';
import { storeService } from '../../services/storeService'; // ADD THIS IMPORT

const AppearanceSettings = ({ store, onSave }) => {
  const [formData, setFormData] = useState({
    theme_color: store.theme_color || '#3498db',
    store_layout: store.store_layout || 'standard',
    logo: store.logo || '',
  });
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      
      // Create a preview for the UI
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, logo: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // First, upload logo separately if there's a new one
      if (logoFile && store.id) {
        console.log('🖼️ Uploading logo file...');
        await storeService.uploadLogo(store.id, logoFile);
      }
      
      // Then save other appearance settings (without the logo base64 data)
      const settingsData = {
        theme_color: formData.theme_color,
        store_layout: formData.store_layout
      };
      
      console.log('💾 Saving appearance settings:', settingsData);
      await onSave('Appearance', settingsData);
      
      // Clear the logo file after successful upload
      setLogoFile(null);
      
    } catch (error) {
      console.error('❌ Error saving appearance:', error);
    } finally {
      setSaving(false);
    }
  };

  const themeColors = [
    { name: 'Blue', value: '#3498db' },
    { name: 'Green', value: '#27ae60' },
    { name: 'Purple', value: '#9b59b6' },
    { name: 'Orange', value: '#e67e22' },
    { name: 'Red', value: '#e74c3c' },
    { name: 'Pink', value: '#e84393' },
  ];

  return (
    <div style={{ 
      background: '#f8f9fa', 
      padding: '25px', 
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}>
      <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Appearance Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '20px' }}>

          {/* Branding */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '6px',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Branding</h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Logo Upload */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#2c3e50'
                }}>
                  Store Logo
                </label>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '20px',
                  padding: '20px',
                  border: '2px dashed #ddd',
                  borderRadius: '6px',
                  background: '#fafafa'
                }}>
                  <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: formData.logo ? 'transparent' : '#f8f9fa'
                  }}>
                    {formData.logo ? (
                      <img 
                        src={formData.logo} 
                        alt="Store logo preview" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%',
                          borderRadius: '4px'
                        }} 
                      />
                    ) : (
                      <span style={{ color: '#666', fontSize: '12px' }}>No logo</span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ marginBottom: '10px' }}
                    />
                    <p style={{ 
                      margin: 0, 
                      fontSize: '12px', 
                      color: '#666' 
                    }}>
                      Recommended: 200x200px PNG or JPG
                    </p>
                  </div>
                </div>
              </div>

              {/* Theme Color */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#2c3e50'
                }}>
                  Theme Color
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {themeColors.map(color => (
                    <label key={color.value} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <input
                        type="radio"
                        name="theme_color"
                        value={color.value}
                        checked={formData.theme_color === color.value}
                        onChange={handleInputChange}
                        style={{ display: 'none' }}
                      />
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: color.value,
                          border: formData.theme_color === color.value ? '3px solid #2c3e50' : '2px solid #ddd',
                          cursor: 'pointer'
                        }}
                        title={color.name}
                      />
                    </label>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px' }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>Custom:</span>
                    <input
                      type="color"
                      name="theme_color"
                      value={formData.theme_color}
                      onChange={handleInputChange}
                      style={{
                        width: '40px',
                        height: '40px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>
                <p style={{ 
                  margin: '10px 0 0 0', 
                  fontSize: '12px', 
                  color: '#666' 
                }}>
                  Selected: <strong style={{ color: formData.theme_color }}>{formData.theme_color}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Store Layout */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '6px',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Store Layout</h3>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: '600',
                fontSize: '14px',
                color: '#2c3e50'
              }}>
                Store Layout
              </label>
              <select
                name="store_layout"
                value={formData.store_layout}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="standard">Standard Layout</option>
                <option value="modern">Modern Layout</option>
                <option value="minimal">Minimal Layout</option>
                <option value="grid">Grid Layout</option>
              </select>
              <p style={{ 
                margin: '10px 0 0 0', 
                fontSize: '12px', 
                color: '#666' 
              }}>
                Choose how your store products are displayed to customers
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
            {saving ? '💾 Saving...' : '💾 Save Appearance'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppearanceSettings;