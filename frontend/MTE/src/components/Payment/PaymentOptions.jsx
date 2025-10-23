import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import MpesaPayment from './MpesaPayment';

const PaymentOptions = ({ onBack }) => {
  const { total } = useCart();
  const [selectedOption, setSelectedOption] = useState('');

  const containerStyle = {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
    background: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  };

  const optionStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    margin: '10px 0',
    border: '2px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    background: 'white',
    transition: 'all 0.3s ease'
  };

  const selectedOptionStyle = {
    ...optionStyle,
    borderColor: '#3498db',
    background: '#e3f2fd'
  };

  const buttonStyle = {
    width: '100%',
    padding: '15px',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '20px'
  };

  const backButtonStyle = {
    ...buttonStyle,
    background: '#95a5a6',
    marginTop: '10px'
  };

  // If MPesa is selected, show MPesa payment form
  if (selectedOption === 'mpesa') {
    return <MpesaPayment onBack={() => setSelectedOption('')} />;
  }

  return (
    <div style={containerStyle}>
      <h2>Choose Payment Method</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Total: KES {total}</h3>
      </div>

      {/* MPesa Option */}
      <div 
        style={selectedOption === 'mpesa' ? selectedOptionStyle : optionStyle}
        onClick={() => setSelectedOption('mpesa')}
      >
        <div style={{ marginRight: '15px', fontSize: '24px' }}>📱</div>
        <div>
          <h4 style={{ margin: 0 }}>Pay with MPesa</h4>
          <p style={{ margin: 0, color: '#666' }}>Instant mobile money payment</p>
        </div>
      </div>

      {/* Cash on Delivery Option */}
      <div 
        style={selectedOption === 'cash' ? selectedOptionStyle : optionStyle}
        onClick={() => setSelectedOption('cash')}
      >
        <div style={{ marginRight: '15px', fontSize: '24px' }}>💵</div>
        <div>
          <h4 style={{ margin: 0 }}>Cash on Delivery</h4>
          <p style={{ margin: 0, color: '#666' }}>Pay when you receive your order</p>
        </div>
      </div>

      {/* Bank Transfer Option */}
      <div 
        style={selectedOption === 'bank' ? selectedOptionStyle : optionStyle}
        onClick={() => setSelectedOption('bank')}
      >
        <div style={{ marginRight: '15px', fontSize: '24px' }}>🏦</div>
        <div>
          <h4 style={{ margin: 0 }}>Bank Transfer</h4>
          <p style={{ margin: 0, color: '#666' }}>Transfer money to our bank account</p>
        </div>
      </div>

      {/* Credit Card Option (for future) */}
      <div 
        style={selectedOption === 'card' ? selectedOptionStyle : optionStyle}
        onClick={() => alert('Credit card payments coming soon!')}
      >
        <div style={{ marginRight: '15px', fontSize: '24px' }}>💳</div>
        <div>
          <h4 style={{ margin: 0 }}>Credit/Debit Card</h4>
          <p style={{ margin: 0, color: '#666' }}>Pay with Visa, Mastercard </p>
        </div>
      </div>

      {/* Process Selected Payment */}
      {selectedOption && selectedOption !== 'mpesa' && selectedOption !== 'card' && (
        <button 
          style={buttonStyle}
          onClick={() => {
            if (selectedOption === 'cash') {
              alert('Order placed! You will pay when your order arrives.');
            } else if (selectedOption === 'bank') {
              alert('Bank transfer details:\nAccount: MTE Store\nBank: KCB\nAccount No: 123456789');
            }
          }}
        >
          Complete Order with {selectedOption === 'cash' ? 'Cash on Delivery' : 'Bank Transfer'}
        </button>
      )}

      <button style={backButtonStyle} onClick={onBack}>
        ← Back to Cart
      </button>
    </div>
  );
};

export default PaymentOptions;