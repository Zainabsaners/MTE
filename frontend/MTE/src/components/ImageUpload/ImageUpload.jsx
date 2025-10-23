import React, { useState, useRef } from 'react';

const ImageUpload = ({ onImageChange, currentImage, label = "Product Image" }) => {
  const [previewUrl, setPreviewUrl] = useState(currentImage || '');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Pass file to parent component
      onImageChange(file);
    } else {
      alert('Please select a valid image file (PNG, JPG, JPEG)');
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setPreviewUrl('');
    onImageChange(null);
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '600',
        color: '#2c3e50',
        fontSize: '14px'
      }}>
        {label}
      </label>

      <div
        style={{
          border: `2px dashed ${isDragging ? '#3498db' : '#bdc3c7'}`,
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: isDragging ? '#f8f9fa' : 'white',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          position: 'relative',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {previewUrl ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                borderRadius: '4px',
                objectFit: 'contain'
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.7 }}>
              📸
            </div>
            <p style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontWeight: '500' }}>
              Click to upload or drag and drop
            </p>
            <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>
              PNG, JPG, JPEG up to 5MB
            </p>
            <p style={{ margin: '0.5rem 0 0 0', color: '#3498db', fontSize: '0.8rem', fontWeight: '500' }}>
              Recommended: 800x600px or larger
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;