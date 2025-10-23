import React from "react";
import {Link} from "react-router-dom";

const Home = () => {
    const buttonStyles = {
        base:{
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '8px',
            textDecoration: 'none',
            fontweight: 600,
            fontSize: '1.1rem',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '160px',
            cursor: 'pointer',
        },
        primary: {
            backgroundColor: '#e74c3c',
            color: 'white',
        },
        secondary:{
            backgroundColor: 'transparent',
            color: 'white',
            border: '2px solid white',
        },
    };
    const heroStyle = {
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%',
        color: 'white',
        padding: '6rem 0',
        textAlign: 'center',
    };
    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
    };
    const heroContentStyle = {
        fontSize: '3.5rem',
        fontWeight: 700,
        marginBottom: '1.5rem',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',

    };
    const heroTitleStyle = {
    fontSize: '3.5rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    };

    const heroSubtitleStyle ={
        fontSize:'1.3rem',
        marginBottom: '2.5rem',
        opacity: 0.9,
        lineHeight: 1.6,
    };
    const heroButtonsStyle = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  };

  const featuresStyle = {
    padding: '5rem 0',
    backgroundColor: '#f8f9fa',
  };

  const featuresTitleStyle = {
    textAlign: 'center',
    fontSize: '2.5rem',
    marginBottom: '3rem',
    color: '#2c3e50',
  };

  const featuresGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const featureCardStyle = {
    background: 'white',
    padding: '2.5rem 2rem',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  const featureIconStyle = {
    fontSize: '3rem',
    marginBottom: '1.5rem',
  };

  const featureTitleStyle = {
    color: '#2c3e50',
    marginBottom: '1rem',
    fontSize: '1.4rem',
  };

  const featureTextStyle = {
    color: '#7f8c8d',
    lineHeight: 1.6,
  };

  const vendorShowcaseStyle = {
    padding: '5rem 0',
    background: 'white',
  };

  const vendorGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
  };

  const vendorCardStyle = {
    background: '#f8f9fa',
    padding: '2.5rem 2rem',
    borderRadius: '12px',
    textAlign: 'center',
    textDecoration: 'none',
    color: 'inherit',
    border: '2px solid transparent',
    transition: 'all 0.3s ease',
  };

  const vendorIconStyle = {
    fontSize: '3rem',
    marginBottom: '1.5rem',
  };

  const shopLinkStyle = {
    color: '#3498db',
    fontWeight: 600,
    transition: 'color 0.3s ease',
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={heroStyle}>
        <div style={containerStyle}>
          <div style={heroContentStyle}>
            <h1 style={heroTitleStyle}>Multi-Tenant ECommerce Platform</h1>
            <p style={heroSubtitleStyle}>
              Start your own online store or shop from multiple vendors in one marketplace
            </p>
            <div style={heroButtonsStyle}>
              <Link 
                to="/shops/techstore" 
                style={{ ...buttonStyles.base, ...buttonStyles.primary }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#c0392b';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(231, 76, 60, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#e74c3c';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Visit Tech Store
              </Link>
              <Link 
                to="/products" 
                style={{ ...buttonStyles.base, ...buttonStyles.secondary }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = '#333';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Browse All Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={featuresStyle}>
        <div style={containerStyle}>
          <h2 style={featuresTitleStyle}>Why Choose Our Platform?</h2>
          <div style={featuresGridStyle}>
            {[
              { icon: '🛍️', title: 'Multiple Vendors', text: 'Shop from various independent vendors all in one marketplace' },
              { icon: '🚀', title: 'Easy Setup', text: 'Start your own shop in minutes with our vendor dashboard' },
              { icon: '💳', title: 'MPesa Integration', text: 'Secure and convenient payments with MPesa mobile money' },
              { icon: '🔒', title: 'Secure Platform', text: 'Your data and transactions are protected with enterprise security' },
            ].map((feature, index) => (
              <div 
                key={index}
                style={featureCardStyle}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={featureIconStyle}>{feature.icon}</div>
                <h3 style={featureTitleStyle}>{feature.title}</h3>
                <p style={featureTextStyle}>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor Showcase */}
      <section style={vendorShowcaseStyle}>
        <div style={containerStyle}>
          <h2 style={featuresTitleStyle}>Featured Vendor Shops</h2>
          <div style={vendorGridStyle}>
            {[
              { to: '/shops/techstore', icon: '💻', title: 'Tech Store', text: 'Electronics, gadgets, and tech accessories' },
              { to: '/shops/fashion', icon: '👕', title: 'Fashion Store', text: 'Trendy clothing and fashion items' },
            ].map((vendor, index) => (
              <Link
                key={index}
                to={vendor.to}
                style={vendorCardStyle}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#3498db';
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'transparent';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={vendorIconStyle}>{vendor.icon}</div>
                <h3 style={featureTitleStyle}>{vendor.title}</h3>
                <p style={{ ...featureTextStyle, marginBottom: '1.5rem' }}>{vendor.text}</p>
                <span style={shopLinkStyle}>Visit Shop →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style>
        {`
          @media (max-width: 768px) {
            .hero-title {
              font-size: 2.5rem !important;
            }
            .hero-subtitle {
              font-size: 1.1rem !important;
            }
            .hero-buttons {
              flex-direction: column;
              align-items: center;
            }
            .hero-button {
              width: 100%;
              max-width: 300px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Home;
