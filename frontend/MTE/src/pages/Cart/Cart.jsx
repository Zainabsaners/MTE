import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import Checkout from '../../components/Checkout/Checkout';

const Cart = () => {
  const { 
    items, 
    subtotal,
    shippingCost,
    total, 
    itemCount, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();
  
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

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
    danger: {
      backgroundColor: '#e74c3c',
      color: 'white',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#3498db',
      border: '2px solid #3498db',
    },
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    try {
      updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Quantity update error:', error);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsCheckingOut(true);

    try {
      setShowCheckout(true);
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // If showing checkout component, render it
  if (showCheckout) {
    return <Checkout onBack={() => setShowCheckout(false)} />;
  }

  if (items.length === 0) {
    return (
      <div style={{ 
        minHeight: '60vh', 
        backgroundColor: '#f8f9fa',
        padding: '3rem 0',
      }}>
        <div style={containerStyle}>
          <div style={{
            textAlign: 'center',
            background: 'white',
            padding: '4rem 2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{ fontSize: '4rem', opacity: 0.5, marginBottom: '1.5rem' }}>🛒</div>
            <h1 style={{ 
              color: '#2c3e50', 
              fontSize: '2.5rem', 
              marginBottom: '1rem' 
            }}>
              Your Cart is Empty
            </h1>
            <p style={{ 
              color: '#7f8c8d', 
              fontSize: '1.2rem',
              marginBottom: '2rem',
            }}>
              Add some products to get started!
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link 
                to="/products" 
                style={{ ...buttonStyles.base, ...buttonStyles.primary }}
              >
                Browse Products
              </Link>
              <Link 
                to="/" 
                style={{ ...buttonStyles.base, ...buttonStyles.outline }}
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      padding: '2rem 0',
    }}>
      <div style={containerStyle}>
        {/* Page Header */}
        <div style={{ 
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <h1 style={{ 
              color: '#2c3e50', 
              fontSize: '2.5rem', 
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}>
              Shopping Cart
            </h1>
            <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
              {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          
          <button
            onClick={handleClearCart}
            style={{ ...buttonStyles.base, ...buttonStyles.danger }}
          >
            Clear Cart
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '2rem',
          alignItems: 'start',
        }}>
          {/* Cart Items */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}>
            <h2 style={{ 
              color: '#2c3e50', 
              fontSize: '1.5rem',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #f8f9fa',
            }}>
              Cart Items
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {items.map((item) => (
                <CartItem 
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            position: 'sticky',
            top: '2rem',
          }}>
            <h2 style={{ 
              color: '#2c3e50', 
              fontSize: '1.5rem',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #f8f9fa',
            }}>
              Order Summary
            </h2>

            {/* Free Shipping Notice */}
            {subtotal < 1999 && (
              <div style={{
                padding: '1rem',
                background: '#e8f5e8',
                border: '1px solid #4caf50',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                textAlign: 'center',
              }}>
                <div style={{ fontWeight: '600', color: '#2e7d32', marginBottom: '0.25rem' }}>
                  🚚 Free Shipping Available!
                </div>
                <div style={{ fontSize: '0.9rem', color: '#388e3c' }}>
                  Add {formatPrice(1999 - subtotal)} more to get free shipping
                </div>
              </div>
            )}

            {subtotal >= 1999 && (
              <div style={{
                padding: '1rem',
                background: '#4caf50',
                color: 'white',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                textAlign: 'center',
                fontWeight: '600',
              }}>
                🎉 You qualify for FREE shipping!
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#7f8c8d' }}>Items ({itemCount}):</span>
                <span style={{ fontWeight: 600, color: '#2c3e50' }}>{formatPrice(subtotal)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#7f8c8d' }}>Shipping:</span>
                <span style={{ 
                  fontWeight: 600, 
                  color: shippingCost > 0 ? '#2c3e50' : '#27ae60',
                  textDecoration: shippingCost === 0 ? 'line-through' : 'none'
                }}>
                  {shippingCost > 0 ? formatPrice(shippingCost) : 'Free'}
                </span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '2px solid #f8f9fa',
                fontSize: '1.2rem',
              }}>
                <span style={{ color: '#2c3e50', fontWeight: 700 }}>Total:</span>
                <span style={{ fontWeight: 700, color: '#2c3e50', fontSize: '1.4rem' }}>
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              style={{
                ...buttonStyles.base,
                ...buttonStyles.primary,
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                opacity: isCheckingOut ? 0.7 : 1,
                cursor: isCheckingOut ? 'not-allowed' : 'pointer',
              }}
            >
              {isCheckingOut ? (
                <>
                  <LoadingSpinner size="small" text="" />
                  <span style={{ marginLeft: '0.5rem' }}>Processing...</span>
                </>
              ) : (
                `Proceed to checkout - ${formatPrice(total)}`
              )}
            </button>

            <div style={{ 
              marginTop: '1rem', 
              textAlign: 'center',
              fontSize: '0.9rem',
              color: '#7f8c8d',
            }}>
              {shippingCost === 0 ? '🎉 Free shipping applied!' : 'Standard delivery within 2-3 days'}
            </div>

            <div style={{ 
              marginTop: '2rem', 
              paddingTop: '1.5rem',
              borderTop: '1px solid #e9ecef',
            }}>
              <Link 
                to="/products" 
                style={{ 
                  ...buttonStyles.base, 
                  ...buttonStyles.outline,
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cart Item Component
const CartItem = ({ item, onQuantityChange, onRemove, formatPrice }) => {
  const quantityStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const quantityButtonStyle = {
    width: '32px',
    height: '32px',
    border: '1px solid #ddd',
    background: 'white',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  };

  const quantityInputStyle = {
    width: '50px',
    height: '32px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    textAlign: 'center',
    fontSize: '1rem',
    fontWeight: '600',
  };

  const getProductImage = () => {
    const imageSources = [
      item.product?.image,
      item.image,
      item.product?.image_url,
      item.product?.thumbnail,
    ];

    const validImage = imageSources.find(src => 
      src && typeof src === 'string' && src.trim() !== ''
    );

    return validImage || null;
  };

  const productImage = getProductImage();
  const fallbackImage = '🛍️';

  return (
    <div style={{
      display: 'flex',
      gap: '1.5rem',
      padding: '1.5rem',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
    }}>
      {/* Product Image */}
      <div style={{
        width: '100px',
        height: '100px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {productImage ? (
          <img 
            src={productImage} 
            alt={item.product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              console.warn(`Image failed to load: ${productImage}`);
              e.target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                opacity: 0.7;
              `;
              fallback.textContent = fallbackImage;
              e.target.parentNode.appendChild(fallback);
            }}
          />
        ) : (
          <div style={{ fontSize: '2rem', opacity: 0.7 }}>
            {fallbackImage}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div style={{ flex: 1 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '0.5rem',
        }}>
          <div>
            <h3 style={{ 
              fontSize: '1.2rem', 
              fontWeight: 600, 
              color: '#2c3e50',
              marginBottom: '0.25rem',
            }}>
              {item.product.name}
            </h3>
            <p style={{ 
              fontSize: '0.9rem', 
              color: '#3498db',
              marginBottom: '0.5rem',
              fontWeight: '500',
            }}>
              Vendor: {item.vendor}
            </p>
            <p style={{ 
              fontSize: '0.8rem', 
              color: '#95a5a6',
              fontFamily: '"Courier New", monospace',
            }}>
              SKU: {item.product.sku}
            </p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: '1.3rem', 
              fontWeight: 700, 
              color: '#2c3e50',
              marginBottom: '0.5rem',
            }}>
              {formatPrice(item.total)}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
              {formatPrice(item.price)} each
            </div>
          </div>
        </div>

        {/* Quantity Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1rem',
        }}>
          <div style={quantityStyle}>
            <button
              style={quantityButtonStyle}
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              -
            </button>
            
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => onQuantityChange(item.id, parseInt(e.target.value) || 1)}
              min="1"
              max={item.product.stock_quantity}
              style={quantityInputStyle}
            />
            
            <button
              style={quantityButtonStyle}
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.product.stock_quantity}
            >
              +
            </button>
            
            <span style={{ fontSize: '0.9rem', color: '#7f8c8d', marginLeft: '1rem' }}>
              Max: {item.product.stock_quantity}
            </span>
          </div>

          <button
            onClick={() => onRemove(item.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#e74c3c',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              padding: '0.5rem',
              borderRadius: '4px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#fdf2f2';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
            }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;