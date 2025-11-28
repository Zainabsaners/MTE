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
        setUser(JSON.parse(userInfo));
        setIsAuthenticated(true);
        
        // Optional: Verify token is still valid by making an API call
        try {
          await api.get('/api/users/profile/'); // ✅ FIXED: Added /api/
        } catch (error) {
          console.log('Token validation failed, logging out');
          logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      console.log('🔄 Attempting login...');
      const response = await api.post('/api/users/login/', { // ✅ FIXED: Added /api/
        username,
        password
      });
      
      console.log('✅ Login response:', response.data);
      const { user, access, refresh } = response.data;
      
      // Store tokens and user info
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_info', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true, user };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 
               error.response?.data?.detail || 
               error.response?.data?.message || 
               'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('🔄 Attempting registration...');
      const response = await api.post('/api/users/register/', userData); // ✅ FIXED: Added /api/
      
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