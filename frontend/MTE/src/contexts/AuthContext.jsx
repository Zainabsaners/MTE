import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const userInfo = localStorage.getItem('user_info');
    
    if (token && userInfo) {
      const user = JSON.parse(userInfo);
      setUser(user);
      setIsAuthenticated(true);
      
      // Set axios header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Optional: Verify token is still valid
      try {
        await api.get('/api/users/profile/');
      } catch (error) {
        console.log('Token validation failed:', error.message);
        // Don't logout immediately, token might still be valid
      }
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    // Don't auto-logout on error
  } finally {
    setLoading(false);
  }
};

  // In AuthContext.jsx, update the login function:

  const login = async (username, password) => {
  try {
    console.log('🔄 Attempting login...');
    
    // Try with username first
    const response = await api.post('/api/users/login/', {
      username: username,
      password: password
    });
    
    console.log('✅ Login response:', response.data);
    
    // ✅ FIXED: Handle the ACTUAL format from your login endpoint
    const { user, access, refresh } = response.data;
    
    if (!access || !user) {
      throw new Error('Invalid response format from login');
    }
    
    // Store tokens and user info
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user_info', JSON.stringify(user));

    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    
    setUser(user);
    setIsAuthenticated(true);
    
    return { success: true, user };
    
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
    
    // Try with email if username fails
    if (error.response?.status === 401) {
      console.log('🔄 Trying login with email field...');
      try {
        const retryResponse = await api.post('/api/users/login/', {
          email: username,  // Try email instead
          password: password
        });
        
        const { user, access, refresh } = retryResponse.data;
        
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user_info', JSON.stringify(user));
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        setUser(user);
        setIsAuthenticated(true);
        return { success: true, user };
        
      } catch (retryError) {
        console.error('❌ Retry login error:', retryError.response?.data);
      }
    }
    
    return { 
      success: false, 
      error: error.response?.data?.error || 
             error.response?.data?.detail || 
             error.response?.data?.message || 
             'Login failed. Please check your credentials.' 
    };
  }
};

  const register = async (userData) => {
    try {
      console.log('🔄 Attempting registration...');
      const response = await api.post('/api/users/register/', userData);
      
      console.log('✅ Registration response:', response.data);
      const { user, access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_info', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true, user };
    } catch (error) {
      console.error('❌ Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};