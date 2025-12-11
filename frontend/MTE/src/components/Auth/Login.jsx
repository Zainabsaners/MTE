import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
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
  
  if (!formData.username || !formData.password) {
    setError('Please fill in all fields');
    return;
  }

  setLoading(true);
  setError('');

  // Try login
  const result = await login(formData.username, formData.password);

  if (result.success) {
    // Check if user has vendor access
    if (result.user.user_type === 'vendor' || result.user.is_vendor) {
      navigate('/vendor-dashboard');
    } else {
      navigate('/');
    }
  } else {
    // Try with email if username fails
    if (result.error.includes('credentials')) {
      console.log('🔄 Trying with email instead...');
      const emailResult = await login(formData.username, formData.password);
      
      if (emailResult.success) {
        if (emailResult.user.user_type === 'vendor') {
          navigate('/vendor-dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError('Invalid email/username or password');
      }
    } else {
      setError(result.error);
    }
  }
  
  setLoading(false);
};

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login to Your Account</h2>
        
        {error && (
          <div style={styles.error}>
            {typeof error === 'object' ? JSON.stringify(error) : error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}> Email</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your username or email"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.signupLink}>
          Don't have an account? <Link to="/register" style={styles.link}>Sign up here</Link>
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
    maxWidth: '420px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#2c3e50',
    fontSize: '1.8rem',
    fontWeight: '600'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
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
  button: {
    padding: '0.875rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'all 0.3s ease'
  },
  error: {
    background: '#fee',
    color: '#c33',
    padding: '0.875rem',
    borderRadius: '6px',
    marginBottom: '1.5rem',
    border: '1px solid #fcc',
    fontSize: '0.9rem'
  },
  signupLink: {
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

export default Login;