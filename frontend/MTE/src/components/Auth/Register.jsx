import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api, { getCSRFTokenFromServer } from '../../services/api';

const Register = () => {
  const [userType, setUserType] = useState('customer');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    store_name: '',
    subdomain: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [csrfReady, setCsrfReady] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!csrfReady) {
      setError('System is getting ready. Please try again in a moment.');
      return;
    }

    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Vendor-specific validation
    if (userType === 'vendor' && !formData.store_name) {
      setError('Store name is required for vendors');
      return;
    }

    if (userType === 'vendor' && !formData.subdomain) {
      setError('Store subdomain is required for vendors');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;

      if (userType === 'vendor') {
        // Use tenant registration endpoint for vendors
        const tenantData = {
          name: formData.store_name,
          subdomain: formData.subdomain,
          email: formData.email,
          phone_number: formData.phone_number || '',
          owner_name: `${formData.first_name} ${formData.last_name}`,
          password: formData.password,
          confirm_password: formData.password2,
          subscription_tier: 'basic'
        };

        console.log('🔄 Registering vendor:', tenantData);
        result = await api.post('/api/tenants/tenant-register/', tenantData);
        
        if (result.status === 200 || result.status === 201) {
          console.log('✅ Vendor registration successful');
          navigate('/vendor-dashboard');
        }
      } else {
        // Use regular user registration for customers
        const userData = {
          ...formData,
          user_type: userType
        };
        
        result = await register(userData);
        
        if (result.success) {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      if (error.response?.data) {
        // Handle validation errors
        if (error.response.data.errors) {
          const errorList = Object.entries(error.response.data.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          setError(`Please fix the following errors:\n${errorList}`);
        } else {
          const errorMsg = error.response.data.message || 
                          error.response.data.detail || 
                          JSON.stringify(error.response.data);
          setError(`Registration failed: ${errorMsg}`);
        }
      } else if (error.code === 'ECONNABORTED') {
        setError('Registration timeout. Please try again.');
      } else if (error.message?.includes('CSRF')) {
        setError('Security token issue. Please refresh the page and try again.');
      } else {
        setError('Registration failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join our marketplace as a shopper or seller</p>
        
        {/* User Type Toggle */}
        <div style={styles.userTypeToggle}>
          <div style={styles.toggleButtons}>
            <button
              type="button"
              onClick={() => setUserType('customer')}
              style={{
                ...styles.toggleButton,
                ...(userType === 'customer' ? styles.toggleButtonActive : styles.toggleButtonInactive)
              }}
            >
              🛒 Shop as Customer
            </button>
            <button
              type="button"
              onClick={() => setUserType('vendor')}
              style={{
                ...styles.toggleButton,
                ...(userType === 'vendor' ? styles.toggleButtonActive : styles.toggleButtonInactive)
              }}
            >
              🏪 Sell as Vendor
            </button>
          </div>
        </div>

        {error && (
          <div style={styles.error}>
            {error.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Vendor-specific fields */}
          {userType === 'vendor' && (
            <div style={styles.vendorSection}>
              <h3 style={styles.sectionTitle}>Store Information</h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Store Name *</label>
                <input
                  type="text"
                  name="store_name"
                  value={formData.store_name}
                  onChange={handleChange}
                  required={userType === 'vendor'}
                  style={styles.input}
                  placeholder="Enter your store name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Store Subdomain *</label>
                <input
                  type="text"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleChange}
                  required={userType === 'vendor'}
                  style={styles.input}
                  placeholder="your-store-name"
                />
                <small style={styles.helpText}>
                  This will be your store URL: {formData.subdomain || 'your-store'}.yourdomain.com
                </small>
              </div>
            </div>
          )}

          {/* Personal Information */}
          <h3 style={styles.sectionTitle}>Personal Information</h3>
          
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Enter your first name"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Choose a username"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your email"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter your phone number"
            />
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Create a password"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password *</label>
              <input
                type="password"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.button,
              ...(userType === 'customer' ? styles.customerButton : styles.vendorButton),
              opacity: (loading || !csrfReady) ? 0.7 : 1,
              cursor: (loading || !csrfReady) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating Account...' : `Create ${userType === 'customer' ? 'Customer' : 'Vendor'} Account`}
          </button>
        </form>

        <p style={styles.loginLink}>
          Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    backgroundColor: '#f8f9fa',
    padding: '2rem'
  },
  card: {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '550px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: '#2c3e50',
    fontSize: '1.8rem',
    fontWeight: '600'
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#7f8c8d',
    fontSize: '1rem'
  },
  userTypeToggle: {
    marginBottom: '2rem',
    padding: '1.5rem',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  toggleButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  toggleButton: {
    padding: '1rem',
    border: '2px solid',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  toggleButtonActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderColor: '#667eea',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
  },
  toggleButtonInactive: {
    background: 'white',
    color: '#7f8c8d',
    borderColor: '#e9ecef'
  },
  vendorSection: {
    marginBottom: '2rem',
    padding: '1.5rem',
    background: '#f0f8ff',
    borderRadius: '8px',
    border: '1px solid #d1ecf1'
  },
  sectionTitle: {
    color: '#2c3e50',
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #f8f9fa'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#34495e',
    fontSize: '0.95rem'
  },
  input: {
    width: '100%',
    padding: '0.875rem',
    border: '1px solid #dcdfe6',
    borderRadius: '6px',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
  },
  helpText: {
    display: 'block',
    marginTop: '0.25rem',
    color: '#6c757d',
    fontSize: '0.8rem'
  },
  button: {
    padding: '0.875rem',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'all 0.3s ease'
  },
  customerButton: {
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
  },
  vendorButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  error: {
    background: '#fee',
    color: '#c33',
    padding: '0.875rem',
    borderRadius: '6px',
    marginBottom: '1.5rem',
    border: '1px solid #fcc',
    fontSize: '0.9rem',
    whiteSpace: 'pre-line'
  },
  loginLink: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#7f8c8d',
    fontSize: '0.95rem'
  },
  link: {
    color: '#3498db',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

export default Register;