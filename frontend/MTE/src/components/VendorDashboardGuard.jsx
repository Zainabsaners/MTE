// VendorDashboardGuard.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VendorDashboardGuard = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        console.log('❌ Not authenticated, redirecting to login');
        navigate('/login');
      } else if (user?.user_type !== 'vendor') {
        console.log('❌ User is not a vendor:', user?.user_type);
        navigate('/'); // Redirect non-vendors to home
      }
    }
  }, [isAuthenticated, loading, user, navigate]);
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Checking authentication...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  if (!isAuthenticated || user?.user_type !== 'vendor') {
    return null; // Will redirect in useEffect
  }
  
  return children;
};

export default VendorDashboardGuard;