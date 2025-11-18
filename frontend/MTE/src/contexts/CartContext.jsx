import React, { createContext, useContext, useReducer } from 'react';
import { paymentService } from '../services/paymentService';
import api from '../services/api';

// Simplified shipping calculation like Kilimall
const calculateShippingCost = (items, subtotal) => {
  if (!items || items.length === 0) return 0;
  
  // Free shipping for orders above 1999 KES
  if (subtotal >= 1999) {
    return 0;
  }
  
  // Standard delivery fee for orders below 1999 KES
  return 199; // Standard Kilimall-like fee
};

// Create cart item
const createCartItem = (product, quantity = 1) => {
  const vendorName = product.tenant?.name || 
                    product.vendor?.name || 
                    product.tenant_name || 
                    'Vendor';
  
  const vendorId = product.vendor || product.tenant?.id;

  return {
    id: product.id,
    product: {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price) || 0,
      compare_at_price: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
      stock_quantity: product.stock_quantity || 0,
      sku: product.sku,
      description: product.description,
      image: product.image || product.image_url,
      tenant: product.tenant,
      vendor: product.vendor,
    },
    quantity,
    price: parseFloat(product.price) || 0,
    total: (parseFloat(product.price) || 0) * quantity,
    vendor: vendorName,
    vendorId: vendorId,
    vendorSubdomain: product.tenant?.subdomain,
  };
};

// Cart actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  SET_ORDER_DETAILS: 'SET_ORDER_DETAILS',
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM:
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { 
                ...item, 
                quantity: item.quantity + action.payload.quantity,
                total: (item.quantity + action.payload.quantity) * item.price
              }
            : item
        );
        
        return {
          ...state,
          items: updatedItems,
        };
      } else {
        const newItems = [...state.items, createCartItem(action.payload, action.payload.quantity)];
        return {
          ...state,
          items: newItems,
        };
      }

    case CART_ACTIONS.REMOVE_ITEM:
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      const updatedQuantityItems = state.items.map(item =>
        item.id === action.payload.id
          ? { 
              ...item, 
              quantity: action.payload.quantity,
              total: action.payload.quantity * item.price
            }
          : item
      );
      return {
        ...state,
        items: updatedQuantityItems,
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        items: [],
        total: 0,
        itemCount: 0,
        shippingCost: 0,
        orderDetails: null,
      };

    case CART_ACTIONS.SET_ORDER_DETAILS:
      return {
        ...state,
        orderDetails: action.payload,
      };

    default:
      return state;
  }
};

// Calculate cart totals including shipping
const calculateTotals = (items) => {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.total, 0);
  const shippingCost = calculateShippingCost(items, subtotal);
  const total = subtotal + shippingCost;
  
  return { 
    itemCount, 
    subtotal,
    shippingCost,
    total 
  };
};

// Initial state
const initialState = {
  items: [],
  orderDetails: null,
  ...calculateTotals([]),
};

// Create context
const CartContext = createContext();

