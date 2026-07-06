import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFilter, FaPhone, FaWhatsapp, FaFacebook, FaInstagram, FaTwitter, FaCog, FaSignOutAlt, FaCarSide } from 'react-icons/fa';
import logo from './assets/logo.png';
import AdminPanel from './AdminPanel';
import AdminLogin from './AdminLogin';
import { API_URL } from './api';

// Inline SVG placeholder — no external dependency
const NO_IMAGE_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23e9ecef'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Inter,sans-serif' font-size='14' fill='%236c757d'%3ENo Image%3C/text%3E%3C/svg%3E`;

const App = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const initialShowAdmin = searchParams.get('admin') === 'true';
  const [showAdmin, setShowAdmin] = useState(initialShowAdmin);
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
  const [error, setError] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch(`${API_URL}/api/cars`);
        if (!response.ok) throw new Error(`Server error (${response.status})`);
        const data = await response.json();
        setCars(data);
        setError('');
      } catch (err) {
        setError('Unable to load inventory. Please try again shortly.');
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
    setFilters({ searchTerm: '', fuelFilter: '', yearFilter: '', transmissionFilter: '', colorFilter: '', maxMileage: '' });
  };

  const handleAdminClick = () => setShowAdmin(true);

  const handleLogout = () => {
    localStorage.removeItem('smvtAdminToken');
    setAuthToken('');
    setShowAdmin(false);
  };

  const handleLogin = (token) => setAuthToken(token);

  const filteredCars = cars.filter((car) => {
    const q = filters.searchTerm.toLowerCase();
    const searchMatch = !q ||
      car.title?.toLowerCase().includes(q) ||
      car.brand?.toLowerCase().includes(q) ||
      car.model?.toLowerCase().includes(q);
    const fuelMatch = !filters.fuelFilter || car.fuelType === filters.fuelFilter;
    const yearMatch = !filters.yearFilter || car.year?.toString() === filters.yearFilter;
    const transmissionMatch = !filters.transmissionFilter || car.transmission === filters.transmissionFilter;
    const colorMatch = !filters.colorFilter || car.color?.toLowerCase() === filters.colorFilter.toLowerCase();
    const mileageMatch = !filters.maxMileage || car.mileage <= parseInt(filters.maxMileage);
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

  const selectStyle = {
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    background: 'white',
    fontSize: '0.9rem',
    color: '#333',
    cursor: 'pointer',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: '1rem', fontFamily: 'Inter, sans-serif' }}>
        <FaCarSide size={40} color="#007BFF" style={{ animation: 'none' }} />
        <p style={{ color: '#555', fontSize: '1rem' }}>Loading inventory...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f2f4f8', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1.5rem', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={logo} alt="SMVT Logo" style={{ height: '48px', flexShrink: 0 }} />
          <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1a1a2e', letterSpacing: '-0.3px' }}>SMVT</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={() => setShowAdmin(false)}
            aria-label="View car listings"
            style={{ backgroundColor: showAdmin ? '#6c757d' : '#007BFF', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1.1rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', fontFamily: 'inherit' }}
          >
            Cars
          </button>
          <button
            onClick={handleAdminClick}
            aria-label="Open admin panel"
            style={{ backgroundColor: showAdmin ? '#007BFF' : '#6c757d', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.9rem', fontFamily: 'inherit' }}
          >
            <FaCog /> Admin Panel
          </button>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              aria-label="Logout"
              style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.9rem', fontFamily: 'inherit' }}
            >
              <FaSignOutAlt /> Logout
            </button>
          )}
        </div>
      </nav>

      {showAdmin ? (
        isAuthenticated
          ? <AdminPanel authToken={authToken} onUnauthorized={handleLogout} />
          : <AdminLogin onLogin={handleLogin} />
      ) : (
        <div style={{ maxWidth: '1100px', margin: '1.5rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {error && (
            <div role="alert" style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffc107', textAlign: 'center', fontWeight: '500' }}>
              {error}
            </div>
          )}

          {/* Search + filter toggle */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              id="search-input"
              name="searchTerm"
              type="search"
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              placeholder="Search by make, model or title..."
              aria-label="Search cars"
              style={{ flexGrow: 1, padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #dee2e6', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none' }}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              aria-label="Toggle filters"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '10px', padding: '0.75rem 1.1rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
            >
              <FaFilter /> {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1a1a2e' }}>Filter Inventory</h2>
                <button onClick={clearFilters} style={{ ...selectStyle, backgroundColor: '#dc3545', color: 'white', border: 'none', fontWeight: '600', fontFamily: 'inherit', padding: '0.4rem 0.9rem' }}>Reset</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                <select id="fuel-filter" name="fuelFilter" value={filters.fuelFilter} onChange={(e) => setFilters({ ...filters, fuelFilter: e.target.value })} aria-label="Filter by fuel type" style={selectStyle}>
                  <option value="">Fuel Type</option>
                  {fuelOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <select id="year-filter" name="yearFilter" value={filters.yearFilter} onChange={(e) => setFilters({ ...filters, yearFilter: e.target.value })} aria-label="Filter by year" style={selectStyle}>
                  <option value="">Year</option>
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <select id="transmission-filter" name="transmissionFilter" value={filters.transmissionFilter} onChange={(e) => setFilters({ ...filters, transmissionFilter: e.target.value })} aria-label="Filter by transmission" style={selectStyle}>
                  <option value="">Transmission</option>
                  {transmissionOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select id="color-filter" name="colorFilter" value={filters.colorFilter} onChange={(e) => setFilters({ ...filters, colorFilter: e.target.value })} aria-label="Filter by color" style={selectStyle}>
                  <option value="">Color</option>
                  {colorOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input id="mileage-filter" name="maxMileage" type="number" min="0" value={filters.maxMileage} onChange={(e) => setFilters({ ...filters, maxMileage: e.target.value })} placeholder="Max Mileage (km)" aria-label="Maximum mileage" style={selectStyle} />
              </div>
            </div>
          )}

          {/* Results count */}
          {!loading && (
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', fontWeight: '500' }}>
              {filteredCars.length === 0
                ? 'No cars match your search.'
                : `Showing ${filteredCars.length} car${filteredCars.length !== 1 ? 's' : ''}`}
            </p>
          )}

          {/* Car grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
            {filteredCars.map((car) => {
              const currentImageIndex = selectedImageIndexes[car._id] || 0;
              const currentImage = car.images?.[currentImageIndex] || NO_IMAGE_SVG;

              return (
                <motion.article
                  key={car._id}
                  layout
                  whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.13)' }}
                  style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', transition: 'box-shadow 0.2s ease' }}
                >
                  {/* Main image */}
                  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', backgroundColor: '#f8f9fa' }}>
                    <img
                      src={currentImage}
                      alt={`${car.title} — view ${currentImageIndex + 1}`}
                      onClick={() => car.images?.length && setFullscreenImage(currentImage)}
                      onError={(e) => { e.target.src = NO_IMAGE_SVG; }}
                      style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', cursor: car.images?.length ? 'zoom-in' : 'default', display: 'block' }}
                    />
                    {car.images?.length > 1 && (
                      <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.65)', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                        {currentImageIndex + 1}/{car.images.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {car.images?.length > 1 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {car.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleImageSelect(car._id, idx)}
                          aria-label={`View image ${idx + 1}`}
                          style={{ padding: 0, background: 'none', border: `2px solid ${selectedImageIndexes[car._id] === idx ? '#007BFF' : '#dee2e6'}`, borderRadius: '6px', cursor: 'pointer', opacity: selectedImageIndexes[car._id] === idx ? 1 : 0.6, transition: 'all 0.2s' }}
                        >
                          <img src={img} alt={`Thumbnail ${idx + 1}`} onError={(e) => { e.target.src = NO_IMAGE_SVG; }} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', display: 'block' }} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Car details */}
                  <h3 style={{ margin: '0.9rem 0 0.3rem', fontSize: '1rem', fontWeight: '700', color: '#1a1a2e', lineHeight: 1.3 }}>{car.title}</h3>
                  <p style={{ fontWeight: '700', color: '#28a745', margin: '0 0 0.3rem', fontSize: '1.05rem' }}>KES {car.price?.toLocaleString()}</p>
                  <p style={{ fontSize: '0.875rem', color: '#555', margin: '0 0 0.2rem' }}>{car.year} &bull; {car.fuelType} &bull; {car.transmission}</p>
                  <p style={{ fontSize: '0.825rem', color: '#888', margin: 0 }}>{car.brand} {car.model}</p>

                  {/* Expanded details */}
                  {expandedCardId === car._id && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '8px', fontSize: '0.875rem' }}>
                      <p style={{ margin: '0 0 0.3rem' }}><strong>Mileage:</strong> {car.mileage?.toLocaleString()} km</p>
                      <p style={{ margin: '0 0 0.3rem' }}><strong>Color:</strong> {car.color}</p>
                      <p style={{ margin: 0 }}><strong>Condition:</strong> {car.condition}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ marginTop: '0.9rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => toggleExpand(car._id)}
                      style={{ flexGrow: 1, backgroundColor: expandedCardId === car._id ? '#6c757d' : '#007BFF', color: 'white', border: 'none', padding: '0.55rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', fontFamily: 'inherit' }}
                    >
                      {expandedCardId === car._id ? 'Show Less' : 'Show More'}
                    </button>
                    <a
                      href={`tel:${car.contactNumber}`}
                      aria-label={`Call about ${car.title}`}
                      style={{ flexGrow: 1, backgroundColor: '#28a745', color: 'white', padding: '0.55rem', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem' }}
                    >
                      <FaPhone /> Call
                    </a>
                    <a
                      href={`https://wa.me/254${String(car.contactNumber).replace(/^0/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp about ${car.title}`}
                      style={{ flexGrow: 1, backgroundColor: '#25D366', color: 'white', padding: '0.55rem', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem' }}
                    >
                      <FaWhatsapp /> WhatsApp
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: '#1c1e22', color: '#fff', padding: '2rem 1.5rem', marginTop: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '1100px', margin: '0 auto', fontFamily: 'inherit' }}>
          <div>
            <h2 style={{ borderBottom: '2px solid #eeff00', paddingBottom: '0.5rem', fontSize: '1rem', fontWeight: '700' }}>Nairobi Branch</h2>
            <p style={{ margin: '0.5rem 0' }}>📍 Local Car Dealership Rd, Nairobi</p>
            <p style={{ margin: '0.5rem 0' }}>✉️ <a href="mailto:mbaelawrence2013@gmail.com" style={{ color: '#adb5bd' }}>mbaelawrence2013@gmail.com</a></p>
            <p style={{ margin: '0.5rem 0' }}>🕒 Mon – Sun: 9:00 am – 6:00 pm</p>
            <p style={{ margin: '0.75rem 0 0', fontWeight: '700', fontSize: '1rem' }}>📞 0723-215-715</p>
          </div>
          <div>
            <h2 style={{ borderBottom: '2px solid #e7c011', paddingBottom: '0.5rem', fontSize: '1rem', fontWeight: '700' }}>Our Location</h2>
            <iframe
              title="SMVT Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.911875754985!2d36.888385174711004!3d-1.2213493987669972!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1514094c240f%3A0xdf30344c655956f5!2sTee%20Tee%20Club!5e0!3m2!1sen!2ske!4v1764138428043!5m2!1sen!2ske"
              width="100%"
              height="150"
              style={{ border: 0, borderRadius: '10px', display: 'block', marginTop: '0.5rem' }}
              allowFullScreen=""
              loading="lazy"
            />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: '#6c757d' }}>
          © {new Date().getFullYear()} Signature Motor Vehicle Traders. All rights reserved.
        </div>

        <div style={{ textAlign: 'center', marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <a href="https://www.facebook.com/share/1BAet68kxF/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: '#adb5bd' }}><FaFacebook size={20} /></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: '#adb5bd' }}><FaInstagram size={20} /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" style={{ color: '#adb5bd' }}><FaTwitter size={20} /></a>
        </div>
      </footer>

      {/* Fullscreen image modal */}
      {fullscreenImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen image"
          onClick={() => setFullscreenImage(null)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'zoom-out' }}
        >
          <img
            src={fullscreenImage}
            alt="Full size view"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '92vw', maxHeight: '92vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
          />
          <button
            onClick={() => setFullscreenImage(null)}
            aria-label="Close image"
            style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: '50%', width: '42px', height: '42px', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
