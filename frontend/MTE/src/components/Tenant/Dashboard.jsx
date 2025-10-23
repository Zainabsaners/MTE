import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from './ProductForm';
import { productService } from '../../services/productService';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [storeInfo, setStoreInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedProductForCategory, setSelectedProductForCategory] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  
  const navigate = useNavigate();

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '2rem',
    borderRadius: '12px',
    marginBottom: '2rem'
  };

  const tabStyle = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    borderBottom: '2px solid #e9ecef'
  };

  const tabButtonStyle = {
    padding: '12px 24px',
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    color: '#6c757d',
    transition: 'all 0.3s ease'
  };

  const activeTabStyle = {
    ...tabButtonStyle,
    color: '#3498db',
    borderBottom: '3px solid #3498db',
  };

  const cardStyle = {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem'
  };

  // Mock data for demonstration
  useEffect(() => {
    loadDashboardData();
    debugProductOwnership();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // In real app, fetch from API
      setStoreInfo({
        name: 'My Awesome Store',
        subdomain: 'mystore',
        status: 'active',
        subscription: 'basic',
        productCount: 5,
        orderCount: 12,
        revenue: 24500
      });
      
      await loadProducts();

      setOrders([
        { id: 1, customer: 'Jeff Masinde', total: 898, status: 'completed', date: '2025-10-01' },
        { id: 2, customer: 'Gianna Empress', total: 299, status: 'pending', date: '2025-10-02' }
      ]);
      console.log('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      console.log('Loading products...');
      const response = await productService.getVendorProducts();
      console.log('products API response:', response);
      console.log('Response data:', response.data);

      let productsArray = [];

      if (Array.isArray(response.data)) {
        productsArray = response.data;
      } else if (response.data && Array.isArray(response.data.results)){
        productsArray = response.data.results;
      } else if (response.data && Array.isArray(response.data.products)) {
        productsArray = response.data.products;
      } else if (response.data && Array.isArray(response.data.items)){
        productsArray = response.data.items;
      } else if (Array.isArray(response)){
        productsArray = response;
      } else {
        console.warn('unexpected response format:', response);
        productsArray = [];

      }
      console.log('Extracted products:', productsArray)

      if (productsArray.length > 0){
        setProducts(productsArray);
        console.log('products set successfully:', productsArray.length, 'products');

      }else {
        console.log('No products found, using fallback data');
      setProducts([
        
        { id: 1, name: 'Wireless-Headphones', price: 299, stock: 10, status: 'published', category: {name: 'Electronics'} },
        { id: 2, name: 'serum', price: 599, stock: 5, status: 'published', category: {name: 'Beauty'} },
        { id: 3, name: 'Coffe-mug', price: 199, stock: 0, status: 'draft', category:{name: 'Home'} }
        
      ]);
    }
  } catch (error) {
    console.error('Error loading products:', error);
    console.error('Error details:', error.response?.data || error.message);
    setProducts([
      
        { id: 1, name: 'Wireless-Headphones', price: 299, stock: 10, status: 'published', category:{name: 'Electronics'} },
        { id: 2, name: 'serum', price: 599, stock: 5, status: 'published', category:{name: 'Beauty'} },
        { id: 3, name: 'Coffe-mug', price: 199, stock: 0, status: 'draft', category:{ name: 'Home'} }
      
      ]);
  }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(productId);
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const handlePublishProduct = async (productId) => {
    try {
      await productService.publishProduct(productId);
      await loadProducts();
    } catch (error) {
      console.error('Error publishing product:', error);
      setProducts(products.map(p => p.id === productId ? { ...p, status: 'published' } : p));
    }
  };

  const handleUnpublishProduct = async (productId) => {
    try {   
      await productService.unpublishProduct(productId);
      await loadProducts();
    } catch (error) {
      console.error('Error unpublishing product:', error);
      setProducts(products.map(p => p.id === productId ? { ...p, status: 'unpublished' } : p));
    }
  };

  // FIXED: HandleAddCategory now receives the entire product object
  const handleAddCategory = async (product) => {
    try {
      console.log('Loading categories for product', product.id);
      const categoriesResponse = await productService.getCategories();
      setAvailableCategories(categoriesResponse.data);
      setSelectedProductForCategory(product); // Store the entire product object
      setShowCategoryModal(true);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // FIXED: HandleAddCategorySelect now uses uppercase 'Category' and removed alerts
  const handleAddCategorySelect = async (category) => {
    if (!selectedProductForCategory) return;
    
    try {
      setShowCategoryModal(false);
      console.log(`Updating product ${selectedProductForCategory.id} with category:`, category);
      
      // Use uppercase 'Category' to match your Django model
      await productService.updateProduct(selectedProductForCategory.id, { 
        Category: category.id  // Uppercase C
      });
      
      await loadProducts();
      // Success is handled silently - the product list will refresh and show the updated category
    } catch (error) {
      console.error('Error updating product category:', error);
      // Error is logged to console but no alert is shown to the user
    } finally { 
      setSelectedProductForCategory(null);
    }
  };

  const debugProductOwnership = async () => {
    try {
      const response = await productService.getVendorProducts();
      console.log('Full products response:', response);
      console.log('Response data:', response.data);
    
    // Handle paginated response
    let productsArray = [];
    if (Array.isArray(response.data)) {
      productsArray = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
      productsArray = response.data.results;
    }

      console.log('Current user products:', response.data.map(p => ({
        id: p.id,
        name: p.name,
        vendor: p.vendor,
        owner: p.owner
      })));
    } catch (error) {
      console.error('Error debugging products:', error);
    }
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setSelectedProductForCategory(null);
  };

  const canEditProduct = (product) => {
    return true;
  };

  const handleProductFormSave = async () => {
    setShowProductForm(false);
    setEditingProduct(null);
    await loadProducts();
  };

  const handleProductFormCancel = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  // Function to get product image URL
  const getProductImage = (product) => {
    const imageField = product.image;
    
    if (imageField) {
      if (imageField.startsWith('http')) {
        return imageField;
      }
      if (imageField.startsWith('/')) {
        return `http://localhost:8000${imageField}`;
      }
      return `http://localhost:8000/media/${imageField}`;
    }
    
    // Return placeholder based on product category
    return getPlaceholderImage(product);
  };

  const getPlaceholderImage = (product) => {
    const productName = product.name?.toLowerCase() || '';
    const categoryName = product.category_name?.toLowerCase() || '';
    
    const baseUrl = 'https://images.unsplash.com/photo-';
    
    const imageMap = {
      'jewel': '1602758633386-47eeb2765b2f?w=400&h=300&fit=crop',
      'jewellery': '1602758633386-47eeb2765b2f?w=400&h=300&fit=crop',
      'fashion': '1585487000127-cc48b8c2c7f8?w=400&h=300&fit=crop',
      'electronic': '1563986768604-043fe4f3f4b9?w=400&h=300&fit=crop',
      'tech': '1563986768604-043fe4f3f4b9?w=400&h=300&fit=crop',
      'beauty': '1596462502278-27bfdc403348?w=400&h=300&fit=crop',
      'home': '1586023494248-60d3d5f9b7b9?w=400&h=300&fit=crop',
      'default': '1560472353-64b6a3543a4a?w=400&h=300&fit=crop'
    };
    
    for (const [keyword, imageId] of Object.entries(imageMap)) {
      if (productName.includes(keyword) || categoryName.includes(keyword)) {
        return `${baseUrl}${imageId}`;
      }
    }
    
    return `${baseUrl}${imageMap.default}`;
  };

  // Overview Tab
  const renderOverview = () => (
    <div>
      <h3>Store Overview</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={cardStyle}>
          <h4 style={{ color: '#6c757d', margin: '0 0 10px 0' }}>Total Products</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db', margin: 0 }}>{storeInfo?.productCount || 0}</p>
        </div>
        
        <div style={cardStyle}>
          <h4 style={{ color: '#6c757d', margin: '0 0 10px 0' }}>Total Orders</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60', margin: 0 }}>{storeInfo?.orderCount || 0}</p>
        </div>
        
        <div style={cardStyle}>
          <h4 style={{ color: '#6c757d', margin: '0 0 10px 0' }}>Total Revenue</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c', margin: 0 }}>KES {storeInfo?.revenue || 0}</p>
        </div>
        
        <div style={cardStyle}>
          <h4 style={{ color: '#6c757d', margin: '0 0 10px 0' }}>Store Status</h4>
          <p style={{ 
            fontSize: '1.2rem', 
            fontWeight: 'bold', 
            color: storeInfo?.status === 'active' ? '#27ae60' : '#e74c3c', 
            margin: 0 
          }}>
            {storeInfo?.status === 'active' ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={cardStyle}>
          <h4>Recent Orders</h4>
          {Array.isArray(orders)&& orders.slice(0, 5).map(order => (
            <div key={order.id} style={{ 
              padding: '10px', 
              border: '1px solid #e9ecef', 
              borderRadius: '6px', 
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong>{order.customer}</strong>
                <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>KES {order.total}</div>
              </div>
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                background: order.status === 'completed' ? '#d4edda' : '#fff3cd',
                color: order.status === 'completed' ? '#155724' : '#856404',
                fontSize: '0.8rem'
              }}>
                {order.status}
              </span>
            </div>
          ))}
        </div>

        <div style={cardStyle}>
          <h4>Low Stock Products</h4>
          {Array.isArray(products)? (products.filter(p => p.stock < 10).map(product => (
            <div key={product.id} style={{ 
              padding: '10px', 
              border: '1px solid #e9ecef', 
              borderRadius: '6px', 
              marginBottom: '10px' 
            }}>
              <strong>{product.name}</strong>
              <div style={{ fontSize: '0.9rem', color: '#e74c3c' }}>
                Only {product.stock} left in stock
              </div>
            </div>
          ))
        ):(
            <p style={{ color: '#6c757d', textAlign: 'center' }}>Loading products...</p>
        )}
          {Array.isArray(products) && products.filter(p => p.stock < 10).length === 0 && (
            <p style={{ color: '#6c757d', textAlign: 'center' }}>All products have sufficient stock</p>
          )}
        </div>
      </div>
    </div>
  );

  // Orders Tab
  const renderOrders = () => (
    <div>
      <h3>Order Management</h3>
      
      <div style={cardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e9ecef' }}>
              <th style={{ textAlign: 'left', padding: '12px' }}>Order ID</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Customer</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Total</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                <td style={{ padding: '12px' }}>#{order.id}</td>
                <td style={{ padding: '12px' }}>{order.customer}</td>
                <td style={{ padding: '12px' }}>KES {order.total}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: order.status === 'completed' ? '#d4edda' : '#fff3cd',
                    color: order.status === 'completed' ? '#155724' : '#856404',
                    fontSize: '0.8rem'
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{order.date}</td>
                <td style={{ padding: '12px' }}>
                  <button style={{
                    padding: '6px 12px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>Product Management</h3>
        <button 
          style={{
            padding: '10px 20px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
          onClick={handleCreateProduct}
        >
          + Add New Product
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <LoadingSpinner />
          <p style={{ color: '#6c757d', marginTop: '1rem' }}>Loading products...</p>
        </div>
        
      ) : !Array.isArray(products) || products.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          background: '#f8f9fa', 
          borderRadius: '8px' 
        }}>
          <h4>No Products Yet</h4>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
            Start by adding your first product to your store.
          </p>
          <button 
            style={{
              padding: '10px 20px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={handleCreateProduct}
          >
            Create Your First Product
          </button>
        </div>
      ) : (
        <div style={cardStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>Product</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Image</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Price</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Stock</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const productImage = getProductImage(product);
                return (
                <tr key={product.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                  <td style={{ padding: '12px' }}>
                    <div>
                      <strong>{product.name}</strong>
                      {product.is_featured && (
                        <span style={{
                          marginLeft: '8px',
                          padding: '2px 6px',
                          background: '#ffeaa7',
                          color: '#e17055',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}>
                          FEATURED
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: '#f8f9fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {productImage ? (
                        <img 
                          src={productImage} 
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div style={{
                        display: productImage ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontSize: '1.2rem'
                      }}>
                        📦
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>{product.category && product.category.name ? (product.category.name) : product.category_name ? (product.category_name) : (
                    <span style={{ color: '#6c757d', fontStyle: 'italic'}}>Uncategorized</span>
                  )}</td>
                  <td style={{ padding: '12px' }}>KES {product.price}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      color: !product.stock_quantity && product.stock_quantity !== 0 ?
                  '#6c757d':
                             product.stock_quantity === 0 ? '#e74c3c' : 
                             product.stock_quantity < 10 ? '#f39c12' : '#27ae60',
                      fontWeight: '600'
                    }}>
                      {product.stock_quantity !== undefined ? product.stock_quantity : 'N/A' }
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: product.status === 'published' ? '#d4edda' : 
                                 product.status === 'draft' ? '#fff3cd' : '#f8d7da',
                      color: product.status === 'published' ? '#155724' : 
                            product.status === 'draft' ? '#856404' : '#721c24',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                     {(() => {
                      if (!product.status) return 'Draft';
                      const statusStr = String(product.status);
                      return statusStr.charAt(0).toUpperCase() + statusStr.slice(1);
                     })()}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <button 
                        style={{
                          padding: '4px 8px',
                          background: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.7rem'
                        }}
                        onClick={() => handleEditProduct(product)}
                      >
                        Edit
                      </button>
                      {(!product.category || !product.category.name) && canEditProduct (product) && (
                        <button
                        style={{
                          padding: '4px 8px',
                          background: '#9b59b6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.7rem'
                        }}
                        onClick={() => handleAddCategory(product)}> {/* FIXED: Pass product object */}
                          Add Category
                        </button>
                      )}
                      {(!product.category || !product.category.name) && !canEditProduct(product) &&(
                        <span style={{
                          padding: '4px 8px',
                          background: '#95a5a6',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          opacity: 0.6
                        }}>
                          Read Only
                        </span>
                      )}
                      
                      {product.status === 'published' ? (
                        <button 
                          style={{
                            padding: '4px 8px',
                            background: '#f39c12',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.7rem'
                          }}
                          onClick={() => handleUnpublishProduct(product.id)}
                        >
                          Unpublish
                        </button>
                      ) : (
                        <button 
                          style={{
                            padding: '4px 8px',
                            background: '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.7rem'
                          }}
                          onClick={() => handlePublishProduct(product.id)}
                        >
                          Publish
                        </button>
                      )}
                      
                      <button 
                        style={{
                          padding: '4px 8px',
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.7rem'
                        }}
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )
}
    </div>
  );

  // FIXED: Category modal with improved UI
  const renderCategoryModal = () => (
    showCategoryModal && selectedProductForCategory && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          minWidth: '400px',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem',
            borderBottom: '2px solid #e9ecef',
            paddingBottom: '1rem'
          }}>
            <div>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>Select Category</h3>
              <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '0.9rem' }}>
                For product: <strong>{selectedProductForCategory.name}</strong>
              </p>
            </div>
            <button 
              onClick={handleCloseCategoryModal}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6c757d'
              }}
            >
              ×
            </button>
          </div>
          
          <p style={{ marginBottom: '1.5rem', color: '#6c757d' }}>
            Choose a category for your product:
          </p>
          
          <div style={{ margin: '1.5rem 0' }}>
            {availableCategories.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                color: '#6c757d'
              }}>
                No categories available
              </div>
            ) : (
              availableCategories.map(category => (
                <div 
                  key={category.id}
                  style={{
                    padding: '15px',
                    border: '2px solid #e9ecef',
                    margin: '10px 0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: '#ffffff',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                  onClick={() => handleAddCategorySelect(category)}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f8f9fa';
                    e.target.style.borderColor = '#3498db';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#ffffff';
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <div>
                      <strong style={{ 
                        fontSize: '1.1rem', 
                        color: '#2c3e50',
                        display: 'block',
                        marginBottom: '5px'
                      }}>
                        {category.name}
                      </strong>
                      {category.description && (
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: '#6c757d',
                          lineHeight: '1.4'
                        }}>
                          {category.description}
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '0.7rem', 
                      color: '#95a5a6',
                      textAlign: 'right'
                    }}>
                      ID: {category.id.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e9ecef'
          }}>
            <button 
              onClick={handleCloseCategoryModal}
              style={{
                padding: '10px 20px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Show Product Form if active
  if (showProductForm) {
    return (
      <ProductForm 
        product={editingProduct}
        onSave={handleProductFormSave}
        onCancel={handleProductFormCancel}
      />
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>{storeInfo?.name || 'Vendor Dashboard'}</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
          Manage your store, products, and orders in one place
        </p>
      </div>

      {/* Tabs */}
      <div style={tabStyle}>
        <button 
          style={activeTab === 'overview' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          style={activeTab === 'products' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('products')}
        >
          Products ({products.length})
        </button>
        <button 
          style={activeTab === 'orders' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          style={activeTab === 'settings' ? activeTabStyle : tabButtonStyle}
          onClick={() => navigate('/settings')}
        >
          Store Settings
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          color: '#6c757d'
        }}>
          Loading dashboard data...
        </div>
      )}

      {/* Tab Content */}
      {!loading && (
        <>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'orders' && renderOrders()}
          {/* Settings tab content removed - it now navigates to /settings */}
        </>
      )}
      {renderCategoryModal()}
    </div>
  );
};

export default VendorDashboard;