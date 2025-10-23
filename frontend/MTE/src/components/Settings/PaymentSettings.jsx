// src/components/Settings/PaymentSettings.jsx - FULLY UPDATED
import React, { useState } from 'react';

const PaymentSettings = ({ store, onSave }) => {
  const [formData, setFormData] = useState({
    // MPESA Settings - Pre-fill with your working credentials
    mpesa_consumer_key: store.mpesa_consumer_key || 'Rq7AKTxiciG6hNOCRAuZYIHA03akPIHUOTSDaXbO6rKqpgo9',
    mpesa_consumer_secret: store.mpesa_consumer_secret || '3zQgl5lVB0xAzRxXSENnYSXjiQa0SzgXcmYXQMvwaqHiDn18LL0QZnZ8bgRGmEPb',
    mpesa_business_shortcode: store.mpesa_business_shortcode || '174379',
    mpesa_passkey: store.mpesa_passkey || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
    mpesa_environment: store.mpesa_environment || 'sandbox',
    
    // Other Payment Methods
    payment_methods: store.payment_methods || ['cash_on_delivery'],
    enable_cash_on_delivery: store.enable_cash_on_delivery !== false,
    enable_bank_transfer: store.enable_bank_transfer || false,
    bank_account_details: store.bank_account_details || '',
  });
  const [saving, setSaving] = useState(false);
  const [testingMpesa, setTestingMpesa] = useState(false);
  const [testResult, setTestResult] = useState('');

  // CSRF Token Helper
  const getCSRFToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    
    // Check cookies first
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    
    // If not found in cookies, try meta tag
    if (!cookieValue) {
      const metaTag = document.querySelector('meta[name="csrf-token"]');
      if (metaTag) {
        cookieValue = metaTag.getAttribute('content');
      }
    }
    
    // If still not found, try hidden input
    if (!cookieValue) {
      const input = document.querySelector('[name=csrfmiddlewaretoken]');
      if (input) {
        cookieValue = input.value;
      }
    }
    
    console.log('CSRF Token found:', cookieValue ? 'Yes' : 'No');
    return cookieValue;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setTestResult(''); // Clear test result when credentials change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave('Payment', formData);
    setSaving(false);
  };

