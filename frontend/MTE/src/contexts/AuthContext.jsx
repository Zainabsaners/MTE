import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

// ✅ Function to get CSRF token from cookies
  const getCSRFToken = () => {
    const name = 'csrftoken';
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(name + '='))
      ?.split('=')[1];
    return cookieValue;
  };

  // ✅ Function to setup CSRF token before login
  const setupCSRF = async () => {
    try {
      console.log('🔄 Setting up CSRF token...');
      
      // Make a simple GET request to get CSRF cookie
      const response = await axios.get('https://ecommerce-backend-xz2q.onrender.com/api/users/csrf/', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('✅ CSRF setup response status:', response.status);
      console.log('✅ CSRF response data:', response.data);

      await new Promise(resolve => setTimeout(resolve, 100));

      return getCSRFToken();
    } catch (error) {
      console.warn('⚠️ CSRF setup may have failed:', error.message);
      return null;
    }
  };
  // ✅ SIMPLE: Check if user is logged in
  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    const userInfo = localStorage.getItem('user_info');
    
    if (token && userInfo) {
      try {
        const user = JSON.parse(userInfo);
        setUser(user);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing user info:', error);
        logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // ✅ SIMPLE: Login function
  const login = async (username, password) => {
    try {
      console.log('🔄 Step 1: Setting up CSRF for login...');

      await setupCSRF();

      // First, get CSRF token by making a GET request
      const csrfToken = getCSRFToken();
      console.log('🔑 CSRF Token obtained:', csrfToken ? 'Yes' : 'No');
      console.log('🍪 Current CSRF from cookies:', csrfToken);

      if (!csrfToken) {
      return {
        success: false,
        error: 'Failed to get CSRF token. Please refresh the page.'
      };
    }


      
      console.log('🔄 Step 2: Attempting login...');

      const response = await axios.post(
        'https://ecommerce-backend-xz2q.onrender.com/api/users/login/',
        {
        username: username,
        password: password
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRFToken': csrfToken
          }
        }
      );
      console.log('✅ Login response status:', response.status);
      console.log('✅ Login response data:', response.data);
      
      const { user, access, refresh } = response.data;
      
      // ✅ ALWAYS ADD is_vendor FLAG IF MISSING
      const enhancedUser = {
        ...user,
        is_vendor: user.is_vendor_admin || user.is_vendor_staff || false,
        user_type: (user.is_vendor_admin || user.is_vendor_staff) ? 'vendor' : 'customer'
      };
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_info', JSON.stringify(enhancedUser));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      setUser(enhancedUser);
      
      return { success: true, user: enhancedUser };
      
    } catch (error) {
      console.error('❌ Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        headers: error.response?.headers
      });
      let errorMessage = 'Login failed';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.error){
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.non_field_errors){
        errorMessage = error.response.data.non_field_errors[0];
      }
      
      
      return { 
        success: false, 
        error: errorMessage,
        status: error.response?.status
      };
    }
  };

  const logout = () => {
    localStorage.clear();
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const register = async (userData) => {
    try {
      await setupCSRF();
      const csrfToken = getCSRFToken();
      const response = await axios.post(
        'https://ecommerce-backend-xz2q.onrender.com/api/users/register/',
        userData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRFToken': csrfToken
          }
        }
      );
      console.log('✅ Registration response status:', response.status);
      console.log('✅ Registration response data:', response.data);
      const { user, access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_info', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
       console.error('Registration error:', error.response?.data || error.message);

      return { success: false, error: error.response?.data || error.message};
    }
  };

  // ✅ SIMPLE: Check if user is vendor
  const isVendor = () => {
    if (!user) return false;
    return user.is_vendor === true || 
           user.is_vendor_admin === true || 
           user.is_vendor_staff === true ||
           user.user_type === 'vendor';
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      register,
      isVendor: isVendor(),
      isAuthenticated: !!user,
      getCSRFToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};