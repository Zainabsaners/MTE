import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      const response = await api.post('/api/users/login/', {
        username: username,
        password: password
      });
      
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
      console.error('Login error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
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
      const response = await api.post('/api/users/register/', userData);
      const { user, access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_info', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.response?.data };
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
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};