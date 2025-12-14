import React, { useState, useRef } from 'react';
import axios from 'axios';

const ImageUpload = ({ 
  onImageChange, 
  currentImage, 
  label = "Product Image",
  uploadMethod = 'cloudinary', // 'backend' or 'cloudinary'
  cloudName = 'dg7gwfpck', // Your Cloudinary cloud name
  uploadPreset = 'eccomerce_uploads' // Your Cloudinary upload preset
}) => {
  const [previewUrl, setPreviewUrl] = useState(currentImage || '');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedToCloudinary, setUploadedToCloudinary] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState('');
  const fileInputRef = useRef(null);

  // Handle Cloudinary direct upload
  const handleCloudinaryUpload = async (file) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      console.log('🔄 Starting Cloudinary upload...');
      console.log('Cloud Name:', cloudName);
      console.log('Upload Preset:', uploadPreset);
      console.log('File:', file.name, file.type, file.size);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
      console.log('Upload URL:', uploadUrl);


      const response = await axios.post(
        uploadUrl,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );
      console.log('✅ Cloudinary Response:', response.data);

      if (response.data.secure_url) {
        const url = response.data.secure_url;
        setCloudinaryUrl(url);
        setUploadedToCloudinary(true);
        setPreviewUrl(url);
        
        // Pass Cloudinary URL to parent component
        onImageChange(url, response.data.public_id);
        
        console.log('✅ Image uploaded to Cloudinary:', url);
        return url;
      }
    } catch (error) {
        console.error('❌ Detailed Cloudinary Error:');
        console.error('Response Status:', error.response?.status);
        console.error('Response Data:', error.response?.data);
        console.error('Response Headers:', error.response?.headers);

      if (error.response?.data?.error?.message) {
        alert(`Cloudinary Error: ${error.response.data.error.message}`);
      } else {
        alert('Failed to upload image. Please check console for details.');
      }
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle backend upload (original method)
  const handleBackendUpload = (file) => {
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Pass file to parent component
    onImageChange(file);
  };

  const handleFileSelect = async (file) => {
    if (file && file.type.startsWith('image/')) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      if (uploadMethod === 'cloudinary') {
        try {
          await handleCloudinaryUpload(file);
        } catch (error) {
          alert('Failed to upload to Cloudinary. Please try again.');
          // Fallback to backend upload
          handleBackendUpload(file);
        }
      } else {
        handleBackendUpload(file);
      }
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
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const removeImage = () => {
    setPreviewUrl('');
    setUploadedToCloudinary(false);
    setCloudinaryUrl('');
    onImageChange(null);
  };

  // Determine upload status text
  const getUploadStatusText = () => {
    if (uploading) {
      return `Uploading to Cloudinary... ${uploadProgress}%`;
    }
    if (uploadedToCloudinary) {
      return '✅ Uploaded to Cloudinary';
    }
    if (uploadMethod === 'cloudinary') {
      return 'Click to upload to Cloudinary';
    }
    return 'Click to upload or drag and drop';
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
        {uploadMethod === 'cloudinary' && (
          <span style={{
            marginLeft: '8px',
            fontSize: '0.8rem',
            background: '#3498db',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: '500'
          }}>
            ☁️ Cloudinary
          </span>
        )}
      </label>

      <div
        style={{
          border: `2px dashed ${isDragging ? '#3498db' : '#bdc3c7'}`,
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: uploading ? '#f8f9fa' : 'white',
          transition: 'all 0.3s ease',
          cursor: uploading ? 'default' : 'pointer',
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
          disabled={uploading}
        />

        {uploading ? (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontWeight: '500' }}>
              Uploading to Cloudinary...
            </p>
            <div style={{
              width: '80%',
              height: '8px',
              background: '#e9ecef',
              borderRadius: '4px',
              overflow: 'hidden',
              margin: '0 auto 1rem'
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                background: '#3498db',
                transition: 'width 0.3s'
              }} />
            </div>
            <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>
              {uploadProgress}% complete
            </p>
          </div>
        ) : previewUrl ? (
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
            {uploadedToCloudinary && (
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                background: 'rgba(52, 152, 219, 0.9)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                ☁️ Uploaded to Cloudinary
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.7 }}>
              {uploadMethod === 'cloudinary' ? '☁️' : '📸'}
            </div>
            <p style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontWeight: '500' }}>
              {getUploadStatusText()}
            </p>
            <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>
              PNG, JPG, JPEG up to 5MB
            </p>
            {uploadMethod === 'cloudinary' && (
              <p style={{ 
                margin: '0.5rem 0 0 0', 
                color: '#3498db', 
                fontSize: '0.8rem', 
                fontWeight: '500',
                background: '#e8f4fd',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                Powered by Cloudinary
              </p>
            )}
          </div>
        )}
      </div>

      {uploadedToCloudinary && cloudinaryUrl && (
        <div style={{
          background: '#e8f4fd',
          padding: '0.75rem',
          borderRadius: '4px',
          marginTop: '0.5rem',
          fontSize: '0.85rem'
        }}>
          <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '0.25rem' }}>
            Cloudinary URL:
          </div>
          <div style={{
            color: '#3498db',
            wordBreak: 'break-all',
            fontSize: '0.8rem',
            fontFamily: 'monospace'
          }}>
            {cloudinaryUrl}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;