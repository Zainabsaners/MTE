import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tenantAPI, productAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useCart } from '../../contexts/CartContext';

const VendorShop = () => {
  const { vendorSubdomain } = useParams();
  const { addToCart } = useCart();
  
  console.log('Vendor Subdomain:', vendorSubdomain);

  // Reusable styles
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
  };

  const buttonStyles = {
    base: {
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '5px',
      textDecoration: 'none',
      fontWeight: 600,
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    },
    primary: {
      backgroundColor: '#3498db',
      color: 'white',
    },
    secondary: {
      backgroundColor: '#95a5a6',
      color: 'white',
    },
  };

  // Fetch tenant (vendor) data
  const { 
    data: tenantData, 
    isLoading: tenantLoading, 
    error: tenantError,
    isError: tenantIsError
  } = useQuery({
    queryKey: ['tenant', vendorSubdomain],
    queryFn: () => {
      if (!vendorSubdomain) {
        throw new Error('No vendor subdomain provided');
      }
      return tenantAPI.getTenantBySubdomain(vendorSubdomain);
    },
    enabled: !!vendorSubdomain,
    retry: 1,
  });

  // Fetch products with vendor filter
  const { 
    data: productsData, 
    isLoading: productsLoading,
    isError: productsIsError,
    error: productsError
  } = useQuery({
    queryKey: ['vendor-products', vendorSubdomain, tenantData?.data?.id],
    queryFn: async () => {
      console.log(`🔄 Fetching products for vendor: ${vendorSubdomain}`);
      
      // Try multiple approaches to get vendor-specific products
      const endpointsToTry = [
        // 1. Try query parameter with vendor filter (most reliable)
        () => productAPI.getProductsWithVendorFilter(vendorSubdomain),
        // 2. Try by tenant ID if available
        ...(tenantData?.data?.id ? [() => productAPI.getProductsByTenant(tenantData.data.id)] : []),
        // 3. Try by vendor subdomain
        () => productAPI.getProductsByVendorSubdomain(vendorSubdomain),
        // 4. Try the for_vendor endpoint
        () => productAPI.getProductsForVendor(vendorSubdomain),
        // 5. Fallback: get all products and filter on frontend
        async () => {
          const response = await productAPI.getProducts();
          const allProducts = response.data?.results || response.data || [];
          const vendorProducts = allProducts.filter(product => 
            product.tenant_id === tenantData?.data?.id ||
            product.tenant?.id === tenantData?.data?.id ||
            product.vendor_subdomain === vendorSubdomain ||
            product.tenant?.subdomain === vendorSubdomain
          );
          return { 
            data: vendorProducts,
            success: true,
            filtered: true 
          };
        }
      ];

      for (const endpoint of endpointsToTry) {
        try {
          const response = await endpoint();
          console.log('✅ Products loaded successfully:', response.data);
          return response;
        } catch (error) {
          console.log('❌ Endpoint failed, trying next...', error.message);
          continue;
        }
      }
      
      throw new Error('All product fetch methods failed');
    },
    enabled: !!vendorSubdomain && !!tenantData,
  });

  // Proper data extraction
  const tenant = tenantData?.data;
  const productsResponse = productsData?.data;
  const products = productsResponse?.products || productsResponse?.results || productsResponse || [];

  console.log('Tenant Data:', tenant);
  console.log('Products Response:', productsResponse);
  console.log('Products Array:', products);

  // Loading state
  if (tenantLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <LoadingSpinner 
          size="large" 
          text={`Loading ${vendorSubdomain} shop...`} 
        />
      </div>
    );
  }

  // Error state
  if (tenantIsError) {
    console.error('Tenant Error:', tenantError);
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '500px', padding: '2rem' }}>
          <h2 style={{ color: '#e74c3c', fontSize: '2rem', marginBottom: '1rem' }}>
            Shop Not Found
          </h2>
          <p style={{ color: '#7f8c8d', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            The shop "<strong>{vendorSubdomain}</strong>" doesn't exist or is not active.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/" 
              style={{ ...buttonStyles.base, ...buttonStyles.primary }}
            >
              Go Back Home
            </Link>
            <Link 
              to="/products" 
              style={{ ...buttonStyles.base, ...buttonStyles.secondary }}
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Shop Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '3rem 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.1)',
        }}></div>
        
        <div style={containerStyle}>
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '1rem',
              backdropFilter: 'blur(10px)',
            }}>
              Vendor Shop
            </div>
            
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 700,
              marginBottom: '1rem',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            }}>
              {tenant?.name || 'Loading...'}
            </h1>
            
            <p style={{
              fontSize: '1.3rem',
              opacity: 0.9,
              marginBottom: '2rem',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.6,
            }}>
              {tenant?.description || 'Welcome to our online store!'}
            </p>
            
            {/* Shop Metadata */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              flexWrap: 'wrap',
              marginTop: '2rem',
            }}>
              {tenant?.email && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: 500 }}>Email:</span>
                  <span style={{ fontSize: '1rem', fontWeight: 600 }}>{tenant.email}</span>
                </div>
              )}
              
              {tenant?.phone_number && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: 500 }}>Phone:</span>
                  <span style={{ fontSize: '1rem', fontWeight: 600 }}>{tenant.phone_number}</span>
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: 500 }}>Products:</span>
                <span style={{ fontSize: '1rem', fontWeight: 600 }}>{products.length} items</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div style={{ padding: '3rem 0' }}>
        <div style={containerStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}>
            <h2 style={{ color: '#2c3e50', fontSize: '2.2rem', fontWeight: 600 }}>
              Available Products
            </h2>
            
            {products.length > 0 && (
              <div style={{
                background: '#e3f2fd',
                color: '#1976d2',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}>
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </div>
            )}
          </div>

          {/* Products Loading State */}
          {productsLoading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: '2rem' 
            }}>
              <LoadingSpinner text="Loading products..." />
            </div>
          ) : productsIsError ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '40vh',
              textAlign: 'center',
              gap: '1.5rem',
            }}>
              <div style={{ fontSize: '4rem', opacity: 0.5 }}>❌</div>
              <h3 style={{ color: '#e74c3c', fontSize: '1.5rem' }}>
                Failed to Load Products
              </h3>
              <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
                {productsError?.message || 'Unable to load products for this shop.'}
              </p>
              <button 
                onClick={() => window.location.reload()}
                style={{ ...buttonStyles.base, ...buttonStyles.primary }}
              >
                Try Again
              </button>
            </div>
          ) : products.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem',
              marginTop: '2rem',
            }}>
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  vendorSubdomain={vendorSubdomain}
                  addToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1.5rem',
              minHeight: '40vh',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '4rem', opacity: 0.5 }}>📦</div>
              <h3 style={{ color: '#2c3e50', fontSize: '1.5rem' }}>
                No Products Available
              </h3>
              <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
                {tenant?.name} hasn't added any products yet.
              </p>
              <Link 
                to="/products" 
                style={{ ...buttonStyles.base, ...buttonStyles.primary }}
              >
                Browse Other Products
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @media (max-width: 768px) {
            .shop-name {
              font-size: 2.2rem !important;
            }
            .shop-meta {
              flex-direction: column;
              gap: 1rem;
            }
            .section-header {
              flex-direction: column;
              gap: 1rem;
              text-align: center;
            }
            .products-grid {
              grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
              gap: 1.5rem !important;
            }
          }
          @media (max-width: 480px) {
            .products-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
};

