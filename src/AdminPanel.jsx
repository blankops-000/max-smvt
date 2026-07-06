import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaTimes, FaUpload, FaEdit, FaTrash, FaList } from 'react-icons/fa';
import { API_URL } from './api';

const NO_IMAGE_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23e9ecef'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Inter,sans-serif' font-size='14' fill='%236c757d'%3ENo Image%3C/text%3E%3C/svg%3E`;

const AdminPanel = ({ authToken, onUnauthorized }) => {
  const [view, setView] = useState('add'); // 'add', 'list'
  const [cars, setCars] = useState([]);
  const [editingCar, setEditingCar] = useState(null);
  const [carData, setCarData] = useState({
    title: '',
    brand: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    color: '',
    condition: '',
    contactNumber: '0723215715',
    images: []
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  });

  const handleUnauthorized = () => {
    setMessage('Your admin session has expired. Please log in again.');
    if (onUnauthorized) onUnauthorized();
  };

  const fetchCars = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/cars`);
      if (response.ok) {
        const data = await response.json();
        setCars(data);
      }
    } catch {
      setMessage('Unable to load cars.');
    }
  }, []);

  // Fetch cars for management
  useEffect(() => {
    if (view === 'list') {
      fetchCars();
    }
  }, [view, fetchCars]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCarData(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const url = editingCar ? `${API_URL}/api/cars/${editingCar._id}` : `${API_URL}/api/cars`;
      const method = editingCar ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(carData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(editingCar ? 'Car updated successfully!' : 'Car added successfully!');
        resetForm();
        if (view === 'list') fetchCars();
      } else if (response.status === 401) {
        handleUnauthorized();
      } else {
        // Show actual server validation error
        const reason = data?.error || data?.message || (editingCar ? 'Failed to update car' : 'Failed to add car');
        setMessage(`Error: ${reason}`);
      }
    } catch {
      setMessage('Unable to save car. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };





  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 3); // Limit to 3 images
    setSelectedFiles(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
    
    // Moderate compression
    const promises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const maxWidth = 400;
            const maxHeight = 300;
            let { width, height } = img;
            
            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            resolve(canvas.toDataURL('image/jpeg', 0.5));
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    });
    
    Promise.all(promises).then(base64Images => {
      setCarData(prev => ({ ...prev, images: base64Images }));
    });
  };

  const removeImage = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newImages = carData.images.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setImagePreviews(newPreviews);
    setCarData(prev => ({ ...prev, images: newImages }));
  };

  const resetForm = () => {
    setCarData({
      title: '', brand: '', model: '', year: '', price: '', mileage: '',
      fuelType: '', transmission: '', color: '', condition: '',
      contactNumber: '0723215715', images: []
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setEditingCar(null);
  };

  const handleEdit = (car) => {
    setCarData(car);
    setEditingCar(car);
    setImagePreviews(car.images || []);
    setView('add');
  };

  const handleDelete = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/cars/${carId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        setMessage('Car deleted successfully!');
        fetchCars();
      } else if (response.status === 401) {
        handleUnauthorized();
      } else {
        setMessage('Failed to delete car');
      }
    } catch {
      setMessage('Unable to delete car. Please try again.');
    }
  };

  return (
    <div style={{ backgroundColor: '#f2f4f8', minHeight: '100vh', padding: 'clamp(0.5rem, 2vw, 2rem)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '16px', padding: 'clamp(1rem, 3vw, 2rem)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Admin Panel</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => { setView('add'); resetForm(); }} style={{ backgroundColor: view === 'add' ? '#007BFF' : '#6c757d', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <FaPlus style={{ marginRight: '0.5rem' }} /> {editingCar ? 'Edit Car' : 'Add Car'}
            </button>
            <button onClick={() => setView('list')} style={{ backgroundColor: view === 'list' ? '#007BFF' : '#6c757d', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <FaList style={{ marginRight: '0.5rem' }} /> Manage Cars
            </button>
          </div>
        </div>
        
        {message && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da',
            color: message.includes('success') ? '#155724' : '#721c24',
            border: `1px solid ${message.includes('success') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message}
          </div>
        )}

        {view === 'add' ? (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <input name="title" value={carData.title} onChange={handleInputChange} placeholder="Car Title" required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
            <input name="brand" value={carData.brand} onChange={handleInputChange} placeholder="Brand" required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
            <input name="model" value={carData.model} onChange={handleInputChange} placeholder="Model" required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
            <input name="year" type="number" value={carData.year} onChange={handleInputChange} placeholder="Year" required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
            <input name="price" type="number" value={carData.price} onChange={handleInputChange} placeholder="Price (KES)" required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
            <input name="mileage" type="number" value={carData.mileage} onChange={handleInputChange} placeholder="Mileage (km)" required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <select name="fuelType" value={carData.fuelType} onChange={handleInputChange} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
              <option value="">Select Fuel Type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <select name="transmission" value={carData.transmission} onChange={handleInputChange} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
              <option value="">Select Transmission</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
            <input name="color" value={carData.color} onChange={handleInputChange} placeholder="Color" required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />

            <select name="condition" value={carData.condition} onChange={handleInputChange} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
              <option value="">Select Condition</option>
              <option value="New">New</option>
              <option value="Used">Used</option>

            </select>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
              <FaUpload style={{ marginRight: '0.5rem' }} /> Car Images (Max 3)
            </h4>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', width: '100%', marginBottom: '1rem' }}
            />
            
            {imagePreviews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '25px',
                        height: '25px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '8px', padding: '1rem', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? (editingCar ? 'Updating...' : 'Adding...') : (editingCar ? 'Update Car' : 'Add Car')}
            </button>
            {editingCar && (
              <button type="button" onClick={resetForm} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', padding: '1rem', cursor: 'pointer' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
        ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {cars.map((car) => (
              <div key={car._id} style={{ backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '1rem', border: '1px solid #dee2e6' }}>
                <img src={car.images?.[0] || NO_IMAGE_SVG} alt={car.title} onError={(e) => { e.target.src = NO_IMAGE_SVG; }} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem' }} />
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{car.title}</h4>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#28a745' }}>KES {car.price?.toLocaleString()}</p>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#666' }}>{car.year} • {car.brand} {car.model}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(car)} style={{ flex: 1, backgroundColor: '#ffc107', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaEdit style={{ marginRight: '0.5rem' }} /> Edit
                  </button>
                  <button onClick={() => handleDelete(car._id)} style={{ flex: 1, backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaTrash style={{ marginRight: '0.5rem' }} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