// Cart Provider
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Calculate totals based on current state
  const cartState = {
    ...state,
    ...calculateTotals(state.items),
  };

  // Cart actions
  const addToCart = (product, quantity = 1) => {
    if (product.stock_quantity < quantity) {
      throw new Error(`Only ${product.stock_quantity} items available in stock`);
    }
    
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { ...product, quantity },
    });
  };

  const removeFromCart = (productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: productId,
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    const item = state.items.find(item => item.id === productId);
    if (item && item.product.stock_quantity < quantity) {
      throw new Error(`Only ${item.product.stock_quantity} items available in stock`);
    }

    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { id: productId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  const setOrderDetails = (orderDetails) => {
    dispatch({
      type: CART_ACTIONS.SET_ORDER_DETAILS,
      payload: orderDetails,
    });
  };

  // Real checkout function
const checkout = async (paymentData) => {
  try {
    console.log('🛒 Processing checkout with:', paymentData);
    let isAuthenticated = false;
    let currentUser = null;
    try {
      const userResponse = await api.get('/users/profile/');
      console.log('✅ User authenticated:', userResponse.data);
      isAuthenticated = true;
      currentUser = userResponse.data;
    } catch (authError) {
      if (authError.response?.status === 404) {
        console.log('⚠️ /users/me/ endpoint not found, proceeding without auth check');
        // Continue without authentication check for now
        try {
          await api.get('/orders/');
          isAuthenticated = true;
          console.log('✅ Alternative auth check passed via /orders/');
        } catch (orderError) {
          if (orderError.response?.status === 401 || orderError.response?.status === 403) {
            console.log('❌ User not authenticated via /orders/:', orderError.response?.status);
            throw new Error('Please log in to place an order');
        }else{
          console.log('⚠️ Proceeding without authentication verification');
          isAuthenticated = true;
        }
    }
    } else if (authError.response?.status === 401) {
        console.log('❌ User not authenticated');
        throw new Error('Please log in to place an order');
      } else {
        console.log('⚠️ Auth check failed with status:', authError.response?.status);
        // For other errors, proceed but log the issue
        isAuthenticated = true;
      }
    }

    // First, let's test if we can GET the orders endpoint
    try {
      const testResponse = await api.options('/orders/');
      console.log('✅ Orders endpoint options', testResponse.status);
    } catch (getError) {
      console.log('❌ orders endpoint options failed:', optionsError.response?.data);
    }

    // Prepare order data for backend
    const orderData = {
      items: state.items.map(item => ({
        product: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        vendor: item.vendorId,
      })),
      subtotal: cartState.subtotal,
      shipping_cost: cartState.shippingCost,
      total_amount: cartState.total,
      payment_method: paymentData.paymentMethod,
      customer_name: "Customer Name",
      customer_email: paymentData.email,
      customer_phone: paymentData.phoneNumber,
      shipping_address: JSON.stringify ({
        street: paymentData.shippingAddress.street,
        city: paymentData.shippingAddress.city,
        state: paymentData.shippingAddress.state,
        postal_code: paymentData.shippingAddress.postalCode,
        country: paymentData.shippingAddress.country,
      }),
      notes: paymentData.notes || '',
    };

    console.log('📦 Creating order with data:', orderData);

    // Try to create order
    const orderResponse = await api.post('/orders/', orderData);

    const order = orderResponse.data;
    console.log('✅ Order created successfully:', order);
    
    setOrderDetails(order);

    if (paymentData.paymentMethod === 'cash') {
      clearCart();
      return {
        success: true,
        message: 'Order placed successfully! You will pay on delivery.',
        orderId: order.id,
        orderNumber: order.order_number,
        paymentMethod: 'cash'
      };
    } 
    else if (paymentData.paymentMethod === 'mpesa') {
      if (!paymentData.phoneNumber || !paymentData.phoneNumber.startsWith('254')) {
        throw new Error('Please enter a valid MPesa phone number starting with 254');
      }

      const paymentResponse = await paymentService.initiateMpesaPayment(
        order.id, 
        paymentData.phoneNumber
      );
      
      return {
        success: true,
        message: 'MPesa payment initiated. Check your phone to complete payment.',
        orderId: order.id,
        orderNumber: order.order_number,
        paymentId: paymentResponse.data.payment_id,
        paymentMethod: 'mpesa',
        requiresPayment: true
      };
    }
    else if (paymentData.paymentMethod === 'card') {
      return {
        success: true,
        message: 'Proceed with card payment',
        orderId: order.id,
        orderNumber: order.order_number,
        paymentMethod: 'card',
        requiresPayment: true
      };
    }

  } catch (error) {
    console.error('❌ Checkout error:', error);
    
    let errorMessage = 'Checkout failed. Please try again.';
    
    if (error.response) {
      const backendError = error.response.data;
      
      if (error.response.status === 405) {
        errorMessage = 'Order creation not allowed. Please contact support.';
      } else if (backendError.detail) {
        errorMessage = backendError.detail;
      } else if (backendError.non_field_errors) {
        errorMessage = backendError.non_field_errors.join(', ');
      } else {
        errorMessage = backendError.message || errorMessage;
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    
    throw new Error(errorMessage);
  }
};
  // Confirm payment and clear cart
  const confirmPayment = async (orderId, paymentId = null) => {
    try {
      if (paymentId) {
        const paymentStatus = await paymentService.pollPaymentStatus(paymentId);
        
        if (paymentStatus.success) {
          clearCart();
          return {
            success: true,
            message: 'Payment confirmed and order completed!',
            payment: paymentStatus.payment,
            orderId: orderId
          };
        } else {
          throw new Error(paymentStatus.error || 'Payment failed or was cancelled');
        }
      } else {
        clearCart();
        return {
          success: true,
          message: 'Payment confirmed and order completed!',
          orderId: orderId
        };
      }
    } catch (error) {
      console.error('❌ Payment confirmation error:', error);
      throw new Error(error.message || 'Payment confirmation failed');
    }
  };

  const value = {
    ...cartState,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart,
    checkout,
    confirmPayment,
    setOrderDetails,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;