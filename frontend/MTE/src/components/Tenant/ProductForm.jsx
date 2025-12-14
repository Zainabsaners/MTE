import React, { useState, useEffect } from 'react';
import { productAPI, tenantAPI } from '../../services/api';
import ImageUpload from '../ImageUpload/ImageUpload';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock_quantity: product?.stock_quantity || 0,
    Category: product?.Category || '', // Uppercase C to match Django model
    tenant: product?.tenant || '',
    is_featured: product?.is_featured || false,
    status: product?.status || 'draft',
    image_url: product?.image_url || '',
    ...product
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [cloudinaryImageId, setCloudinaryImageId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // States for stores and categories
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [storesError, setStoresError] = useState(null);
  const [categoriesError, setCategoriesError] = useState(null);

  // Fetch stores and categories on component mount
  useEffect(() => {
    fetchStores();
    fetchCategories();
  }, []);

  const fetchStores = async () => {
    setLoadingStores(true);
    setStoresError(null);
    try {
      console.log('🔄 Fetching stores...');
      
      let response;
      let storesArray = [];
      
      // Try multiple endpoints in sequence
      const endpointsToTry = [
        { name: 'getTenantsList', call: () => tenantAPI.getTenantsList() },
        { name: 'getUserStores', call: () => tenantAPI.getUserStores() },
        { name: 'getUserTenants', call: () => tenantAPI.getUserTenants() },
        { name: 'getAllTenants', call: () => tenantAPI.getAllTenants() },
      ];
      
      for (const endpoint of endpointsToTry) {
        try {
          console.log(`🔄 Trying ${endpoint.name}...`);
          response = await endpoint.call();
          console.log(`✅ ${endpoint.name} response:`, response.data);
          
          // Extract stores from different response formats
          if (Array.isArray(response.data)) {
            storesArray = response.data;
            break;
          } else if (response.data?.results && Array.isArray(response.data.results)) {
            storesArray = response.data.results;
            break;
          } else if (response.data && typeof response.data === 'object') {
            // Try to find any array in the response
            const arrayKeys = Object.keys(response.data).filter(key => 
              Array.isArray(response.data[key])
            );
            if (arrayKeys.length > 0) {
              storesArray = response.data[arrayKeys[0]];
              break;
            }
          }
        } catch (error) {
          console.log(`❌ ${endpoint.name} failed:`, error.message);
          continue;
        }
      }
      
      console.log('📦 Final stores array:', storesArray);
      setStores(storesArray);
      
    } catch (error) {
      console.error('❌ Error fetching stores:', error);
      setStoresError('No stores found. Please create a store first in your dashboard.');
    } finally {
      setLoadingStores(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    setCategoriesError(null);
    try {
      console.log('🔄 Fetching categories...');
      const response = await productAPI.getCategories();
      console.log('✅ Categories response:', response.data);
      
      let categoriesArray = [];
      if (Array.isArray(response.data)) {
        categoriesArray = response.data;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        categoriesArray = response.data.results;
      } else {
        categoriesArray = [];
      }
      
      console.log('📦 Extracted categories:', categoriesArray);
      setCategories(categoriesArray);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategoriesError('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (file) => {
    setImageFile(file);
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrors({});

  // For new products, validate that a store is selected
  if (!product?.id && !formData.tenant) {
    setErrors({ tenant: 'Please select a store' });
    setLoading(false);
    return;
  }
  console.log('🔍 Form Data before submission:', {
    image_url: formData.image_url,
    cloudinary_image_id: cloudinaryImageId,
    has_image_file: !!imageFile
  });

  try {
    const submitData = new FormData();
    
    // ✅ APPEND ALL FORM FIELDS CORRECTLY
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    submitData.append('stock_quantity', formData.stock_quantity);
    submitData.append('status', formData.status);
    submitData.append('is_featured', formData.is_featured);
    
    // Only append tenant if it exists (for new products)
    if (formData.tenant) {
      submitData.append('tenant', formData.tenant);
    }
    
    // ✅ APPEND CATEGORY (Uppercase C - matches Django model)
    if (formData.Category && formData.Category !== '') {
      submitData.append('Category', formData.Category); // Uppercase C
      console.log('✅ Adding Category to FormData:', formData.Category);
    }

    // ✅ APPEND IMAGE FOR CLOUDINARY UPLOAD
    if (formData.image_url && formData.image_url.trim() !== '') {
      submitData.append('image', formData.image_url);
      console.log('✅ Adding Cloudinary URL to FormData:', formData.image_url);

       if (cloudinaryImageId) {
         submitData.append('cloudinary_public_id', cloudinaryImageId);
        } 
      } else if (imageFile) {
      submitData.append('image', imageFile);
      console.log('⚠️ Using file upload (Cloudinary URL not available)');
    }


    // ✅ DEBUG: Log all FormData entries
    console.log('📦 FormData entries for Cloudinary upload:');
    for (let [key, value] of submitData.entries()) {
      console.log(`  ${key}:`, value);
    }

    let response;
    if (product?.id) {
      console.log('🔄 Updating product with ID:', product.id);
      response = await productAPI.updateProduct(product.id, submitData);
    } else {
      console.log('🔄 Creating new product');
      response = await productAPI.createProduct(submitData);
    }

    console.log('✅ Product saved successfully to Cloudinary:', response.data);
    onSave?.(response.data);
    
  } catch (error) {
    console.error('❌ Error saving product to Cloudinary:', error);
    if (error.response?.data) {
      // Handle Cloudinary image upload errors
      if (error.response.data.image) {
        setErrors({ 
          image: Array.isArray(error.response.data.image) 
            ? error.response.data.image[0] 
            : error.response.data.image 
        });
      } else {
        setErrors(error.response.data);
      }
      console.log('📋 Cloudinary API Error details:', error.response.data);
    } else {
      setErrors({ general: 'Failed to save product. Please try again.' });
    }
  } finally {
    setLoading(false);
  }
};

  // Reusable styles
  const containerStyle = {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '2rem',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };

  const formGroupStyle = {
    marginBottom: '1.5rem',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: '14px',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box',
  };

  const inputFocusStyle = {
    ...inputStyle,
    borderColor: '#3498db',
    outline: 'none'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '120px',
    resize: 'vertical',
    fontFamily: 'inherit',
  };

  const selectStyle = {
    ...inputStyle,
    background: 'white',
  };

  const buttonStyle = {
    padding: '12px 24px',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginRight: '10px'
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    background: '#2980b9',
    transform: 'translateY(-1px)'
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    background: '#95a5a6'
  };

  const cancelButtonHoverStyle = {
    ...cancelButtonStyle,
    background: '#7f8c8d'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    background: '#bdc3c7',
    cursor: 'not-allowed',
    opacity: 0.6
  };

  const errorStyle = {
    color: '#e74c3c',
    fontSize: '0.9rem',
    marginTop: '0.25rem',
    display: 'block'
  };

  const loadingStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    background: '#f8f9fa',
    borderRadius: '8px',
    justifyContent: 'center'
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = '#3498db';
    e.target.style.outline = 'none';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = '#e9ecef';
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#2c3e50', marginBottom: '2rem', textAlign: 'center' }}>
        {product?.id ? 'Edit Product' : 'Add New Product'}
      </h2>

      {errors.general && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #f5c6cb',
        }}>
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Store Selection - Only show for new products */}
        {!product?.id && (
          <div style={formGroupStyle}>
            <label style={labelStyle}>
              Store *
              {storesError && (
                <button 
                  type="button"
                  onClick={fetchStores}
                  style={{
                    marginLeft: '10px',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Retry
                </button>
              )}
            </label>
            
            {loadingStores ? (
              <div style={loadingStyle}>
                <LoadingSpinner size="small" text="" />
                <span>Loading stores...</span>
              </div>
            ) : storesError ? (
              <div style={{
                padding: '1rem',
                background: '#fffaf0',
                border: '1px solid #faf089',
                borderRadius: '8px',
                color: '#744210'
              }}>
                <p>{storesError}</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Please go to your dashboard and create a store first.
                </p>
              </div>
            ) : stores.length === 0 ? (
              <div style={{
                padding: '1rem',
                background: '#fffaf0',
                border: '1px solid #faf089',
                borderRadius: '8px',
                color: '#744210'
              }}>
                <p>No stores available.</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  You need to create a store before adding products.
                </p>
              </div>
            ) : (
              <select
                name="tenant"
                value={formData.tenant}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                style={selectStyle}
                required
              >
                <option value="">Select a store</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name} {store.subdomain && `(${store.subdomain})`}
                  </option>
                ))}
              </select>
            )}
            {errors.tenant && <span style={errorStyle}>{errors.tenant}</span>}
            {stores.length > 0 && !loadingStores && (
              <p style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '0.25rem' }}>
                {stores.length} store(s) available
              </p>
            )}
          </div>
        )}

        {/* Product Image Upload */}
        <div style={formGroupStyle}>
          <ImageUpload
            onImageChange={(fileOrUrl, cloudinaryId) => {
              if ( typeof fileOrUrl === 'string' ) {
                // its a cloudinary URL
                setFormData(prev => ({ ...prev, image_url: fileOrUrl}));
                setCloudinaryImageId(cloudinaryId);
                console.log('✅ Cloudinary URL saved to form:', fileOrUrl);
                console.log('✅ Cloudinary Public ID saved:', cloudinaryId);
              } else {
                // its a file object
                setImageFile(fileOrUrl);
                setFormData(prev => ({ ...prev, image_url: '' }));
                setCloudinaryImageId(null); 
              }
            }}
            currentImage={product?.image_url || product?.image}
            label="Product Image"
            uploadMethod="cloudinary"
            cloudName="dg7gwfpck"
            uploadPreset="eccomerce_uploads"
          />
          {errors.image && (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '0.5rem',
              borderRadius: '4px',
              marginTop: '0.5rem',
              fontSize: '0.9rem'
            }}>
              {errors.image}
            </div>
          )}
          <p style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '0.5rem', marginBottom: '0' }}>
            Upload a clear image of your product. Supported formats: PNG, JPG, JPEG (max 5MB)
            {product?.id && (
              <span style={{ display: 'block', marginTop: '0.25rem', fontStyle: 'italic' }}>
                Leave empty to keep current image
              </span>
            )}
          </p>
        </div>

        {/* Product Name */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={inputStyle}
            placeholder="Enter product name"
            required
          />
          {errors.name && <span style={errorStyle}>{errors.name}</span>}
        </div>

        {/* Description */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={textareaStyle}
            placeholder="Describe your product features, benefits, and specifications..."
            required
          />
          {errors.description && <span style={errorStyle}>{errors.description}</span>}
        </div>

        {/* Price */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Price (KES) *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={inputStyle}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
          {errors.price && <span style={errorStyle}>{errors.price}</span>}
        </div>

        {/* Stock Quantity */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Stock Quantity *</label>
          <input
            type="number"
            name="stock_quantity"
            value={formData.stock_quantity}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={inputStyle}
            placeholder="0"
            min="0"
            required
          />
          {errors.stock_quantity && <span style={errorStyle}>{errors.stock_quantity}</span>}
        </div>

        {/* Category - Optional Field */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>
            Category (Optional)
            {categoriesError && (
              <button 
                type="button"
                onClick={fetchCategories}
                style={{
                  marginLeft: '10px',
                  padding: '2px 8px',
                  fontSize: '0.7rem',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            )}
          </label>
          
          {loadingCategories ? (
            <div style={loadingStyle}>
              <LoadingSpinner size="small" text="" />
              <span>Loading categories...</span>
            </div>
          ) : categoriesError ? (
            <div style={{
              padding: '1rem',
              background: '#fdf2f2',
              border: '1px solid #fbb6b6',
              borderRadius: '8px',
              color: '#c53030',
              fontSize: '0.9rem'
            }}>
              <p>Error loading categories</p>
              <select
                name="Category" // Uppercase C
                value={formData.Category}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                style={selectStyle}
              >
                <option value="">No Category (Uncategorized)</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="beauty">Beauty & Cosmetics</option>
                <option value="home">Home & Kitchen</option>
                <option value="jewelry">Jewelry</option>
                <option value="sports">Sports</option>
                <option value="books">Books</option>
                <option value="other">Other</option>
              </select>
            </div>
          ) : (
            <select
              name="Category" // Uppercase C
              value={formData.Category}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              style={selectStyle}
            >
              <option value="">No Category (Uncategorized)</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
          {errors.Category && <span style={errorStyle}>{errors.Category}</span>}
          <p style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '0.25rem' }}>
            Leave as "No Category" if you don't want to categorize this product
          </p>
        </div>

        {/* Status */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={selectStyle}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Featured */}
        <div style={{ ...formGroupStyle, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            name="is_featured"
            checked={formData.is_featured}
            onChange={handleInputChange}
            style={{ 
              width: '18px', 
              height: '18px',
              cursor: 'pointer'
            }}
          />
          <label style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
            Feature this product on your store
          </label>
        </div>

        {/* Form Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'flex-end', 
          marginTop: '2rem', 
          paddingTop: '1.5rem', 
          borderTop: '1px solid #e9ecef' 
        }}>
          <button
            type="button"
            style={cancelButtonStyle}
            onMouseEnter={(e) => {
              e.target.style.background = '#7f8c8d';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#95a5a6';
              e.target.style.transform = 'translateY(0)';
            }}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={loading ? disabledButtonStyle : buttonStyle}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = '#2980b9';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = '#3498db';
                e.target.style.transform = 'translateY(0)';
              }
            }}
            disabled={loading || (!product?.id && stores.length === 0 && !loadingStores)}
          >
            {loading ? 'Saving...' : (product?.id ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;