import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VendorDashboardGuard = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useAuth();
  const [hasStore, setHasStore] = useState(null);
  
  useEffect(() => {
    const checkStoreAccess = async () => {
      if (!loading && isAuthenticated) {
        try {
          const token = localStorage.getItem('access_token');
          const response = await fetch(
            'https://ecommerce-backend-xz2q.onrender.com/api/tenants/my-store/', 
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
          if (response.ok) {
            const storeData = await response.json();
            // If API returns any store data, user is a vendor
            const userHasStore = storeData && 
              (Array.isArray(storeData) ? storeData.length > 0 : 
               Object.keys(storeData).length > 0);
            
            setHasStore(userHasStore);
            
            if (!userHasStore) {
              console.log('❌ No store found for user');
              navigate('/');
            }
          } else {
            console.log('❌ Cannot check store access');
            navigate('/');
          }
        } catch (error) {
          console.error('Error checking store:', error);
          navigate('/');
        }
      } else if (!loading && !isAuthenticated) {
        navigate('/login');
      }
    };
    
    checkStoreAccess();
  }, [isAuthenticated, loading, navigate]);
  
  if (loading || hasStore === null) {
    return <div>Checking access...</div>;
  }
  
  if (!isAuthenticated || !hasStore) {
    return null;
  }
  
  return children;
};

export default VendorDashboardGuard;