import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantService } from '../../services/tenantService';
import api from '../../services/api';

const TenantRegistration = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  
  // Form data - Includes ALL fields
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    email: '',
    phone_number: '',
    subscription_tier: 'basic',
    mpesa_business_shortcode: '',
    mpesa_account_number: '',
    description: '',
    owner_name: '',
    business_registration: '',
    address: '',
    password: '',
    confirm_password: ''
  });

  // Complete styles
  const containerStyle = {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '2rem',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif'
  };

  const formGroupStyle = {
    marginBottom: '1.5rem'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: '14px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box'
  };

  const inputFocusStyle = {
    ...inputStyle,
    borderColor: '#3498db',
    outline: 'none'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'inherit'
  };

  const buttonStyle = {
    padding: '12px 24px',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginRight: '10px'
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    background: '#2980b9',
    transform: 'translateY(-1px)'
  };

  const backButtonStyle = {
    ...buttonStyle,
    background: '#95a5a6'
  };

  const backButtonHoverStyle = {
    ...backButtonStyle,
    background: '#7f8c8d'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    background: '#bdc3c7',
    cursor: 'not-allowed',
    opacity: 0.6
  };

  const smallTextStyle = {
    fontSize: '12px',
    color: '#7f8c8d',
    marginTop: '4px',
    display: 'block'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleInputFocus = (e) => {
    e.target.style = inputFocusStyle;
  };

  const handleInputBlur = (e) => {
    e.target.style = inputStyle;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔄 Starting tenant registration process...');
    
    // Validate passwords match
    if (formData.password !== formData.confirm_password) {
      alert('Passwords do not match!');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      // Map form data to backend expected fields
      const registrationData = {
        // Required fields
        subdomain: formData.subdomain,
        password: formData.password,
        confirm_password: formData.confirm_password,
        
        // Additional fields
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        subscription_tier: formData.subscription_tier,
        mpesa_business_shortcode: formData.mpesa_business_shortcode || '',
        mpesa_account_number: formData.mpesa_account_number || '',
        description: formData.description || '',
        owner_name: formData.owner_name,
        business_registration: formData.business_registration || '',
        address: formData.address || '',
      };

      console.log('📦 Sending registration data:', registrationData);
      
      // ✅ CORRECT ENDPOINT - Fixed path
      const response = await api.post('/api/tenants/tenant-register/', registrationData, {
        timeout: 30000,
      });
      
      console.log('✅ Registration successful:', response.data);
      
      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        let successMessage = response.data.message || 'Registration successful! Awaiting admin approval.';
        
        // Add store URL if available
        if (response.data.store_url) {
          successMessage += ` Your store will be at: ${response.data.store_url}`;
        }
        
        setMessage(successMessage);
        
        setTimeout(() => {
          navigate('/vendor-dashboard');
        }, 4000);
      }
    } catch (error) {
      console.error('❌ Registration failed:', error);
      
      if (error.response?.data) {
        console.log('📋 Backend validation errors:', error.response.data);
        
        // Handle validation errors
        if (error.response.data.errors) {
          const errorList = Object.entries(error.response.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          alert(`Please fix the following errors:\n${errorList}`);
          setMessage(`Validation errors: ${errorList}`);
        } else {
          const errorMsg = error.response.data.message || JSON.stringify(error.response.data);
          alert(`Registration failed: ${errorMsg}`);
          setMessage(`Error: ${errorMsg}`);
        }
      } else if (error.code === 'ECONNABORTED') {
        alert('Registration timeout. The backend might be starting up. Please try again in 30 seconds.');
        setMessage('Backend is waking up. Please try again shortly.');
      } else {
        alert('Registration failed. Please check your connection and try again.');
        setMessage('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // Step 1: Store Basic Info
  const renderStep1 = () => (
    <div>
      <h3 style={{ color: '#2c3e50', marginBottom: '1.5rem' }}>Store Basic Information</h3>
      
      <div style={formGroupStyle}>
        <label style={labelStyle}>Store Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          style={inputStyle}
          placeholder="My Awesome Store"
          required
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Store Subdomain *</label>
        <input
          type="text"
          name="subdomain"
          value={formData.subdomain}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          style={inputStyle}
          placeholder="mystore"
          required
        />
        <span style={smallTextStyle}>
          Your store URL will be: {formData.subdomain || 'mystore'}.yourdomain.com
        </span>
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Store Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          style={textareaStyle}
          placeholder="Tell customers about your store, your products, and your mission..."
        />
      </div>

      <button 
        style={!formData.name || !formData.subdomain ? disabledButtonStyle : buttonStyle}
        onMouseEnter={(e) => {
          if (!formData.name || !formData.subdomain) return;
          e.target.style = buttonHoverStyle;
        }}
        onMouseLeave={(e) => {
          if (!formData.name || !formData.subdomain) return;
          e.target.style = buttonStyle;
        }}
        onClick={() => setStep(2)}
        disabled={!formData.name || !formData.subdomain}
        type="button"
      >
        Next → Owner Details
      </button>
    </div>
  );

  // Step 2: Owner & Business Details
  const renderStep2 = () => (
    <div>
      <h3 style={{ color: '#2c3e50', marginBottom: '1.5rem' }}>Owner & Business Information</h3>
      
      <div style={formGroupStyle}>
        <label style={labelStyle}>Owner Full Name *</label>
        <input
          type="text"
          name="owner_name"
          value={formData.owner_name}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          style={inputStyle}
          placeholder="John Doe"
          required
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Business Registration Number</label>
        <input
          type="text"
          name="business_registration"
          value={formData.business_registration}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          style={inputStyle}
          placeholder="Optional - if your business is registered"
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Business Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          style={textareaStyle}
          placeholder="Your business physical address for delivery and contact purposes..."
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
        <button 
          style={backButtonStyle}
          onMouseEnter={(e) => e.target.style = backButtonHoverStyle}
          onMouseLeave={(e) => e.target.style = backButtonStyle}
          onClick={() => setStep(1)}
          type="button"
        >
          ← Back
        </button>
        <button 
          style={!formData.owner_name ? disabledButtonStyle : buttonStyle}
          onMouseEnter={(e) => {
            if (!formData.owner_name) return;
            e.target.style = buttonHoverStyle;
          }}
          onMouseLeave={(e) => {
            if (!formData.owner_name) return;
            e.target.style = buttonStyle;
          }}
          onClick={() => setStep(3)}
          disabled={!formData.owner_name}
          type="button"
        >
          Next → Contact Information
        </button>
      </div>
    </div>
  );

  // Step 3: Contact & MPesa Details
  const renderStep3 = () => (
    <div>
      <h3 style={{ color: '#2c3e50', marginBottom: '1.5rem' }}>Contact & Payment Information</h3>
      
      <div style={formGroupStyle}>
        <label style={labelStyle}>Email Address *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          style={inputStyle}
          placeholder="your@email.com"
          required
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Phone Number *</label>
        <input
          type="tel"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          style={inputStyle}
          placeholder="0712345678"
          required
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>MPesa Business Shortcode</label>
        <input
          type="text"
          name="mpesa_business_shortcode"
          value={formData.mpesa_business_shortcode}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          style={inputStyle}
          placeholder="Optional - for receiving payments from customers"
        />
        <span style={smallTextStyle}>Your MPesa paybill or till number</span>
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>MPesa Account Number</label>
        <input
          type="text"
          name="mpesa_account_number"
          value={formData.mpesa_account_number}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          style={inputStyle}
          placeholder="Optional - account number for paybill"
        />
        <span style={smallTextStyle}>Account number if using paybill</span>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
        <button 
          style={backButtonStyle}
          onMouseEnter={(e) => e.target.style = backButtonHoverStyle}
          onMouseLeave={(e) => e.target.style = backButtonStyle}
          onClick={() => setStep(2)}
          type="button"
        >
          ← Back
        </button>
        <button 
          style={!formData.email || !formData.phone_number ? disabledButtonStyle : buttonStyle}
          onMouseEnter={(e) => {
            if (!formData.email || !formData.phone_number) return;
            e.target.style = buttonHoverStyle;
          }}
          onMouseLeave={(e) => {
            if (!formData.email || !formData.phone_number) return;
            e.target.style = buttonStyle;
          }}
          onClick={() => setStep(4)}
          disabled={!formData.email || !formData.phone_number}
          type="button"
        >
          Next → Subscription Plan
        </button>
      </div>
    </div>
  );

  // Step 4: Subscription Plan
  const renderStep4 = () => {
    const plans = tenantService.getSubscriptionPlans();

    return (
      <div>
        <h3 style={{ color: '#2c3e50', marginBottom: '1.5rem' }}>Choose Your Plan</h3>
        
        {plans.map(plan => (
          <div 
            key={plan.id}
            style={{
              border: formData.subscription_tier === plan.id ? '3px solid #3498db' : '2px solid #e9ecef',
              borderRadius: '12px',
              padding: '20px',
              margin: '15px 0',
              background: formData.subscription_tier === plan.id ? '#f8f9fa' : 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setFormData({...formData, subscription_tier: plan.id})}
            onMouseEnter={(e) => {
              if (formData.subscription_tier !== plan.id) {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderColor = '#bdc3c7';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.subscription_tier !== plan.id) {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e9ecef';
              }
            }}
          >
            <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{plan.name}</h4>
            <p style={{ margin: '5px 0', fontSize: '1.4em', fontWeight: 'bold', color: '#3498db' }}>
              {plan.price === 0 ? 'FREE' : `KES ${plan.price}/month`}
            </p>
            <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px', color: '#7f8c8d' }}>
              {plan.features.map((feature, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}

        <div style={formGroupStyle}>
          <label style={labelStyle}>Create Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={inputStyle}
            placeholder="Minimum 8 characters"
            required
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Confirm Password *</label>
          <input
            type="password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={inputStyle}
            placeholder="Re-enter your password"
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
          <button 
            style={backButtonStyle}
            onMouseEnter={(e) => e.target.style = backButtonHoverStyle}
            onMouseLeave={(e) => e.target.style = backButtonStyle}
            onClick={() => setStep(3)}
            type="button"
          >
            ← Back
          </button>
          <button 
            style={isSubmitting || !formData.password || !formData.confirm_password ? disabledButtonStyle : buttonStyle}
            onMouseEnter={(e) => {
              if (isSubmitting || !formData.password || !formData.confirm_password) return;
              e.target.style = buttonHoverStyle;
            }}
            onMouseLeave={(e) => {
              if (isSubmitting || !formData.password || !formData.confirm_password) return;
              e.target.style = buttonStyle;
            }}
            type="submit"
            disabled={isSubmitting || !formData.password || !formData.confirm_password}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    );
  };

  // Step 5: Success
  const renderStep5 = () => (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
      <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Application Submitted!</h3>
      <p style={{ color: '#7f8c8d', marginBottom: '2rem', lineHeight: '1.6' }}>{message}</p>
      <p style={{ fontWeight: 'bold', color: '#2c3e50', marginBottom: '1rem' }}>What happens next?</p>
      <ul style={{ 
        textAlign: 'left', 
        maxWidth: '400px', 
        margin: '0 auto 2rem',
        color: '#7f8c8d',
        lineHeight: '1.6'
      }}>
        <li style={{ marginBottom: '0.5rem' }}>We'll review your application within 24 hours</li>
        <li style={{ marginBottom: '0.5rem' }}>You'll receive an email with approval status</li>
        <li style={{ marginBottom: '0.5rem' }}>Once approved, you can start adding products to your store</li>
        <li>You'll get access to your Tenant dashboard</li>
      </ul>
      <button 
        style={buttonStyle}
        onMouseEnter={(e) => e.target.style = buttonHoverStyle}
        onMouseLeave={(e) => e.target.style = buttonStyle}
        onClick={() => {
          setStep(1);
          setFormData({
            name: '', subdomain: '', email: '', phone_number: '',
            subscription_tier: 'basic', mpesa_business_shortcode: '', mpesa_account_number: '',
            description: '', owner_name: '', business_registration: '', address: '',
            password: '', confirm_password: ''
          });
          setMessage('');
          setSuccess(false);
        }}
        type="button"
      >
        Register Another Store
      </button>
    </div>
  );

  return (
    <div style={containerStyle}>
      <h2 style={{ 
        color: '#2c3e50', 
        textAlign: 'center', 
        marginBottom: '2rem',
        fontSize: '2rem'
      }}>
        Register your shop
      </h2>
      
      {/* Progress Steps */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '2rem',
        position: 'relative'
      }}>
        {/* Progress line */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '10%',
          right: '10%',
          height: '2px',
          background: '#e9ecef',
          zIndex: 1
        }}></div>
        
        {[1, 2, 3, 4, 5].map(stepNum => (
          <div key={stepNum} style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 2 }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: step >= stepNum ? '#3498db' : 'white',
              color: step >= stepNum ? 'white' : '#bdc3c7',
              border: step >= stepNum ? 'none' : '2px solid #bdc3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 5px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {stepNum}
            </div>
            <small style={{ fontSize: '11px', color: step >= stepNum ? '#3498db' : '#bdc3c7' }}>
              {['Store', 'Owner', 'Contact', 'Plan', 'Done'][stepNum - 1]}
            </small>
          </div>
        ))}
      </div>

      {success && (
        <div style={{
          padding: '1rem',
          background: '#d4edda',
          color: '#155724',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #c3e6cb'
        }}>
          ✅ {message}
        </div>
      )}

      {message && !success && (
        <div style={{
          padding: '1rem',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb'
        }}>
          ❌ {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </form>
    </div>
  );
};

export default TenantRegistration;