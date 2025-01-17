import { useState, useRef } from 'react';
import axios from 'axios';
import { LockIcon, KeyIcon } from 'lucide-react';
import './App.css';

const App = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const validPassword = import.meta.env.VITE_ADMIN_PASSWORD;

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
    setSelectedImages([]);
    setImageUrls([]);
    setError('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setError('Please select image files only');
      return;
    }
    if (validFiles.length > 5) {
      setError('You can only upload up to 5 images at once');
      return;
    }
    setSelectedImages(validFiles);
    setError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const resetUpload = () => {
    setSelectedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) {
      setError('Please select images first');
      return;
    }

    setUploading(true);
    setError('');
    const urls = [];

    try {
      for (const image of selectedImages) {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData
        );
        urls.push(response.data.secure_url);
      }
      
      setImageUrls(urls);
      resetUpload();
    } catch (err) {
      setError('Error uploading images. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {!isAuthenticated ? (
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <LockIcon className="w-8 h-8 text-blue-500" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-800">Welcome Back</h1>
              <p className="text-gray-600 mt-2">Please enter your password to continue</p>
            </div>
            
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
                />
              </div>
              
              <button 
                className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                onClick={handleLogin}
              >
                Sign In
              </button>
            </div>

            {authMessage && (
              <div className={`mt-6 p-3 rounded-lg text-center text-sm font-medium ${
                authMessage === 'Login Successful!' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {authMessage}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">Multiple Image Upload</h1>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
              ${selectedImages.length > 0 ? 'bg-gray-50' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <label className="cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                multiple
              />
              <div className="text-4xl mb-4 text-gray-600">📁</div>
              {selectedImages.length > 0 ? (
                <div className="space-y-2">
                  <p className="font-medium">Selected Files:</p>
                  {selectedImages.map((file, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {file.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  Drag and drop up to 5 images here or click to select
                </p>
              )}
            </label>
          </div>

          <button
            onClick={uploadImages}
            disabled={uploading || selectedImages.length === 0}
            className={`w-full mt-4 p-3 rounded-lg font-semibold transition-colors ${
              uploading || selectedImages.length === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⌛</span>
                Uploading...
              </span>
            ) : (
              'Upload Images'
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {imageUrls.length > 0 && (
            <div className="mt-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Uploaded Images:</h2>
              <div className="grid grid-cols-2 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="border rounded-lg p-2 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={url}
                        readOnly
                        className="text-sm text-gray-700 bg-transparent border-none outline-none"
                      />
                      <button 
                        onClick={() => copyToClipboard(url)} 
                        className="text-blue-500 hover:text-blue-600"
                      >
                        Copy
                      </button>
                    </div>
                    <img src={url} alt={`uploaded-${index}`} className="w-full h-auto rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full mt-4 bg-red-500 text-white py-2.5 rounded-lg font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
