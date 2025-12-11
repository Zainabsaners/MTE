import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header/Header';
import Home from './pages/Home/Home';
import VendorShop from './pages/VendorShop/VendorShop';
import TenantRegistration from './components/Tenant/TenantRegistration';
import Products from './pages/Products/Products';
import Cart from './pages/Cart/Cart';
import './App.css';
import VendorDashboard from './components/Tenant/Dashboard';
import ProductForm from './components/Tenant/ProductForm';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import api from './services/api';
import Settings from './components/Settings/Settings';
import VendorDashboardGuard from './components/VendorDashboardGuard';
// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});



function App() {
  useEffect( () =>  {
    const ensureCSRFToken = async () => {
      try {
        await api.get('/api/users/csrf/');
        console.log('✅ CSRF token ensured');

      } catch (error){
        console.error('❌ CSRF token setup failed:', error);
      }
    };
    ensureCSRFToken();
  }, []);

  

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <Header />
              <main>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/shops/:vendorSubdomain" element={<VendorShop />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/register-tenant" element={<TenantRegistration />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/settings" element={<Settings/>} />
                  
                  {/* Protected routes - require authentication */}
                  <Route path="/vendor-dashboard" element={
                    <ProtectedRoute>
                    <VendorDashboardGuard>
                      <VendorDashboard />
                    </VendorDashboardGuard>
                    </ProtectedRoute>
                  }/>
                  
                  <Route path="/product-form" element={
                    <ProtectedRoute>
                      <ProductForm />
                    </ProtectedRoute>
                  }/>
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;