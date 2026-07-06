import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaTimes, FaUpload, FaEdit, FaTrash, FaList } from 'react-icons/fa';
import { API_URL } from './api';
import './smvt.css';

const NO_IMAGE_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Inter,sans-serif' font-size='14' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E`;

const AdminPanel = ({ authToken, onUnauthorized }) => {
  const [view, setView] = useState('add');
  const [cars, setCars] = useState([]);
  const [editingCar, setEditingCar] = useState(null);
  const [carData, setCarData] = useState({
    title: '', brand: '', model: '', year: '', price: '', mileage: '',
    fuelType: '', transmission: '', color: '', condition: '',
    contactNumber: '0723215715', images: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  });

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleUnauthorized = () => {
    showMessage('Your admin session has expired. Please log in again.', 'error');
    if (onUnauthorized) onUnauthorized();
  };

  const fetchCars = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/cars`);
      if (res.ok) setCars(await res.json());
    } catch {
      showMessage('Unable to load cars.', 'error');
    }
  }, []);

  useEffect(() => {
    if (view === 'list') fetchCars();
  }, [view, fetchCars]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCarData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingCar ? `${API_URL}/api/cars/${editingCar._id}` : `${API_URL}/api/cars`;
      const method = editingCar ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(carData) });
      const data = await res.json();
      if (res.ok) {
        showMessage(editingCar ? 'Car updated successfully!' : 'Car added successfully!', 'success');
        resetForm();
        if (view === 'list') fetchCars();
      } else if (res.status === 401) {
        handleUnauthorized();
      } else {
        showMessage(`Error: ${data?.error || data?.message || 'Failed to save car'}`, 'error');
      }
    } catch {
      showMessage('Unable to save car. Check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
    const promises = files.map(file => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxW = 800, maxH = 600;
          let { width: w, height: h } = img;
          if (w > maxW) { h = (h * maxW) / w; w = maxW; }
          if (h > maxH) { w = (w * maxH) / h; h = maxH; }
          canvas.width = w; canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.65));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }));
    Promise.all(promises).then(imgs => setCarData(prev => ({ ...prev, images: imgs })));
  };

  const removeImage = (i) => {
    setImagePreviews(p => p.filter((_, idx) => idx !== i));
    setCarData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
  };

  const resetForm = () => {
    setCarData({ title: '', brand: '', model: '', year: '', price: '', mileage: '', fuelType: '', transmission: '', color: '', condition: '', contactNumber: '0723215715', images: [] });
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
    if (!window.confirm('Delete this car? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_URL}/api/cars/${carId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${authToken}` } });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { showMessage('Car deleted successfully!', 'success'); fetchCars(); }
      else if (res.status === 401) { handleUnauthorized(); }
      else { showMessage(`Error: ${data?.error || data?.message || 'Failed to delete'}`, 'error'); }
    } catch {
      showMessage('Unable to delete car. Check your connection.', 'error');
    }
  };

  const inputCls = 'form-input';
  const selectCls = 'form-select';

  return (
    <div className="admin-wrap" style={{ paddingTop: '1.25rem', paddingBottom: '3rem' }}>
      <div className="admin-card">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Admin Panel</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '.85rem', marginTop: '.15rem' }}>Manage your vehicle inventory</p>
          </div>
          <div className="admin-tabs">
            <button
              onClick={() => { setView('add'); resetForm(); }}
              className={`btn ${view === 'add' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <FaPlus /> {editingCar ? 'Edit Car' : 'Add Car'}
            </button>
            <button
              onClick={() => setView('list')}
              className={`btn ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <FaList /> Manage
            </button>
          </div>
        </div>

        {/* Alert message */}
        {message.text && (
          <div className={`alert alert--${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1.25rem' }}>
            {message.text}
          </div>
        )}

        {view === 'add' ? (
          <form onSubmit={handleSubmit}>
            {editingCar && (
              <div className="alert alert--warning" style={{ marginBottom: '1rem', fontSize: '.85rem' }}>
                ✏️ Editing: <strong>{editingCar.title}</strong>
              </div>
            )}

            <div className="form-grid-2">
              <input name="title" value={carData.title} onChange={handleInputChange} placeholder="Car Title *" required className={inputCls} />
              <input name="brand" value={carData.brand} onChange={handleInputChange} placeholder="Brand *" required className={inputCls} />
              <input name="model" value={carData.model} onChange={handleInputChange} placeholder="Model *" required className={inputCls} />
              <input name="year" type="number" value={carData.year} onChange={handleInputChange} placeholder="Year *" required className={inputCls} />
              <input name="price" type="number" value={carData.price} onChange={handleInputChange} placeholder="Price (KES) *" required className={inputCls} />
              <input name="mileage" type="number" value={carData.mileage} onChange={handleInputChange} placeholder="Mileage (km) *" required className={inputCls} />
            </div>

            <div className="form-grid-2">
              <select name="fuelType" value={carData.fuelType} onChange={handleInputChange} required className={selectCls}>
                <option value="">Select Fuel Type *</option>
                <option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option>
              </select>
              <select name="transmission" value={carData.transmission} onChange={handleInputChange} required className={selectCls}>
                <option value="">Select Transmission *</option>
                <option>Automatic</option><option>Manual</option>
              </select>
              <input name="color" value={carData.color} onChange={handleInputChange} placeholder="Color *" required className={inputCls} />
              <select name="condition" value={carData.condition} onChange={handleInputChange} required className={selectCls}>
                <option value="">Select Condition *</option>
                <option>New</option><option>Used</option>
              </select>
            </div>

            {/* Image upload */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '.6rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                <FaUpload /> Car Images <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(max 3)</span>
              </p>
              <label className="image-upload-zone">
                <input type="file" multiple accept="image/*" onChange={handleFileSelect} />
                <div style={{ pointerEvents: 'none' }}>
                  <FaUpload size={24} style={{ marginBottom: '.4rem', opacity: .5 }} />
                  <p style={{ fontWeight: 600 }}>Tap to select photos</p>
                  <p style={{ fontSize: '.8rem', color: 'var(--text-3)', marginTop: '.2rem' }}>JPG, PNG, WebP — up to 3 images</p>
                </div>
              </label>
              {imagePreviews.length > 0 && (
                <div className="image-previews">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="preview-item">
                      <img src={src} alt={`Preview ${i + 1}`} />
                      <button type="button" className="preview-remove" onClick={() => removeImage(i)} aria-label="Remove image">
                        <FaTimes size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                {loading ? (editingCar ? 'Updating…' : 'Adding…') : (editingCar ? 'Update Car' : 'Add Car')}
              </button>
              {editingCar && (
                <button type="button" onClick={resetForm} className="btn btn-ghost btn-lg">Cancel</button>
              )}
            </div>
          </form>
        ) : (
          <div>
            <p style={{ color: 'var(--text-2)', fontSize: '.875rem', marginBottom: '1rem' }}>
              {cars.length} car{cars.length !== 1 ? 's' : ''} in inventory
            </p>
            <div className="manage-grid">
              {cars.map((car) => (
                <div key={car._id} className="manage-card">
                  <img
                    src={car.images?.[0] || NO_IMAGE_SVG}
                    alt={car.title}
                    className="manage-card-img"
                    onError={(e) => { e.target.src = NO_IMAGE_SVG; }}
                  />
                  <div className="manage-card-info">
                    <div className="manage-card-title">{car.title}</div>
                    <div className="manage-card-price">KES {car.price?.toLocaleString()}</div>
                    <div className="manage-card-meta">{car.year} · {car.brand} {car.model}</div>
                  </div>
                  <div className="manage-card-actions">
                    <button onClick={() => handleEdit(car)} className="btn btn-warning btn-sm">
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => handleDelete(car._id)} className="btn btn-danger btn-sm">
                      <FaTrash /> Del
                    </button>
                  </div>
                </div>
              ))}
              {cars.length === 0 && (
                <p style={{ color: 'var(--text-3)', textAlign: 'center', padding: '2rem' }}>
                  No cars added yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
