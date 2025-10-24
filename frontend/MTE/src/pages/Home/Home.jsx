import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productAPI, tenantAPI } from "../../services/api";
import { tenantService } from "../../services/tenantService";

const Home = () => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [storeProducts, setStoreProducts] = useState({
    techstore: [],
    fashion: []
  });
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  useEffect(() => {
    fetchStoresAndProducts();
    // Get subscription plans from tenant service
    const plans = tenantService.getSubscriptionPlans();
    setSubscriptionPlans(plans);
  }, []);

  // Process product images to ensure they're properly formatted
  const processProductImages = (product) => {
    if (!product) return product;

    let imageUrl = null;
    let imageAlt = product.name || 'Product Image';

    // Check various possible image fields
    if (product.image_url && product.image_url !== null) {
      imageUrl = product.image_url;
    } else if (product.image) {
      if (typeof product.image === 'string') {
        imageUrl = product.image;
      } else if (product.image.url) {
        imageUrl = product.image.url;
      } else if (product.image.path) {
        imageUrl = product.image.path;
      }
    } else if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'string') {
        imageUrl = firstImage;
      } else if (firstImage.url) {
        imageUrl = firstImage.url;
      } else if (firstImage.path) {
        imageUrl = firstImage.path;
      }
    } else if (product.photo) {
      imageUrl = product.photo;
    } else if (product.thumbnail) {
      imageUrl = product.thumbnail;
    }

    // Convert relative paths to absolute URLs
    if (imageUrl) {
      // Remove any leading slashes that might cause issues
      imageUrl = imageUrl.replace(/^\/+/, '');
      
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('//') && !imageUrl.startsWith('data:')) {
        // Check if it's a storage path or public path
        if (imageUrl.startsWith('storage/') || imageUrl.startsWith('public/') || imageUrl.includes('uploads')) {
          imageUrl = `${window.location.origin}/${imageUrl}`;
        } else if (imageUrl.startsWith('images/') || imageUrl.startsWith('img/')) {
          imageUrl = `${window.location.origin}/storage/${imageUrl}`;
        } else {
          // Try multiple possible base URLs
          imageUrl = `${window.location.origin}/storage/${imageUrl}`;
        }
      }
    }

    return {
      ...product,
      displayImage: imageUrl,
      imageAlt: imageAlt,
      hasImage: !!imageUrl
    };
  };

  const fetchStoresAndProducts = async () => {
    setLoading(true);
    try {
      // Fetch all stores
      let storesResponse;
      let storesArray = [];
      
      const storeEndpoints = [
        () => tenantAPI.getTenantsList(),
        () => tenantAPI.getUserStores(),
        () => tenantAPI.getAllTenants()
      ];
      
      for (const endpoint of storeEndpoints) {
        try {
          storesResponse = await endpoint();
          if (Array.isArray(storesResponse?.data)) {
            storesArray = storesResponse.data;
            break;
          } else if (storesResponse?.data?.results) {
            storesArray = storesResponse.data.results;
            break;
          } else if (Array.isArray(storesResponse)) {
            storesArray = storesResponse;
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      setStores(storesArray);

      // Find specific stores by subdomain or name
      const techStore = storesArray.find(store => 
        store?.subdomain === 'techstore' || 
        store?.name?.toLowerCase().includes('tech')
      );
      
      const fashionStore = storesArray.find(store => 
        store?.subdomain === 'fashion' || 
        store?.name?.toLowerCase().includes('fashion')
      );

      // Fetch ALL products first, then filter by store
      const allProducts = await fetchAllProducts();

      // Process all products with image handling
      const processedProducts = allProducts.map(product => processProductImages(product));

      // Filter products for each store
      const productsData = {
        techstore: [],
        fashion: []
      };

      if (techStore) {
        const techProducts = processedProducts.filter(product => 
          product.tenant === techStore.id || 
          product.store === techStore.id ||
          product.tenant_id === techStore.id ||
          product.tenant_name?.toLowerCase().includes('tech') ||
          product.store_name?.toLowerCase().includes('tech')
        ).slice(0, 4);
        productsData.techstore = techProducts;
      }

      if (fashionStore) {
        const fashionProducts = processedProducts.filter(product => 
          product.tenant === fashionStore.id || 
          product.store === fashionStore.id ||
          product.tenant_id === fashionStore.id ||
          product.tenant_name?.toLowerCase().includes('fashion') ||
          product.store_name?.toLowerCase().includes('fashion')
        ).slice(0, 4);
        productsData.fashion = fashionProducts;
      }

      setStoreProducts(productsData);
      
    } catch (error) {
      console.error('❌ Error fetching stores and products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await productAPI.getProducts();
      
      let productsArray = [];
      
      if (Array.isArray(response?.data)) {
        productsArray = response.data;
      } else if (response?.data?.results) {
        productsArray = response.data.results;
      } else if (response?.data?.products) {
        productsArray = response.data.products;
      } else if (Array.isArray(response)) {
        productsArray = response;
      } else if (Array.isArray(response?.data?.data)) {
        productsArray = response.data.data;
      }
      
      // Filter for published/featured products
      const filteredProducts = productsArray.filter(product => 
        product?.status === 'published' || 
        product?.is_featured ||
        product?.active === true ||
        product?.is_active === true ||
        true
      );
      
      return filteredProducts;
      
    } catch (error) {
      console.error('❌ Error fetching all products:', error);
      return getSampleProducts();
    }
  };

  // Enhanced sample products with realistic image URLs
  const getSampleProducts = () => {
    return [
      {
        id: 1,
        name: "Wireless Bluetooth Earbuds",
        description: "High-quality wireless earbuds with noise cancellation",
        price: "2999",
        image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop",
        image_url: "https://images.unsplash.com/photo-1606220945770-b5b5c2c55bf1?w=400&h=300&fit=crop",
        tenant: "996c304b-ecd9-471d-bd4f-f5d033be9794",
        tenant_name: "TechStore",
        status: "published",
        is_featured: true
      },
      {
        id: 2,
        name: "Smartphone Case",
        description: "Durable protective case for smartphones",
        price: "899",
        image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop",
        image_url: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop",
        tenant: "996c304b-ecd9-471d-bd4f-f5d033be9794",
        tenant_name: "TechStore",
        status: "published",
        is_featured: true
      },
      {
        id: 3,
        name: "Gaming Mouse",
        description: "High-precision gaming mouse with RGB lighting",
        price: "1999",
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
        image_url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
        tenant: "996c304b-ecd9-471d-bd4f-f5d033be9794",
        tenant_name: "TechStore",
        status: "published",
        is_featured: true
      },
      {
        id: 4,
        name: "Summer Dress",
        description: "Elegant summer dress for all occasions",
        price: "2499",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=300&fit=crop",
        image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=300&fit=crop",
        tenant: "5833cf42-d48b-4e6d-bb3c-3669c455be3c",
        tenant_name: "FashionStore",
        status: "published",
        is_featured: true
      },
      {
        id: 5,
        name: "Designer Handbag",
        description: "Stylish handbag for everyday use",
        price: "4599",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop",
        image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop",
        tenant: "5833cf42-d48b-4e6d-bb3c-3669c455be3c",
        tenant_name: "FashionStore",
        status: "published",
        is_featured: true
      },
      {
        id: 6,
        name: "Running Shoes",
        description: "Comfortable running shoes for athletes",
        price: "3499",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
        image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
        tenant: "5833cf42-d48b-4e6d-bb3c-3669c455be3c",
        tenant_name: "FashionStore",
        status: "published",
        is_featured: true
      }
    ];
  };

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        alert("Thank you for your message! We'll get back to you soon.");
        setContactForm({ name: "", email: "", message: "" });
      } else {
        throw new Error('Backend email failed');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      const subject = `Contact from ${contactForm.name}`;
      const body = `Name: ${contactForm.name}%0D%0AEmail: ${contactForm.email}%0D%0AMessage: ${contactForm.message}`;
      window.location.href = `mailto:multimart4@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
      
      alert("Opening your email client... Please send the pre-filled email to contact us.");
    }
  };

  const openWhatsApp = () => {
    const phoneNumber = '254702640917';
    const message = 'Hello! I would like to get more information about MultiMart.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  // Product Image Component
  const ProductImage = ({ product, vendorIcon, style }) => {
    const hasError = imageErrors[product?.id];
    
    if (product?.displayImage && !hasError) {
      return (
        <img 
          src={product.displayImage} 
          alt={product.imageAlt}
          style={style}
          onError={() => handleImageError(product.id)}
          loading="lazy"
        />
      );
    }

    // Show gradient placeholder with vendor icon
    return (
      <div style={{
        ...style, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: 'white',
        fontSize: '3rem',
        fontWeight: 'bold'
      }}>
        {vendorIcon}
      </div>
    );
  };

  // Product Grid Component for each store
  const ProductGrid = ({ products, vendorIcon }) => {
    if (!products || products.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          color: '#666'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📦</div>
          <p>No products available yet</p>
        </div>
      );
    }

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '0.5rem',
        marginTop: '1rem'
      }}>
        {products.slice(0, 4).map((product, index) => (
          <div key={product.id || index} style={{
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            aspectRatio: '1',
            backgroundColor: '#f8f9fa'
          }}>
            <ProductImage 
              product={product} 
              vendorIcon={vendorIcon}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  // Styles
  const buttonStyles = {
    base: {
      padding: '1rem 2rem',
      border: 'none',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: 600,
      fontSize: '1.1rem',
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '160px',
      cursor: 'pointer',
    },
    primary: {
      backgroundColor: '#e74c3c',
      color: 'white',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'white',
      border: '2px solid white',
    },
  };

  const heroStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '6rem 0',
    textAlign: 'center',
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
  };

  const heroTitleStyle = {
    fontSize: '3.5rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
  };

  const heroSubtitleStyle = {
    fontSize: '1.3rem',
    marginBottom: '2.5rem',
    opacity: 0.9,
    lineHeight: 1.6,
    maxWidth: '800px',
    margin: '0 auto',
  };

  const heroButtonsStyle = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  };

  const featuresStyle = {
    padding: '5rem 0',
    backgroundColor: '#f8f9fa',
  };

  const sectionTitleStyle = {
    textAlign: 'center',
    fontSize: '2.5rem',
    marginBottom: '3rem',
    color: '#2c3e50',
  };

  const featuresGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const featureCardStyle = {
    background: 'white',
    padding: '2.5rem 2rem',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  const featureIconStyle = {
    fontSize: '3rem',
    marginBottom: '1.5rem',
  };

  const featureTitleStyle = {
    color: '#2c3e50',
    marginBottom: '1rem',
    fontSize: '1.4rem',
  };

  const featureTextStyle = {
    color: '#7f8c8d',
    lineHeight: 1.6,
  };

  const vendorShowcaseStyle = {
    padding: '5rem 0',
    background: 'white',
  };

  const vendorGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const vendorCardStyle = {
    background: '#f8f9fa',
    padding: '2rem',
    borderRadius: '12px',
    textDecoration: 'none',
    color: 'inherit',
    border: '2px solid transparent',
    transition: 'all 0.3s ease',
    textAlign: 'center',
  };

  const productImageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '1rem',
    backgroundColor: '#f8f9fa',
  };

  const vendorIconStyle = {
    fontSize: '2rem',
    marginBottom: '1rem',
  };

  const shopLinkStyle = {
    color: '#3498db',
    fontWeight: 600,
    transition: 'color 0.3s ease',
    display: 'inline-block',
    marginTop: '1rem',
  };

  const pricingStyle = {
    padding: '5rem 0',
    backgroundColor: '#f8f9fa',
  };

  const pricingGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
  };

  const pricingCardStyle = {
    background: 'white',
    padding: '2.5rem 2rem',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    border: '2px solid transparent',
    transition: 'all 0.3s ease',
  };

  const priceStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '1rem 0',
  };

  const pricePeriodStyle = {
    color: '#7f8c8d',
    fontSize: '1rem',
  };

  const reviewsStyle = {
    padding: '5rem 0',
    background: 'white',
  };

  const reviewsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
  };

  const reviewCardStyle = {
    background: '#f8f9fa',
    padding: '2rem',
    borderRadius: '12px',
    borderLeft: '4px solid #3498db',
  };

  const reviewTextStyle = {
    fontStyle: 'italic',
    color: '#555',
    lineHeight: 1.6,
    marginBottom: '1rem',
  };

  const reviewerStyle = {
    fontWeight: 'bold',
    color: '#2c3e50',
  };

  const contactStyle = {
    padding: '5rem 0',
    backgroundColor: '#2c3e50',
    color: 'white',
  };

  const contactGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '3rem',
    maxWidth: '1000px',
    margin: '0 auto',
  };

  const contactInfoStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  };

  const contactItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '1.1rem',
  };

  const contactLinkStyle = {
    color: 'white',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const inputStyle = {
    padding: '1rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '120px',
    resize: 'vertical',
  };

  const submitButtonStyle = {
    ...buttonStyles.base,
    ...buttonStyles.primary,
    border: 'none',
    cursor: 'pointer',
  };

  // Featured shops data
  const featuredShops = [
    { 
      to: '/shops/techstore', 
      icon: '💻', 
      title: 'Tech Store', 
      text: 'Latest electronics, smartphones, and gadgets at competitive prices',
      storeKey: 'techstore',
      products: storeProducts.techstore
    },
    { 
      to: '/shops/fashion', 
      icon: '👕', 
      title: 'Fashion Store', 
      text: 'Trendy clothing and fashion items for all ages and styles',
      storeKey: 'fashion',
      products: storeProducts.fashion
    },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={heroStyle}>
        <div style={containerStyle}>
          <h1 style={heroTitleStyle}>Welcome to MultiMart</h1>
          <p style={heroSubtitleStyle}>
            Your premier multi-vendor marketplace. Start your own online store or shop from multiple vendors in one secure platform with seamless payment integration.
          </p>
          <div style={heroButtonsStyle}>
            <Link 
              to="/shops/techstore" 
              style={{ ...buttonStyles.base, ...buttonStyles.primary }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#c0392b';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(231, 76, 60, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#e74c3c';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Start Shopping
            </Link>
            <Link 
              to="/register-tenant" 
              style={{ ...buttonStyles.base, ...buttonStyles.secondary }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#333';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={featuresStyle}>
        <div style={containerStyle}>
          <h2 style={sectionTitleStyle}>Why Choose MultiMart?</h2>
          <div style={featuresGridStyle}>
            {[
              { icon: '🏪', title: 'Multiple Vendors', text: 'Shop from various independent vendors all in one marketplace' },
              { icon: '🚀', title: 'Easy Setup', text: 'Start your own shop in minutes with our vendor dashboard' },
              { icon: '💳', title: 'Payment Integration', text: 'Secure and convenient payments with multiple payment methods' },
              { icon: '🔒', title: 'Secure Platform', text: 'Your data and transactions are protected with enterprise security' },
              { icon: '💰', title: 'Low Commission', text: 'Vendors enjoy competitive commission rates' },
              { icon: '🌍', title: 'Global Reach', text: 'Reach customers from around the world' },
            ].map((feature, index) => (
              <div 
                key={index}
                style={featureCardStyle}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={featureIconStyle}>{feature.icon}</div>
                <h3 style={featureTitleStyle}>{feature.title}</h3>
                <p style={featureTextStyle}>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Shops with Real Products */}
      <section style={vendorShowcaseStyle}>
        <div style={containerStyle}>
          <h2 style={sectionTitleStyle}>Featured Shops</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
              <p>Loading featured products...</p>
            </div>
          ) : (
            <div style={vendorGridStyle}>
              {featuredShops.map((vendor, index) => {
                const displayProducts = storeProducts[vendor.storeKey] || [];
                
                return (
                  <Link
                    key={index}
                    to={vendor.to}
                    style={vendorCardStyle}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#3498db';
                      e.target.style.transform = 'translateY(-3px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = 'transparent';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {/* Main store image */}
                    <ProductImage 
                      product={displayProducts[0]} 
                      vendorIcon={vendor.icon}
                      style={productImageStyle}
                    />

                    <div style={vendorIconStyle}>{vendor.icon}</div>
                    <h3 style={featureTitleStyle}>{vendor.title}</h3>
                    <p style={{ ...featureTextStyle, marginBottom: '1rem' }}>{vendor.text}</p>
                    
                    {/* Product grid */}
                    <ProductGrid 
                      products={displayProducts} 
                      vendorIcon={vendor.icon}
                    />
                    
                    {/* Product count and featured product */}
                    {displayProducts.length > 0 && (
                      <div style={{ 
                        fontSize: '0.9rem', 
                        color: '#666', 
                        marginTop: '1rem',
                        textAlign: 'left'
                      }}>
                        <div><strong>Featured:</strong> {displayProducts[0]?.name}</div>
                        {displayProducts[0]?.price && (
                          <div><strong>Price:</strong> KES {displayProducts[0]?.price}</div>
                        )}
                      </div>
                    )}
                    
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#666', 
                      marginTop: '0.5rem',
                      textAlign: 'left'
                    }}>
                      <strong>Products Available:</strong> {displayProducts.length > 0 ? displayProducts.length : 'Coming Soon'}
                    </div>
                    
                    <span style={shopLinkStyle}>Visit Shop →</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* REMOVED DEBUG INFORMATION SECTION */}
        </div>
      </section>

      {/* Pricing Section */}
      <section style={pricingStyle}>
        <div style={containerStyle}>
          <h2 style={sectionTitleStyle}>Vendor Subscription Plans</h2>
          <div style={pricingGridStyle}>
            {subscriptionPlans.map((plan, index) => (
              <div
                key={plan.id}
                style={{
                  ...pricingCardStyle,
                  borderColor: plan.popular ? '#3498db' : 'transparent',
                  transform: plan.popular ? 'scale(1.05)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = plan.popular ? 'scale(1.08) translateY(-5px)' : 'scale(1.05) translateY(-5px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = plan.popular ? 'scale(1.05)' : 'scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                }}
              >
                {plan.popular && (
                  <div style={{ 
                    background: '#3498db', 
                    color: 'white', 
                    padding: '0.5rem', 
                    borderRadius: '20px', 
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                  }}>
                    Most Popular
                  </div>
                )}
                <h3 style={featureTitleStyle}>{plan.name}</h3>
                <div style={priceStyle}>
                  {plan.price === 0 ? 'FREE' : `KES ${plan.price}`}
                  <span style={pricePeriodStyle}>{plan.price === 0 ? '' : '/month'}</span>
                </div>
                <ul style={{ textAlign: 'left', color: '#7f8c8d', lineHeight: '1.8', padding: '0 1rem' }}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>✓ {feature}</li>
                  ))}
                </ul>
                <Link 
                  to="/register-tenant" 
                  style={{ 
                    ...buttonStyles.base, 
                    ...buttonStyles.primary,
                    marginTop: '2rem',
                    width: '100%'
                  }}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section style={reviewsStyle}>
        <div style={containerStyle}>
          <h2 style={sectionTitleStyle}>What Our Users Say</h2>
          <div style={reviewsGridStyle}>
            {[
              {
                text: "MultiMart helped me start my electronics business with zero technical knowledge. The payment integration makes transactions so easy!",
                reviewer: "Jeff sne@ky, Tech Store Vendor",
                rating: "⭐⭐⭐⭐⭐"
              },
              {
                text: "As a customer, I love shopping from multiple vendors in one place. The delivery is fast and prices are competitive.",
                reviewer: "Shanice J, Customer",
                rating: "⭐⭐⭐⭐⭐"
              },
              {
                text: "The vendor dashboard is incredibly user-friendly. I managed to set up my fashion store in under 30 minutes!",
                reviewer: "Triteen Angel, Fashion Store Vendor",
                rating: "⭐⭐⭐⭐⭐"
              }
            ].map((review, index) => (
              <div key={index} style={reviewCardStyle}>
                <div style={{ color: '#f39c12', marginBottom: '1rem' }}>{review.rating}</div>
                <p style={reviewTextStyle}>"{review.text}"</p>
                <div style={reviewerStyle}>- {review.reviewer}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section style={contactStyle}>
        <div style={containerStyle}>
          <h2 style={{ ...sectionTitleStyle, color: 'white' }}>Get In Touch</h2>
          <div style={contactGridStyle}>
            <div style={contactInfoStyle}>
              <h3 style={{ color: 'white', marginBottom: '1rem' }}>Contact Information</h3>
              <div style={contactItemStyle}>
                <span>📧</span>
                <a href="mailto:multimart4@gmail.com" style={contactLinkStyle}>
                  multimart2005@gmail.com
                </a>
              </div>
              <div style={contactItemStyle}>
                <span>📱</span>
                <a href="tel:+254702640917" style={contactLinkStyle}>
                  +254 702 640 917
                </a>
              </div>
              <div style={contactItemStyle}>
                <span>💬</span>
                <a 
                  href="#" 
                  style={contactLinkStyle}
                  onClick={(e) => {
                    e.preventDefault();
                    openWhatsApp();
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#25D366';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'white';
                  }}
                >
                  Chat on WhatsApp
                </a>
              </div>
              <div style={contactItemStyle}>
                <span>🌍</span>
                <span>Global Support</span>
              </div>
            </div>
            
            <form style={formStyle} onSubmit={handleContactSubmit}>
              <h3 style={{ color: 'white', marginBottom: '1rem' }}>Send us a Message</h3>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                style={inputStyle}
                value={contactForm.name}
                onChange={handleContactChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                style={inputStyle}
                value={contactForm.email}
                onChange={handleContactChange}
                required
              />
              <textarea
                name="message"
                placeholder="Your Message"
                style={textareaStyle}
                value={contactForm.message}
                onChange={handleContactChange}
                required
              />
              <button type="submit" style={submitButtonStyle}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <style>
        {`
          @media (max-width: 768px) {
            .hero-title {
              font-size: 2.5rem !important;
            }
            .hero-subtitle {
              font-size: 1.1rem !important;
            }
            .hero-buttons {
              flex-direction: column;
              align-items: center;
            }
            .hero-button {
              width: 100%;
              max-width: 300px;
            }
            .contact-grid {
              grid-template-columns: 1fr;
            }
            .vendor-grid {
              grid-template-columns: 1fr;
            }
            .features-grid {
              grid-template-columns: 1fr;
            }
            .pricing-grid {
              grid-template-columns: 1fr;
            }
            .reviews-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Home;