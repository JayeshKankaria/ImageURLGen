import { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const validPassword = import.meta.env.VITE_ADMIN_PASSWORD; // Replace with your secure password

  const handleLogin = () => {
    if (password === validPassword) {
      setIsAuthenticated(true);
      setAuthMessage('Login Successful!');
    } else {
      setAuthMessage('Incorrect Password!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setAuthMessage('');
    setSelectedImage(null);
    setImageUrl('');
    setError('');
    setCopyStatus('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setError('');
      setCopyStatus('');
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setError('');
      setCopyStatus('');
    } else {
      setError('Please drop an image file');
    }
  };

  const resetUpload = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');
    setCopyStatus('');

    const formData = new FormData();
    formData.append('file', selectedImage);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      setImageUrl(response.data.secure_url);
      resetUpload();
    } catch (err) {
      setError('Error uploading image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      setCopyStatus('Failed to copy');
      console.error('Copy error:', err);
    }
  };

  return (
    <div className="container">
      {!isAuthenticated ? (
        <div className="login-card">
          <h1 className="login-title">Please Login</h1>
          <input
            type="password"
            className="password-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="login-button" onClick={handleLogin}>
            Login
          </button>
          {authMessage && (
            <div
              className={`auth-message ${
                authMessage === 'Login Successful!' ? 'success' : 'error'
              }`}
            >
              {authMessage}
            </div>
          )}
        </div>
      ) : (
        <div className="upload-card">
          <h1 className="upload-title">Generate Image URL</h1>
          <div 
            className={`file-input-container ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <label className="file-input-label">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              <div className="upload-icon">📁</div>
              {selectedImage ? (
                <div className="selected-file">Selected: {selectedImage.name}</div>
              ) : (
                <div className="drag-text">
                  {imageUrl
                    ? 'Select another image'
                    : 'Drag and drop an image here or click to select'}
                </div>
              )}
            </label>
          </div>
          <button
            onClick={uploadImage}
            disabled={loading || !selectedImage}
            className="upload-button"
          >
            {loading ? (
              <>
                <span className="loader"></span> Uploading...
              </>
            ) : (
              'Upload Image'
            )}
          </button>
          {error && <div className="error-message">{error}</div>}
          {imageUrl && (
            <div className="image-url-container">
              <p>Image URL:</p>
              <input
                type="text"
                value={imageUrl}
                readOnly
                className="image-url-input"
              />
              <button onClick={handleCopyUrl} className="copy-button">
                Copy URL
              </button>
              {copyStatus && <div className="copy-status">{copyStatus}</div>}
              <img
                src={imageUrl}
                alt="Uploaded"
                className="preview-image"
              />
            </div>
          )}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;