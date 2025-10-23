import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import Settings from '../Settings/Settings';

const Header = () => {
  const location = useLocation();
  const isVendorShop = location.pathname.startsWith('/shops/');
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  
  // State for settings dropdown
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // All inline style definitions
  const headerStyle = {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 1rem',
  };

  const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const navStyle = {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
  };

  const linkStyle = (isActive) => ({
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    transition: 'all 0.3s ease',
    fontWeight: 500,
    backgroundColor: isActive ? '#3498db' : 'transparent',
    whiteSpace: 'nowrap',
  });

  const cartStyle = {
    position: 'relative',
    textDecoration: 'none',
    color: 'white',
    padding: '0.5rem',
    borderRadius: '5px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const cartBadgeStyle = {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#e74c3c',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '0.7rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  };

  const authSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginLeft: '1rem',
    paddingLeft: '1rem',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
  };

  const userWelcomeStyle = {
    color: '#ecf0f1',
    fontSize: '0.9rem',
    fontWeight: '500',
  };

  const logoutButtonStyle = {
    background: 'transparent',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
  };

  const authButtonStyle = {
    background: 'transparent',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '0.85rem',
    transition: 'all 0.3s ease',
  };

  const settingsButtonStyle = {
    background: 'transparent',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '0.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
  };

  const settingsDropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    minWidth: '320px',
    zIndex: 1001,
    marginTop: '0.5rem',
  };

  const handleLogout = () => {
    logout();
  };

  const handleMouseEnter = (e) => {
    if (e.target.style) {
      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      e.target.style.transform = 'translateY(-1px)';
    }
  };

  const handleMouseLeave = (e) => {
    if (e.target.style) {
      e.target.style.backgroundColor = 'transparent';
      e.target.style.transform = 'translateY(0)';
    }
  };

  return (
    <header style={headerStyle}>
      <style>
        {`
          @media (max-width: 768px) {
            .header-container {
              flex-direction: column;
              gap: 1rem;
            }
            .header-nav {
              gap: 1rem;
              flex-wrap: wrap;
              justify-content: center;
            }
            .auth-section {
              border-left: none;
              border-top: 1px solid rgba(255, 255, 255, 0.2);
              padding-top: 1rem;
              margin-top: 1rem;
              width: 100%;
              justify-content: center;
            }
            .settings-dropdown {
              position: fixed;
              top: 80px;
              left: 10px;
              right: 10px;
              min-width: auto;
            }
          }
        `}
      </style>
      <div style={containerStyle} className="header-container">
        <Link to="/" style={logoStyle}>
          🛍️ MTE Commerce
        </Link>
        
        <nav style={navStyle} className="header-nav">
          <Link 
            to="/" 
            style={linkStyle(location.pathname === '/')}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            Home
          </Link>
          <Link 
            to="/products" 
            style={linkStyle(location.pathname === '/products')}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            All Products
          </Link>
          <Link 
            to="/shops/techstore" 
            style={linkStyle(isVendorShop)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            Vendor Shops
          </Link>
          
          {/* Cart Link */}
          <Link 
            to="/cart" 
            style={cartStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            🛒 Cart
            {itemCount > 0 && (
              <span style={cartBadgeStyle}>
                {itemCount}
              </span>
            )}
          </Link>

          {/* Authentication Section */}
          <div style={authSectionStyle} className="auth-section">
            {isAuthenticated ? (
              <>
                {/* Vendor Dashboard Link for authenticated users */}
                <Link 
                  to="/vendor-dashboard" 
                  style={linkStyle(location.pathname === '/vendor-dashboard')}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  Dashboard
                </Link>
                
                <span style={userWelcomeStyle}>
                  Hi, {user?.first_name || user?.username}!
                </span>

                {/* Settings Button */}
                <div style={{ position: 'relative' }} ref={settingsRef}>
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    style={settingsButtonStyle}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    title="Settings"
                  >
                    ⚙️
                  </button>
                  
                  {/* Settings Dropdown */}
                  {showSettings && (
                    <div style={settingsDropdownStyle} className="settings-dropdown">
                      <Settings onClose={() => setShowSettings(false)} />
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handleLogout}
                  style={logoutButtonStyle}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  style={authButtonStyle}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  Login
                </Link>
                
                <Link 
                  to="/register" 
                  style={{
                    ...authButtonStyle,
                    background: '#27ae60',
                    border: '1px solid #27ae60',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#219653';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#27ae60';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Register Shop Link - Always visible */}
          <Link 
            to="/register-tenant" 
            style={{
              ...linkStyle(location.pathname === '/register-tenant'),
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Register your shop
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;