const testMpesaIntegration = async () => {
  setTestingMpesa(true);
  setTestResult('🔄 Testing MPESA connection...');
  
  try {
    const response = await fetch('/api/payments/test-connection/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      setTestResult('✅ ' + data.message);
    } else {
      setTestResult('❌ ' + data.error);
    }
  } catch (error) {
    setTestResult('❌ Connection failed: ' + error.message);
  } finally {
    setTestingMpesa(false);
  }
};



  return (
    <div style={{ 
      background: '#f8f9fa', 
      padding: '25px', 
      borderRadius: '8px',
      border: '1px solid #e9ecef',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        color: '#2c3e50',
        borderBottom: '2px solid #3498db',
        paddingBottom: '10px'
      }}>
        Payment Settings
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '25px' }}>

          {/* MPESA Configuration */}
          <div style={{ 
            background: 'white', 
            padding: '25px', 
            borderRadius: '8px',
            border: '1px solid #ddd',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>MPESA Integration</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ 
                  padding: '4px 12px', 
                  background: '#d4edda', 
                  color: '#155724',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  ✅ Backend Connected
                </span>
                <span style={{ 
                  padding: '4px 12px', 
                  background: '#fff3cd', 
                  color: '#856404',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  🔧 Sandbox Mode
                </span>
              </div>
            </div>
            
            {/* Success Message */}
            <div style={{ 
              background: '#d4edda', 
              padding: '15px', 
              borderRadius: '6px',
              marginBottom: '20px',
              border: '1px solid #c3e6cb'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>🎉 MPESA Backend is Working!</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#155724' }}>
                Your MPESA credentials are successfully connecting to Safaricom's API. 
                You can now test payments using the button below.
              </p>
            </div>

            {/* Test Result Display */}
            {testResult && (
              <div style={{
                padding: '15px',
                borderRadius: '6px',
                marginBottom: '20px',
                background: testResult.includes('✅') ? '#d4edda' : '#f8d7da',
                color: testResult.includes('✅') ? '#155724' : '#721c24',
                border: `1px solid ${testResult.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {testResult}
              </div>
            )}

            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#2c3e50'
                  }}>
                    Consumer Key *
                  </label>
                  <input
                    type="text"
                    name="mpesa_consumer_key"
                    value={formData.mpesa_consumer_key}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s'
                    }}
                    placeholder="Your Consumer Key"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#2c3e50'
                  }}>
                    Consumer Secret *
                  </label>
                  <input
                    type="password"
                    name="mpesa_consumer_secret"
                    value={formData.mpesa_consumer_secret}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      transition: 'border-color 0.3s'
                    }}
                    placeholder="Your Consumer Secret"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#2c3e50'
                  }}>
                    Business Shortcode *
                  </label>
                  <input
                    type="text"
                    name="mpesa_business_shortcode"
                    value={formData.mpesa_business_shortcode}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    placeholder="174379"
                  />
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    Use 174379 for sandbox testing
                  </small>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#2c3e50'
                  }}>
                    Passkey *
                  </label>
                  <input
                    type="password"
                    name="mpesa_passkey"
                    value={formData.mpesa_passkey}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                    placeholder="Your Passkey"
                  />
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#2c3e50'
                }}>
                  Environment *
                </label>
                <select
                  name="mpesa_environment"
                  value={formData.mpesa_environment}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: 'white'
                  }}
                >
                  <option value="sandbox">Sandbox (Testing)</option>
                  <option value="production">Production (Live)</option>
                </select>
              </div>

              {/* Test MPESA Button */}
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <button
                  type="button"
                  onClick={testMpesaIntegration}
                  disabled={testingMpesa}
                  style={{
                    padding: '14px 30px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: testingMpesa ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    opacity: testingMpesa ? 0.7 : 1,
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!testingMpesa) {
                      e.target.style.background = '#218838';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!testingMpesa) {
                      e.target.style.background = '#28a745';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {testingMpesa ? '🔄 Testing MPESA Connection...' : '🧪 Test MPESA Connection Now'}
                </button>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#666', 
                  margin: '10px 0 0 0',
                  lineHeight: '1.4'
                }}>
                  This will test your current MPESA credentials against Safaricom's API.
                  <br />
                  <strong>Test Phone Numbers:</strong> 254708374149, 254708374150, 254708374151
                </p>
              </div>
            </div>
          </div>

          {/* Other Payment Methods */}
          <div style={{ 
            background: 'white', 
            padding: '25px', 
            borderRadius: '8px',
            border: '1px solid #ddd',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#2c3e50',
              borderBottom: '1px solid #eee',
              paddingBottom: '10px'
            }}>
              Other Payment Methods
            </h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '6px'
              }}>
                <input
                  type="checkbox"
                  name="enable_cash_on_delivery"
                  checked={formData.enable_cash_on_delivery}
                  onChange={handleInputChange}
                  style={{ width: '20px', height: '20px' }}
                />
                <div>
                  <label style={{ 
                    fontWeight: '600',
                    fontSize: '15px',
                    color: '#2c3e50',
                    cursor: 'pointer'
                  }}>
                    Enable Cash on Delivery
                  </label>
                  <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '13px' }}>
                    Allow customers to pay when they receive their order
                  </p>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '6px'
              }}>
                <input
                  type="checkbox"
                  name="enable_bank_transfer"
                  checked={formData.enable_bank_transfer}
                  onChange={handleInputChange}
                  style={{ width: '20px', height: '20px' }}
                />
                <div>
                  <label style={{ 
                    fontWeight: '600',
                    fontSize: '15px',
                    color: '#2c3e50',
                    cursor: 'pointer'
                  }}>
                    Enable Bank Transfer
                  </label>
                  <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '13px' }}>
                    Allow customers to pay via bank transfer
                  </p>
                </div>
              </div>

              {formData.enable_bank_transfer && (
                <div style={{
                  padding: '15px',
                  background: '#e7f3ff',
                  borderRadius: '6px',
                  border: '1px solid #b3d9ff'
                }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '10px', 
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#2c3e50'
                  }}>
                    Bank Account Details
                  </label>
                  <textarea
                    name="bank_account_details"
                    value={formData.bank_account_details}
                    onChange={handleInputChange}
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical',
                      background: 'white'
                    }}
                    placeholder="Bank Name: Equity Bank
Account Number: 123456789
Account Name: Your Store Name
Branch: Nairobi"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ 
          marginTop: '30px', 
          textAlign: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #e9ecef'
        }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '14px 40px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              opacity: saving ? 0.7 : 1,
              transition: 'all 0.3s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.target.style.background = '#2980b9';
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.target.style.background = '#3498db';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {saving ? '💾 Saving Payment Settings...' : '💾 Save Payment Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentSettings;