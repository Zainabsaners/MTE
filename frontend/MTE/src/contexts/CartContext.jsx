import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Helper function to get product image from multiple possible fields
const getProductImage = (product) => {
  if (!product) return null;
  
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

// ✅ Correct - This is a regular function
const createCartItem = (product, quantity = 1) => ({
  id: product.id,
  product: {
    id: product.id,
    name: product.name,
    price: product.price,
    compare_at_price: product.compare_at_price,
    stock_quantity: product.stock_quantity,
    sku: product.sku,
    description: product.description,
    // Include the image in the product object
    image: getProductImage(product),
    tenant: product.tenant,
    vendor: product.vendor,
  },
  quantity,
  price: product.price,
  total: product.price * quantity,
  vendor: product.tenant?.name || 'Unknown Vendor',
  vendorSubdomain: product.tenant?.subdomain,
});

// Cart actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
};

// Cart reducer
const cartReducer = (state, action) => {
  console.log('Cart Action :', action.type, action.payload);
  
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM:
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        // Update quantity if item exists
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { 
                  ...item, 
                  quantity: item.quantity + action.payload.quantity,
                  total: (item.quantity + action.payload.quantity) * item.price
                }
              : item
          ),
        };
      } else {
        // Add new item with proper image handling
        return {
          ...state,
          items: [...state.items, createCartItem(action.payload, action.payload.quantity)],
        };
      }

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { 
                ...item, 
                quantity: action.payload.quantity,
                total: action.payload.quantity * item.price
              }
            : item
        ),
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        items: [],
        total: 0,
        itemCount: 0,
      };

    case CART_ACTIONS.LOAD_CART:
      // When loading from localStorage, ensure product images are preserved
      const loadedState = action.payload;
      return {
        ...loadedState,
        items: loadedState.items || [],
      };

    default:
      return state;
  }
};

// Calculate cart totals
const calculateTotals = (items) => {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce((total, item) => total + item.total, 0);
  
  return { itemCount, total };
};

// Initial state
const initialState = {
  items: [],
  ...calculateTotals([]),
};

// Create context
const CartContext = createContext();

// Cart Provider
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('mte_cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        console.log('🛒 Loading cart from localStorage:', cartData);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    console.log('💾 Saving cart to localStorage:', state);
    localStorage.setItem('mte_cart', JSON.stringify(state));
  }, [state]);

  // Cart actions
  const addToCart = (product, quantity = 1) => {
    if (product.stock_quantity < quantity) {
      throw new Error(`Only ${product.stock_quantity} items available in stock`);
    }
    
    console.log('➕ Adding to cart:', { product, quantity, image: getProductImage(product) });
    
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

    // Check stock availability
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

  const checkout = async (paymentData = {}) => {
    try {
      // For now, just show payment component
      // In future, this will call the actual checkout API
      return {
        success: true,
        message: 'Proceed to payment',
        // This will trigger payment component to show
      };
    } catch (error) {
      console.error('Checkout error:', error);
      return {
        success: false,
        message: error.message || 'Checkout failed. Please try again.',
      };
    }
  };

  // Recalculate totals whenever items change
  const cartState = {
    ...state,
    ...calculateTotals(state.items),
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