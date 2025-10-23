import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { paymentService } from '../../services/paymentService';

const MpesaPayment = ({ onBack }) => {
  const { items, total, clearCart } = useCart();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [currentPayment, setCurrentPayment] = useState(null);

  // Container styles
  const containerStyle = {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
    background: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  };

  // Summary styles
  const summaryStyle = {
    background: 'white',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px'
  };

  const itemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee'
  };

  const totalStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '10px',
    borderTop: '2px solid #333',
    fontSize: '1.2em'
  };

  // Form styles
  const formStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '6px'
  };

  const formGroupStyle = {
    marginBottom: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  };

  const disabledInputStyle = {
    ...inputStyle,
    backgroundColor: '#f5f5f5'
  };

  const smallTextStyle = {
    color: '#666',
    fontSize: '0.9em'
  };

  // Button styles
  const buttonStyle = {
    width: '100%',
    padding: '15px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background 0.3s'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    background: '#6c757d',
    cursor: 'not-allowed'
  };

  const backButtonStyle = {
    ...buttonStyle,
    background: '#6c757d',
    marginBottom: '10px'
  };

  // Status styles
  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: '10px',
      borderRadius: '4px',
      marginBottom: '15px',
      textAlign: 'center'
    };

    switch (status.split(':')[0]) {
      case 'success':
        return {
          ...baseStyle,
          background: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb'
        };
      case 'error':
        return {
          ...baseStyle,
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb'
        };
      case 'processing':
        return {
          ...baseStyle,
          background: '#cce7ff',
          color: '#004085',
          border: '1px solid #b3d7ff'
        };
      default:
        return baseStyle;
    }
  };

  // Info styles
  const infoStyle = {
    background: '#e7f3ff',
    padding: '10px',
    borderRadius: '4px',
    marginTop: '15px',
    textAlign: 'center'
  };

  const infoTextStyle = {
    margin: '5px 0',
    color: '#004085'
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    // Auto-format to Kenyan format
    if (value.startsWith('0') && value.length === 10) {
      setPhoneNumber('254' + value.slice(1));
    } else {
      setPhoneNumber(value);
    }
  };

  const validatePhoneNumber = (number) => {
    const regex = /^(?:254|\+254|0)?(7[0-9]{8})$/;
    return regex.test(number);
  };

  const initiatePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setPaymentStatus('error: Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }

    if (items.length === 0) {
      setPaymentStatus('error: Your cart is empty');
      return;
    }

    setLoading(true);
    setPaymentStatus('processing: Initiating payment...');

    try {
      // In a real app, you would create an order first, then pay
      // For now, we'll simulate order creation
      const orderData = {
        items: items,
        total: total,
        status: 'pending'
      };

      // Simulate order creation (you'll replace this with actual order API)
      const simulatedOrderId = 'order-' + Date.now();
      
      // Initiate Mpesa payment
      const response = await paymentService.initiateMpesaPayment(
        simulatedOrderId,
        phoneNumber
      );

      if (response.data.success) {
        setCurrentPayment({
          id: response.data.payment_id,
          checkoutRequestId: response.data.checkout_request_id
        });
        setPaymentStatus('success: Payment initiated! Check your phone for STK push.');
        
        // Start polling for payment status
        pollPaymentStatus(response.data.payment_id);
      } else {
        setPaymentStatus('error: ' + (response.data.error || 'Payment initiation failed'));
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error: ' + (error.response?.data?.error || 'Payment failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (paymentId) => {
    try {
      setPaymentStatus('processing: Waiting for payment confirmation...');
      
      const result = await paymentService.pollPaymentStatus(paymentId);
      
      if (result.success) {
        setPaymentStatus('success: Payment completed successfully!');
        // Clear cart on successful payment
        setTimeout(() => {
          clearCart();
        }, 2000);
      } else {
        setPaymentStatus('error: ' + result.error);
      }
    } catch (error) {
      setPaymentStatus('error: Failed to verify payment status');
    }
  };

  const formatPhoneDisplay = (number) => {
    if (number.startsWith('254') && number.length === 12) {
      return '0' + number.slice(3);
    }
    return number;
  };

  return (
    <div style={containerStyle}>
      <h2>Mpesa Payment</h2>
      
      {onBack && (
        <button 
          onClick={onBack}
          style={backButtonStyle}
          disabled={loading}
        >
          ← Back to Cart
        </button>
      )}
      
      <div style={summaryStyle}>
        <h3>Order Summary</h3>
        {items.map(item => (
          <div key={item.id} style={itemStyle}>
            <span>{item.product.name} x {item.quantity}</span>
            <span>KES {item.total}</span>
          </div>
        ))}
        <div style={totalStyle}>
          <strong>Total: KES {total}</strong>
        </div>
      </div>

      <div style={formStyle}>
        <div style={formGroupStyle}>
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            placeholder="e.g., 0712345678"
            value={formatPhoneDisplay(phoneNumber)}
            onChange={handlePhoneNumberChange}
            disabled={loading || currentPayment}
            style={loading || currentPayment ? disabledInputStyle : inputStyle}
          />
          <small style={smallTextStyle}>Enter your Mpesa registered phone number</small>
        </div>

        {paymentStatus && (
          <div style={getStatusStyle(paymentStatus)}>
            {paymentStatus.split(':')[1]}
          </div>
        )}

        <button
          onClick={initiatePayment}
          disabled={loading || !phoneNumber || currentPayment}
          style={loading || !phoneNumber || currentPayment ? disabledButtonStyle : buttonStyle}
        >
          {loading ? 'Processing...' : `Pay KES ${total}`}
        </button>

        {currentPayment && (
          <div style={infoStyle}>
            <p style={infoTextStyle}>Payment ID: {currentPayment.id}</p>
            <p style={infoTextStyle}>Check your phone to complete payment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MpesaPayment;