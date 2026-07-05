import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFilter, FaPhone, FaWhatsapp, FaFacebook, FaInstagram, FaTwitter, FaCog, FaSignOutAlt } from 'react-icons/fa';
import logo from './assets/logo.png';
import AdminPanel from './AdminPanel';
import AdminLogin from './AdminLogin';

const App = () => {
  const [showAdmin, setShowAdmin] = useState(false);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('smvtAdminToken') || '');
  const isAuthenticated = Boolean(authToken);
  const [filters, setFilters] = useState({
    searchTerm: '',
    fuelFilter: '',
    yearFilter: '',
    transmissionFilter: '',
    colorFilter: '',
    maxMileage: '',
  });

  const [showFilters, setShowFilters] = useState(true);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [selectedImageIndexes, setSelectedImageIndexes] = useState({});
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // Fetch cars from backend
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'https://smvt-backend.onrender.com';
        const fullUrl = `${apiUrl}/api/cars`;
        console.log('Fetching from URL:', fullUrl);
        
        const response = await fetch(fullUrl);
        console.log('Response status:', response.status);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        console.log('Fetched cars:', data);
        setCars(data);
        setMessage('');
      } catch (err) {
        console.error('Error fetching cars:', err);
        console.error('API URL:', process.env.REACT_APP_API_URL);
        setMessage(`Unable to connect to server. Error: ${err.message}. Check console for details.`);
        setCars([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const handleImageSelect = (carId, index) => {
    setSelectedImageIndexes((prev) => ({ ...prev, [carId]: index }));
  };

  const toggleExpand = (carId) => {
    setExpandedCardId((prevId) => (prevId === carId ? null : carId));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      fuelFilter: '',
      yearFilter: '',
      transmissionFilter: '',
      colorFilter: '',
      maxMileage: '',
    });
  };

  const handleAdminClick = () => {
    if (isAuthenticated) {
      setShowAdmin(true);
    } else {
      setShowAdmin(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('smvtAdminToken');
    setAuthToken('');
    setShowAdmin(false);
  };

  const handleLogin = (token) => {
    setAuthToken(token);
  };

  const filteredCars = cars.filter((car) => {
    const searchMatch = car.title?.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
                       car.brand?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                       car.model?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const fuelMatch = filters.fuelFilter ? car.fuelType === filters.fuelFilter : true;
    const yearMatch = filters.yearFilter ? car.year?.toString() === filters.yearFilter : true;
    const transmissionMatch = filters.transmissionFilter ? car.transmission === filters.transmissionFilter : true;
    const colorMatch = filters.colorFilter ? car.color?.toLowerCase() === filters.colorFilter.toLowerCase() : true;
    const mileageMatch = filters.maxMileage ? car.mileage <= parseInt(filters.maxMileage) : true;

    return searchMatch && fuelMatch && yearMatch && transmissionMatch && colorMatch && mileageMatch;
  });

  const uniqueOptions = (field) => (
    [...new Set(cars.map((car) => car[field]).filter(Boolean))]
      .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }))
  );

  const fuelOptions = uniqueOptions('fuelType');
  const yearOptions = uniqueOptions('year').sort((a, b) => Number(b) - Number(a));
  const transmissionOptions = uniqueOptions('transmission');
  const colorOptions = uniqueOptions('color');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading cars...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f2f4f8', minHeight: '100vh' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.5rem', backgroundColor: '#ffffffcc', backdropFilter: 'blur(10px)', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
          <img src={logo} alt="Logo" style={{ height: '50px', marginRight: '6px', flexShrink: 0 }} />
          <h2 style={{ margin: 0, fontSize: 'clamp(0.8rem, 3.5vw, 1.2rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>SMVT</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
          <button onClick={() => setShowAdmin(false)} style={{ backgroundColor: showAdmin ? '#6c757d' : '#007BFF', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}>Cars</button>
          <button onClick={handleAdminClick} style={{ backgroundColor: showAdmin ? '#007BFF' : '#6c757d', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}>
            <FaCog />
          </button>
          {isAuthenticated && (
            <button onClick={handleLogout} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}>
              <FaSignOutAlt />
            </button>
          )}
        </div>
      </nav>

      {showAdmin ? (
        isAuthenticated ? <AdminPanel authToken={authToken} onUnauthorized={handleLogout} /> : <AdminLogin onLogin={handleLogin} />
      ) : (
      <div style={{ maxWidth: '1000px', margin: '0.5rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {message && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '8px', 
            backgroundColor: '#fff3cd',
            color: '#856404',
            border: '1px solid #ffeaa7',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            name="searchTerm"
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            placeholder="Search by car name..."
            style={{ flexGrow: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'flex', alignItems: 'center', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1rem', cursor: 'pointer' }}
          >
            <FaFilter style={{ marginRight: '8px' }} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {showFilters && (
          <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 0 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Advanced Filters</h3>
              <button onClick={clearFilters} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>Reset</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <select name="fuelFilter" value={filters.fuelFilter} onChange={(e) => setFilters({ ...filters, fuelFilter: e.target.value })} style={{ padding: '0.5rem', borderRadius: '8px' }}>
                <option value="">Fuel Type</option>
                {fuelOptions.map((fuel) => <option key={fuel} value={fuel}>{fuel}</option>)}
              </select>
              <select name="yearFilter" value={filters.yearFilter} onChange={(e) => setFilters({ ...filters, yearFilter: e.target.value })} style={{ padding: '0.5rem', borderRadius: '8px' }}>
                <option value="">Year</option>
                {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
              <select name="transmissionFilter" value={filters.transmissionFilter} onChange={(e) => setFilters({ ...filters, transmissionFilter: e.target.value })} style={{ padding: '0.5rem', borderRadius: '8px' }}>
                <option value="">Transmission</option>
                {transmissionOptions.map((transmission) => <option key={transmission} value={transmission}>{transmission}</option>)}
              </select>
              <select name="colorFilter" value={filters.colorFilter} onChange={(e) => setFilters({ ...filters, colorFilter: e.target.value })} style={{ padding: '0.5rem', borderRadius: '8px' }}>
                <option value="">Color</option>
                {colorOptions.map((color) => <option key={color} value={color}>{color}</option>)}
              </select>
              <input name="maxMileage" type="number" value={filters.maxMileage} onChange={(e) => setFilters({ ...filters, maxMileage: e.target.value })} placeholder="Max Mileage" style={{ padding: '0.5rem', borderRadius: '8px' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filteredCars.map((car) => (
            <motion.div
              key={car._id}
              layout
              whileHover={{ scale: 1.02 }}
              style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', transition: 'transform 0.3s ease' }}
            >
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', backgroundColor: '#f8f9fa' }}>
                <img
                  src={car.images?.[selectedImageIndexes[car._id] || 0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={car.title}
                  onClick={() => setFullscreenImage(car.images?.[selectedImageIndexes[car._id] || 0])}
                  onError={(e) => {
                    console.log('Image failed to load:', car.images?.[selectedImageIndexes[car._id] || 0]);
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
                  }}
                  style={{ 
                    width: '100%', 
                    height: '200px', 
                    objectFit: 'cover', 
                    borderRadius: '12px',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                />
                {car.images?.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {(selectedImageIndexes[car._id] || 0) + 1}/{car.images.length}
                  </div>
                )}
              </div>
              
              {/* Enhanced Thumbnails */}
              {car.images?.length > 1 && (
                <div style={{ 
                  display: 'flex', 
                  gap: '6px', 
                  marginTop: '12px', 
                  justifyContent: 'center', 
                  flexWrap: 'wrap',
                  padding: '8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  {car.images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img
                        src={img}
                        alt={`Thumb ${idx + 1}`}
                        onClick={() => handleImageSelect(car._id, idx)}
                        onError={(e) => {
                          console.log('Thumbnail failed to load:', img);
                          e.target.src = 'https://via.placeholder.com/50x50?text=X';
                        }}
                        style={{
                          width: '45px',
                          height: '45px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: selectedImageIndexes[car._id] === idx ? '3px solid #007BFF' : '2px solid #e9ecef',
                          opacity: selectedImageIndexes[car._id] === idx ? 1 : 0.6,
                          transition: 'all 0.3s ease',
                          transform: selectedImageIndexes[car._id] === idx ? 'scale(1.1)' : 'scale(1)',
                          boxShadow: selectedImageIndexes[car._id] === idx ? '0 4px 12px rgba(0,123,255,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedImageIndexes[car._id] !== idx) {
                            e.target.style.opacity = '0.8';
                            e.target.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedImageIndexes[car._id] !== idx) {
                            e.target.style.opacity = '0.6';
                            e.target.style.transform = 'scale(1)';
                          }
                        }}
                      />
                      {selectedImageIndexes[car._id] === idx && (
                        <div style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
                          width: '12px',
                          height: '12px',
                          backgroundColor: '#007BFF',
                          borderRadius: '50%',
                          border: '2px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <h4 style={{ marginTop: '1rem' }}>{car.title}</h4>
              <p style={{ fontWeight: 'bold', color: '#28a745', marginBottom: '0.5rem' }}>KES {car.price?.toLocaleString()}</p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>{car.year} • {car.fuelType} • {car.transmission}</p>
              <p style={{ fontSize: '0.85rem', color: '#888' }}>{car.brand} {car.model}</p>
              {expandedCardId === car._id && (
                <div style={{ marginTop: '0.5rem' }}>
                  <p><strong>Mileage:</strong> {car.mileage} km</p>
                  <p><strong>Color:</strong> {car.color}</p>
                  <p><strong>Condition:</strong> {car.condition}</p>
                </div>
              )}
              <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', gap: '0.25rem', flexWrap: 'wrap' }}>
                <button onClick={() => toggleExpand(car._id)} style={{ flexGrow: 1, backgroundColor: '#007BFF', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                  {expandedCardId === car._id ? 'Show Less' : 'Show More'}
                </button>
                <a href={`tel:${car.contactNumber}`} style={{ flexGrow: 1, backgroundColor: '#28a745', color: 'white', padding: '0.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none' }}>
                  <FaPhone style={{ marginRight: '0.5rem' }} /> Call
                </a>
                <a href={`https://wa.me/254${car.contactNumber?.slice(-9)}`} target="_blank" rel="noopener noreferrer" style={{ flexGrow: 1, backgroundColor: '#25D366', color: 'white', padding: '0.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none' }}>
                  <FaWhatsapp style={{ marginRight: '0.5rem' }} /> WhatsApp
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      )}

      <footer style={{ backgroundColor: '#1c1e22', color: '#fff', padding: '1.5rem 1rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <h3 style={{ borderBottom: '2px solid rgb(238, 255, 0)', paddingBottom: '0.5rem' }}>Nairobi Branch</h3>
            <p>📍 local car dealership rd</p>
            <p>✉️ <a href="mailto:info@smvt.com" style={{ color: '#fff' }}>mbaelawrence2013@gmail.com</a></p>
            <p>🕒 Monday to Sunday: 9:00am to 6:00pm</p>
            <p style={{ marginTop: '1rem' }}><strong>📞 0723-215-715</strong></p>
          </div>

          <div>
            <h3 style={{ borderBottom: '2px solid rgb(231, 192, 17)', paddingBottom: '0.5rem' }}>Our Location</h3>
            <iframe
              title="SMVT Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.911875754985!2d36.888385174711004!3d-1.2213493987669972!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1514094c240f%3A0xdf30344c655956f5!2sTee%20Tee%20Club!5e0!3m2!1sen!2ske!4v1764138428043!5m2!1sen!2ske"
              width="100%"
              height="150"
              frameBorder="0"
              style={{ border: 0, borderRadius: '10px' }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#aaa' }}>
          © {new Date().getFullYear()} Signature Motor Vehicle Traders. All rights reserved.
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <a href="https://www.facebook.com/share/1BAet68kxF/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', margin: '0 10px' }}><FaFacebook size={20} /></a>
          <a href="https://instagram.com" style={{ color: '#fff', margin: '0 10px' }}><FaInstagram size={20} /></a>
          <a href="https://twitter.com" style={{ color: '#fff', margin: '0 10px' }}><FaTwitter size={20} /></a>
        </div>
      </footer>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer'
          }}
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            alt="Fullscreen view"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setFullscreenImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