// Updated Product Card Component with Real Images for Your Model
const ProductCard = ({ product, vendorSubdomain, addToCart }) => {
  const formatPrice = (price) => {
    const priceValue = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(priceValue);
  };

  // ✅ Function to get product image URL based on your model
  const getProductImage = (product) => {
    // Your model has an 'image' field that stores the image
    const imageField = product.image;
    
    console.log('🖼️ Raw image field:', imageField);
    
    if (imageField) {
      // If it's already a full URL, use it directly
      if (imageField.startsWith('http')) {
        return imageField;
      }
      
      // If it's a relative path, construct the full URL
      // Django typically serves media files from /media/ URL
      if (imageField.startsWith('/')) {
        return `https://ecommerce-backend-xz2q.onrender.com${imageField}`;
      }
      
      // If it's just a filename, construct the full URL
      return `https://ecommerce-backend-xz2q.onrender.com/media/${imageField}`;
    }
    
    return null;
  };

  const productImage = getProductImage(product);
  console.log('🖼️ Final product image URL for', product.name, ':', productImage);

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    border: '1px solid #e9ecef',
    textDecoration: 'none',
    color: 'inherit',
  };

  const imageStyle = {
    position: 'relative',
    height: '200px',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const realImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  };

  const placeholderStyle = {
    fontSize: '4rem',
    opacity: 0.7,
  };

  const outOfStockStyle = {
    position: 'absolute',
    top: '10px',
    left: '10px',
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 600,
    zIndex: 2,
  };

  const infoStyle = {
    padding: '1.5rem',
  };

  const nameStyle = {
    fontSize: '1.3rem',
    fontWeight: 600,
    color: '#2c3e50',
    marginBottom: '0.75rem',
    lineHeight: 1.3,
  };

  const descriptionStyle = {
    color: '#7f8c8d',
    fontSize: '0.95rem',
    lineHeight: 1.5,
    marginBottom: '1rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const priceStyle = {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#2c3e50',
    marginBottom: '1rem',
  };

  const metaStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e9ecef',
  };

  const skuStyle = {
    fontSize: '0.8rem',
    color: '#95a5a6',
    fontFamily: '"Courier New", monospace',
  };

  const stockStyle = {
    fontSize: '0.8rem',
    color: '#27ae60',
    fontWeight: 500,
  };

  const buttonStyle = {
    width: '100%',
    padding: '1rem',
    backgroundColor: product.stock_quantity > 0 ? '#3498db' : '#bdc3c7',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: product.stock_quantity > 0 ? 'pointer' : 'not-allowed',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  };

  const handleAddToCart = () => {
    if (product.stock_quantity > 0) {
      addToCart(product, 1);
      alert(`Added ${product.name} to cart!`);
    }
  };

  const handleImageError = (e) => {
    console.log('❌ Image failed to load, using placeholder');
    e.target.style.display = 'none';
    // Show placeholder by hiding the failed image
  };

  const handleImageLoad = (e) => {
    console.log('✅ Image loaded successfully');
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        
        // Add image zoom effect on hover
        const image = e.currentTarget.querySelector('img');
        if (image && productImage) {
          image.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        
        // Remove image zoom effect
        const image = e.currentTarget.querySelector('img');
        if (image && productImage) {
          image.style.transform = 'scale(1)';
        }
      }}
    >
      <div style={imageStyle}>
        {/* ✅ Real Product Image */}
        {productImage ? (
          <>
            <img 
              src={productImage} 
              alt={product.name}
              style={realImageStyle}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
            {/* Hidden placeholder that shows if image fails */}
            <div style={{...placeholderStyle, display: 'none', position: 'absolute'}}>🛍️</div>
          </>
        ) : (
          /* ✅ Show placeholder if no image exists */
          <div style={placeholderStyle}>🛍️</div>
        )}
        
        {product.stock_quantity === 0 && (
          <div style={outOfStockStyle}>Out of Stock</div>
        )}
      </div>

      <div style={infoStyle}>
        <h3 style={nameStyle}>{product.name}</h3>
        <p style={descriptionStyle}>
          {product.description && product.description.length > 80 
            ? `${product.description.substring(0, 80)}...`
            : product.description || 'No description available'
          }
        </p>
        
        <div style={priceStyle}>
          {formatPrice(product.price)}
        </div>

        <div style={metaStyle}>
          <span style={skuStyle}>
            SKU: {product.sku || `PROD-${product.id}`}
          </span>
          {product.stock_quantity > 0 && (
            <span style={stockStyle}>
              {product.stock_quantity} in stock
            </span>
          )}
        </div>

        <button 
          style={buttonStyle}
          onMouseEnter={(e) => {
            if (product.stock_quantity > 0) {
              e.target.style.backgroundColor = '#2980b9';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (product.stock_quantity > 0) {
              e.target.style.backgroundColor = '#3498db';
              e.target.style.transform = 'translateY(0)';
            }
          }}
          disabled={product.stock_quantity === 0}
          onClick={handleAddToCart}
        >
          {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default VendorShop;