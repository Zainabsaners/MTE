import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const Checkout = ({ onBack }) => {
  const { 
    items, 
    total, 
    subtotal, 
    shippingCost, 
    checkout
  } = useCart();
  
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [mpesaNumber, setMpesaNumber] = useState('');
  
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Kenya',
    customerName: '',
    customerEmail: '',
  });

  const countries = [
    'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Ethiopia', 'Nigeria', 'Ghana',
    'South Africa', 'Egypt', 'Morocco', 'United States', 'United Kingdom',
    'Canada', 'Australia', 'Germany', 'France', 'India', 'China', 'Japan',
    'Brazil', 'Mexico', 'Other'
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePayment = async () => {
    if (items.length === 0) return;
    
    if (paymentMethod === 'mpesa' && !mpesaNumber) {
      alert('Please enter your MPesa phone number');
      return;
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.country) {
      alert('Please fill in all required shipping address fields');
      return;
    }

    if (paymentMethod === 'mpesa' && shippingAddress.country === 'Kenya') {
      if (!mpesaNumber.startsWith('254') || mpesaNumber.length !== 12) {
        alert('Please enter a valid MPesa number (format: 2547XXXXXXXX)');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const checkoutResult = await checkout({
        paymentMethod,
        phoneNumber: mpesaNumber,
        shippingAddress,
        amount: total,
        notes: 'Order from multi-tenant ecommerce platform'
      });

      if (!checkoutResult.success) {
        alert(`Checkout failed: ${checkoutResult.message}`);
        return;
      }

      if (paymentMethod === 'cash') {
        navigate('/order-confirmation', { 
          state: { 
            orderId: checkoutResult.orderId,
            orderNumber: checkoutResult.orderNumber,
            paymentMethod: 'cash',
            message: 'Order placed successfully! You will pay on delivery.',
            total: total
          } 
        });
      } 
      else if (paymentMethod === 'mpesa') {
        navigate('/payment-processing', { 
          state: { 
            orderId: checkoutResult.orderId,
            orderNumber: checkoutResult.orderNumber,
            paymentId: checkoutResult.paymentId,
            paymentMethod: 'mpesa',
            amount: total,
            phoneNumber: mpesaNumber
          } 
        });
      }
      else if (paymentMethod === 'card') {
        navigate('/card-payment', { 
          state: { 
            orderId: checkoutResult.orderId,
            orderNumber: checkoutResult.orderNumber,
            amount: total
          } 
        });
      }

    } catch (error) {
      alert(`Payment error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
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
  };

  const inputStyles = {
    base: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #e9ecef',
      borderRadius: '5px',
      fontSize: '1rem',
      fontFamily: 'inherit',
      transition: 'border-color 0.3s ease',
    },
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      padding: '2rem 0',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={onBack}
            style={{ 
              ...buttonStyles.base, 
              ...buttonStyles.secondary,
              marginBottom: '1rem'
            }}
          >
            ← Back to Cart
          </button>
          <h1 style={{ color: '#2c3e50', fontSize: '2.5rem' }}>
            Checkout
          </h1>
        </div>
        
        <div>
  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
    Full Name *
  </label>
  <input
    type="text"
    value={shippingAddress.customerName}
    onChange={(e) => setShippingAddress({...shippingAddress, customerName: e.target.value})}
    style={inputStyles.base}
    placeholder="Your full name"
    required
  />
</div>

<div>
  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
    Email Address *
  </label>
  <input
    type="email"
    value={shippingAddress.customerEmail}
    onChange={(e) => setShippingAddress({...shippingAddress, customerEmail: e.target.value})}
    style={inputStyles.base}
    placeholder="your@email.com"
    required
  />
</div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem',
        }}>
          {/* Left Column - Shipping & Payment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Shipping Address */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}>
              <h2 style={{ color: '#2c3e50', marginBottom: '1.5rem' }}>
                Shipping Address
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                    style={inputStyles.base}
                    placeholder="Enter your street address"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                      style={inputStyles.base}
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                      style={inputStyles.base}
                      placeholder="State or Province"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                      style={inputStyles.base}
                      placeholder="Postal Code"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Country *
                    </label>
                    <select
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                      style={inputStyles.base}
                    >
                      {countries.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Shipping Info */}
                <div style={{
                  padding: '1rem',
                  background: '#e3f2fd',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  color: '#1976d2',
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    🚚 Delivery Information
                  </div>
                  <div>
                    {shippingCost === 0 
                      ? '🎉 FREE shipping applied (Order above KES 1,999)'
                      : `Standard delivery: ${formatPrice(shippingCost)} (Free shipping on orders above KES 1,999)`
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}>
              <h2 style={{ color: '#2c3e50', marginBottom: '1.5rem' }}>
                Payment Method
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* MPesa Option */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="payment"
                      value="mpesa"
                      checked={paymentMethod === 'mpesa'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>MPesa</div>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                        Pay via MPesa STK Push (Kenya only)
                      </div>
                    </div>
                  </label>
                  {paymentMethod === 'mpesa' && (
                    <div style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
                      <input
                        type="tel"
                        placeholder="2547XXXXXXXX"
                        value={mpesaNumber}
                        onChange={(e) => setMpesaNumber(e.target.value)}
                        style={inputStyles.base}
                      />
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                        Enter your MPesa phone number (format: 2547XXXXXXXX)
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Option */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Credit/Debit Card</div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                      Pay with Visa, MasterCard, or American Express (Global)
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery Option */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Cash on Delivery</div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                      Pay when you receive your order (Selected countries)
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            height: 'fit-content',
            position: 'sticky',
            top: '2rem',
          }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '1.5rem' }}>
              Order Summary
            </h2>

            <div style={{ marginBottom: '2rem' }}>
              {items.map((item) => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                      {item.product.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#3498db', marginTop: '0.1rem' }}>
                      {item.vendor}
                    </div>
                  </div>
                  <span style={{ fontWeight: '600', minWidth: '80px', textAlign: 'right' }}>
                    {formatPrice(item.total)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ 
              borderTop: '2px solid #f8f9fa',
              paddingTop: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Shipping:</span>
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
                fontSize: '1.2rem',
                fontWeight: 'bold',
                paddingTop: '1rem',
                borderTop: '1px solid #e9ecef'
              }}>
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing || 
                (paymentMethod === 'mpesa' && !mpesaNumber) || 
                !shippingAddress.street || 
                !shippingAddress.city || 
                !shippingAddress.country ||
                (shippingAddress.country !== 'Kenya' && paymentMethod === 'mpesa')
              }
              style={{
                ...buttonStyles.base,
                ...buttonStyles.primary,
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                opacity: (isProcessing || 
                  (paymentMethod === 'mpesa' && !mpesaNumber) || 
                  !shippingAddress.street || 
                  !shippingAddress.city || 
                  !shippingAddress.country ||
                  (shippingAddress.country !== 'Kenya' && paymentMethod === 'mpesa')
                ) ? 0.7 : 1,
                cursor: (isProcessing || 
                  (paymentMethod === 'mpesa' && !mpesaNumber) || 
                  !shippingAddress.street || 
                  !shippingAddress.city || 
                  !shippingAddress.country ||
                  (shippingAddress.country !== 'Kenya' && paymentMethod === 'mpesa')
                ) ? 'not-allowed' : 'pointer',
              }}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="small" text="" />
                  <span style={{ marginLeft: '0.5rem' }}>
                    {paymentMethod === 'cash' ? 'Placing Order...' : 'Processing...'}
                  </span>
                </>
              ) : (
                paymentMethod === 'cash' ? `Place Order` : `Pay ${formatPrice(total)}`
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;