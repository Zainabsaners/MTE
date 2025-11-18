import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useCart } from '../../contexts/CartContext';

const Products = () => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
  });

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
      fontFamily: 'inherit',
    },
    primary: {
      backgroundColor: '#3498db',
      color: 'white',
    },
    secondary: {
      backgroundColor: '#95a5a6',
      color: 'white',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#3498db',
      border: '2px solid #3498db',
    },
  };

  const inputStyles = {
    base: {
      padding: '0.75rem',
      border: '2px solid #e9ecef',
      borderRadius: '5px',
      fontSize: '1rem',
      fontFamily: 'inherit',
      transition: 'border-color 0.3s ease',
    },
    focus: {
      borderColor: '#3498db',
      outline: 'none',
    },
  };

  // Fetch products with filters
  const { 
    data: productsData, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ['all-products', filters],
    queryFn: () => productAPI.getProducts(filters),
  });

  const products = productsData?.data?.results || productsData?.data || [];

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.inStock;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      padding: '2rem 0',
    }}>
      <div style={containerStyle}>
        {/* Page Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '3rem' 
        }}>
          <h1 style={{ 
            color: '#2c3e50', 
            fontSize: '2.5rem', 
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}>
            All Products
          </h1>
          <p style={{ 
            color: '#7f8c8d', 
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Browse products from all our vendors in one place
          </p>
        </div>

        {/* Filters Section */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            alignItems: 'end',
          }}>
            {/* Search Input */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                color: '#2c3e50',
                fontSize: '0.9rem',
              }}>
                Search Products
              </label>
              <input
                type="text"
                placeholder="Product name, description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                style={inputStyles.base}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3498db';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e9ecef';
                }}
              />
            </div>

            {/* Price Range */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                color: '#2c3e50',
                fontSize: '0.9rem',
              }}>
                Price Range
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  style={{ ...inputStyles.base, flex: 1 }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3498db';
                    e.target.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  style={{ ...inputStyles.base, flex: 1 }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3498db';
                    e.target.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                  }}
                />
              </div>
            </div>

            {/* Stock Filter */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#2c3e50',
                fontSize: '0.9rem',
              }}>
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                  }}
                />
                In Stock Only
              </label>
            </div>

            {/* Clear Filters Button */}
            <div>
              <button
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                style={{
                  ...buttonStyles.base,
                  ...buttonStyles.secondary,
                  opacity: hasActiveFilters ? 1 : 0.5,
                  cursor: hasActiveFilters ? 'pointer' : 'not-allowed',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  if (hasActiveFilters) {
                    e.target.style.backgroundColor = '#7f8c8d';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (hasActiveFilters) {
                    e.target.style.backgroundColor = '#95a5a6';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Active Filters Badge */}
          {hasActiveFilters && (
            <div style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#e3f2fd',
              color: '#1976d2',
              borderRadius: '20px',
              fontSize: '0.9rem',
              display: 'inline-block',
            }}>
              Active filters: {[
                filters.search && 'Search',
                filters.minPrice && 'Min price',
                filters.maxPrice && 'Max price',
                filters.inStock && 'In stock',
              ].filter(Boolean).join(', ')}
            </div>
          )}
        </div>

        {/* Results Count */}
        {!isLoading && (
          <div style={{
            color: '#7f8c8d',
            marginBottom: '1rem',
            fontStyle: 'italic',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>
              Showing {products.length} product{products.length !== 1 ? 's' : ''}
              {hasActiveFilters && ' (filtered)'}
            </span>
            
            {products.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '0.9rem' }}>Sort by:</span>
                <select 
                  style={{
                    ...inputStyles.base,
                    padding: '0.5rem',
                    fontSize: '0.9rem',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3498db';
                    e.target.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                  }}
                >
                  <option value="name">Name A-Z</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '40vh' 
          }}>
            <LoadingSpinner text="Loading products..." />
          </div>
        ) : isError ? (
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
              {error?.message || 'Unable to load products. Please try again.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ ...buttonStyles.base, ...buttonStyles.primary }}
            >
              Retry
            </button>
          </div>
        ) : products.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '40vh',
            textAlign: 'center',
            gap: '1.5rem',
          }}>
            <div style={{ fontSize: '4rem', opacity: 0.5 }}>🔍</div>
            <h3 style={{ color: '#2c3e50', fontSize: '1.5rem' }}>
              No Products Found
            </h3>
            <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
              {hasActiveFilters 
                ? 'Try adjusting your search filters.' 
                : 'No products are available at the moment.'
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{ ...buttonStyles.base, ...buttonStyles.primary }}
              >
                Clear All Filters
              </button>
            )}
            <Link 
              to="/" 
              style={{ ...buttonStyles.base, ...buttonStyles.outline }}
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>

      <style>
        {`
          @media (max-width: 768px) {
            .filters-grid {
              grid-template-columns: 1fr !important;
            }
            .products-grid {
              grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
              gap: 1.5rem !important;
            }
            .results-header {
              flex-direction: column;
              gap: 1rem;
              align-items: flex-start !important;
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

// Enhanced Product Card Component with proper image handling
const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    border: '1px solid #e9ecef',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  };

  const imageContainerStyle = {
    position: 'relative',
    height: '200px',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  };

  const badgeStyle = (type) => ({
    position: 'absolute',
    top: '10px',
    left: type === 'vendor' ? '10px' : 'auto',
    right: type === 'sale' ? '10px' : 'auto',
    background: type === 'vendor' ? '#3498db' : '#e74c3c',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    zIndex: 2,
  });

  const outOfStockStyle = {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: '#e74c3c',
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
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#2c3e50',
    marginBottom: '0.5rem',
    lineHeight: 1.3,
  };

  const vendorStyle = {
    fontSize: '0.9rem',
    color: '#3498db',
    fontWeight: 500,
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const descriptionStyle = {
    color: '#7f8c8d',
    fontSize: '0.9rem',
    lineHeight: 1.5,
    marginBottom: '1rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  const pricingStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  };

  const priceStyle = {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#2c3e50',
  };

  const originalPriceStyle = {
    fontSize: '1rem',
    color: '#95a5a6',
    textDecoration: 'line-through',
  };

  const discountStyle = {
    background: '#2ecc71',
    color: 'white',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 600,
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

  const stockStyle = (quantity) => ({
    fontSize: '0.8rem',
    color: quantity > 0 ? '#27ae60' : '#e74c3c',
    fontWeight: 500,
  });

  const buttonStyle = (disabled) => ({
    width: '100%',
    padding: '0.875rem',
    background: disabled ? '#bdc3c7' : '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  });

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock_quantity > 0) {
      addToCart(product, 1);
     // alert(`Added ${product.name} to cart!`);
    }
  };

  const isOnSale = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = isOnSale 
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  // Enhanced image handling - check multiple possible image fields
  const getProductImage = () => {
    // Check various possible image fields in order of priority
    const imageSources = [
      product.image, // Direct image field
      product.image_url, // image_url field
      product.thumbnail, // thumbnail field
      product.images?.[0]?.image, // First image in images array
      product.images?.[0]?.image_url, // First image_url in images array
      product.product_images?.[0]?.image, // First product image
      product.product_images?.[0]?.image_url, // First product image URL
    ];

    // Find the first valid image source
    const validImage = imageSources.find(src => 
      src && typeof src === 'string' && src.trim() !== ''
    );

    return validImage || null;
  };

  const productImage = getProductImage();
  const fallbackImage = '🛍️'; // Fallback emoji if no image

  return (
    <Link 
      to={`/shops/${product.tenant?.subdomain}`}
      style={cardStyle}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-5px)';
        e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        
        // Add image zoom effect on hover
        const image = e.target.querySelector('.product-image');
        if (image && productImage) {
          image.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        
        // Reset image zoom
        const image = e.target.querySelector('.product-image');
        if (image && productImage) {
          image.style.transform = 'scale(1)';
        }
      }}
    >
      <div style={imageContainerStyle}>
        {productImage ? (
          // Display actual product image
          <img 
            src={productImage} 
            alt={product.name}
            style={imageStyle}
            className="product-image"
            onError={(e) => {
              // If image fails to load, show fallback
              console.warn(`Image failed to load: ${productImage}`);
              e.target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.style.cssText = `
                font-size: 3.5rem;
                opacity: 0.7;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
              `;
              fallback.textContent = fallbackImage;
              e.target.parentNode.appendChild(fallback);
            }}
            onLoad={(e) => {
              console.log(`Image loaded successfully: ${productImage}`);
            }}
          />
        ) : (
          // Fallback to emoji if no image
          <div style={{ fontSize: '3.5rem', opacity: 0.7 }}>
            {fallbackImage}
          </div>
        )}
        
        {/* Vendor Badge */}
        {product.tenant?.name && (
          <div style={badgeStyle('vendor')}>
            {product.tenant.name}
          </div>
        )}
        
        {/* Sale Badge */}
        {isOnSale && (
          <div style={badgeStyle('sale')}>
            Sale {discountPercent}%
          </div>
        )}
        
        {/* Out of Stock Badge */}
        {product.stock_quantity === 0 && (
          <div style={outOfStockStyle}>Out of Stock</div>
        )}
      </div>

      <div style={infoStyle}>
        <h3 style={nameStyle}>{product.name}</h3>
        
        {product.tenant?.name && (
          <div style={vendorStyle}>
            <span>🏪</span>
            {product.tenant.name}
          </div>
        )}
        
        <p style={descriptionStyle}>
          {product.description && product.description.length > 100 
            ? `${product.description.substring(0, 100)}...`
            : product.description || 'No description available'
          }
        </p>
        
        <div style={pricingStyle}>
          <span style={priceStyle}>
            {formatPrice(product.price)}
          </span>
          
          {isOnSale && (
            <>
              <span style={originalPriceStyle}>
                {formatPrice(product.compare_at_price)}
              </span>
              <span style={discountStyle}>
                Save {discountPercent}%
              </span>
            </>
          )}
        </div>

        <div style={metaStyle}>
          <span style={skuStyle}>SKU: {product.sku}</span>
          <span style={stockStyle(product.stock_quantity)}>
            {product.stock_quantity > 0 
              ? `${product.stock_quantity} in stock`
              : 'Out of stock'
            }
          </span>
        </div>

        <button 
          style={buttonStyle(product.stock_quantity === 0)}
          onMouseEnter={(e) => {
            if (product.stock_quantity > 0) {
              e.target.style.background = '#2980b9';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (product.stock_quantity > 0) {
              e.target.style.background = '#3498db';
              e.target.style.transform = 'translateY(0)';
            }
          }}
          disabled={product.stock_quantity === 0}
          onClick={handleAddToCart}
        >
          {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </Link>
  );
};

export default Products;