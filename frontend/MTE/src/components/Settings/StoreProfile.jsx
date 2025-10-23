// src/components/Settings/StoreProfile.jsx
import React, { useState } from 'react';

const StoreProfile = ({ store, onSave }) => {
  const [formData, setFormData] = useState({
    name: store.name || '',
    description: store.description || '',
    email: store.email || '',
    phone: store.phone || '',
    address: store.address || '',
    website: store.website || '',
    facebook: store.facebook || '',
    instagram: store.instagram || '',
    twitter: store.twitter || '',
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave('Profile', formData);
    setSaving(false);
  };

  return (
    <div style={{ 
      background: '#f8f9fa', 
      padding: '25px', 
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}>
      <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Store Profile</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Basic Information */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '6px',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Basic Information</h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#2c3e50'
                }}>
                  Store Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  required
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
                  Store Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                  placeholder="Describe your store..."
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '6px',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Contact Information</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#2c3e50'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                fontWeight: '600',
                fontSize: '14px',
                color: '#2c3e50'
              }}>
                Physical Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                placeholder="Store physical address..."
              />
            </div>
          </div>

          {/* Social Media */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '6px',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Social Media</h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#2c3e50'
                }}>
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  placeholder="https://..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px', 
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#2c3e50'
                  }}>
                    Facebook
                  </label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="https://facebook.com/..."
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
                    Instagram
                  </label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="https://instagram.com/..."
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
                    Twitter
                  </label>
                  <input
                    type="url"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>
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
            {saving ? '💾 Saving...' : '💾 Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreProfile;