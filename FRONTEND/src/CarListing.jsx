import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaFilter, FaPhone, FaWhatsapp, FaFacebook, FaInstagram,
  FaTwitter, FaCog, FaSignOutAlt, FaCarSide, FaGasPump,
  FaCogs, FaPalette, FaTachometerAlt, FaCalendarAlt, FaTimes
} from 'react-icons/fa';
import logo from './assets/logo.png';
import AdminPanel from './AdminPanel';
import AdminLogin from './AdminLogin';
import { API_URL } from './api';
import './smvt.css';

const NO_IMAGE_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect width='400' height='260' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Inter,sans-serif' font-size='14' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E`;

const SkeletonCard = () => (
  <div className="car-card" style={{ padding: '0' }}>
    <div className="skeleton" style={{ height: '210px', borderRadius: 'var(--radius) var(--radius) 0 0' }} />
    <div className="car-body" style={{ gap: '.5rem' }}>
      <div className="skeleton" style={{ height: '16px', width: '70%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '20px', width: '45%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '14px', width: '90%', borderRadius: '6px' }} />
      <div className="skeleton" style={{ height: '40px', borderRadius: '8px', marginTop: '.5rem' }} />
    </div>
  </div>
);

const App = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const [showAdmin, setShowAdmin] = useState(searchParams.get('admin') === 'true');
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

  const [showFilters, setShowFilters] = useState(false);
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
      } catch {
        setError('Unable to load inventory. Please try again shortly.');
        setCars([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  // Close filter on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setFullscreenImage(null); setShowFilters(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const clearFilters = () =>
    setFilters({ searchTerm: '', fuelFilter: '', yearFilter: '', transmissionFilter: '', colorFilter: '', maxMileage: '' });

  const handleLogout = () => {
    localStorage.removeItem('smvtAdminToken');
    setAuthToken('');
    setShowAdmin(false);
  };

  const filteredCars = cars.filter((car) => {
    const q = filters.searchTerm.toLowerCase();
    const searchMatch = !q || car.title?.toLowerCase().includes(q) || car.brand?.toLowerCase().includes(q) || car.model?.toLowerCase().includes(q);
    const fuelMatch = !filters.fuelFilter || car.fuelType === filters.fuelFilter;
    const yearMatch = !filters.yearFilter || car.year?.toString() === filters.yearFilter;
    const transmissionMatch = !filters.transmissionFilter || car.transmission === filters.transmissionFilter;
    const colorMatch = !filters.colorFilter || car.color?.toLowerCase() === filters.colorFilter.toLowerCase();
    const mileageMatch = !filters.maxMileage || car.mileage <= parseInt(filters.maxMileage);
    return searchMatch && fuelMatch && yearMatch && transmissionMatch && colorMatch && mileageMatch;
  });

  const uniqueOptions = (field) =>
    [...new Set(cars.map((c) => c[field]).filter(Boolean))].sort((a, b) =>
      String(a).localeCompare(String(b), undefined, { numeric: true })
    );

  const fuelOptions = uniqueOptions('fuelType');
  const yearOptions = uniqueOptions('year').sort((a, b) => Number(b) - Number(a));
  const transmissionOptions = uniqueOptions('transmission');
  const colorOptions = uniqueOptions('color');

  const activeFilterCount = [
    filters.fuelFilter, filters.yearFilter, filters.transmissionFilter,
    filters.colorFilter, filters.maxMileage
  ].filter(Boolean).length;

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <img src={logo} alt="SMVT Logo" className="navbar-logo" />
          <span className="navbar-name">SMVT</span>
        </div>
        <div className="navbar-actions">
          <button
            onClick={() => setShowAdmin(false)}
            className={`btn ${showAdmin ? 'btn-secondary' : 'btn-primary'}`}
            aria-label="View car listings"
          >
            <FaCarSide /> <span className="sr-only-mobile">Cars</span>
          </button>
          <button
            onClick={() => setShowAdmin(true)}
            className={`btn ${showAdmin ? 'btn-primary' : 'btn-secondary'}`}
            aria-label="Open admin panel"
          >
            <FaCog /> <span className="sr-only-mobile">Admin</span>
          </button>
          {isAuthenticated && (
            <button onClick={handleLogout} className="btn btn-danger btn-icon" aria-label="Logout">
              <FaSignOutAlt />
            </button>
          )}
        </div>
      </nav>

      {showAdmin ? (
        isAuthenticated
          ? <AdminPanel authToken={authToken} onUnauthorized={handleLogout} />
          : <AdminLogin onLogin={(token) => setAuthToken(token)} />
      ) : (
        <>
          {/* ── Hero ── */}
          <div className="hero">
            <h1>Find Your Perfect Car</h1>
            <p>Browse our premium selection of quality vehicles — new &amp; used — at the best prices in Nairobi.</p>
          </div>

          <div className="main-wrapper">

            {error && (
              <div className="alert alert--error" role="alert">{error}</div>
            )}

            {/* ── Search + filter toggle ── */}
            <div className="search-bar">
              <input
                id="search-input"
                name="searchTerm"
                type="search"
                className="search-input"
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                placeholder="Search make, model or title…"
                aria-label="Search cars"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-primary"
                aria-expanded={showFilters}
                aria-label="Toggle filters"
                style={{ position: 'relative', flexShrink: 0 }}
              >
                <FaFilter />
                {activeFilterCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    background: '#ef4444', color: '#fff', borderRadius: '50%',
                    width: '18px', height: '18px', fontSize: '.7rem',
                    fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{activeFilterCount}</span>
                )}
                <span style={{ display: 'none' }} className="desktop-only">
                  {showFilters ? 'Hide' : 'Filters'}
                </span>
              </button>
            </div>

            {/* ── Filter panel ── */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: .16 }}
                  className="filter-panel"
                >
                  <div className="filter-header">
                    <strong style={{ fontSize: '.95rem' }}>Filter Inventory</strong>
                    <button onClick={clearFilters} className="btn btn-danger btn-sm">
                      <FaTimes /> Reset
                    </button>
                  </div>
                  <div className="filter-grid">
                    <select id="fuel-filter" className="filter-select" value={filters.fuelFilter}
                      onChange={(e) => setFilters({ ...filters, fuelFilter: e.target.value })} aria-label="Fuel type">
                      <option value="">⛽ Fuel</option>
                      {fuelOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <select id="year-filter" className="filter-select" value={filters.yearFilter}
                      onChange={(e) => setFilters({ ...filters, yearFilter: e.target.value })} aria-label="Year">
                      <option value="">📅 Year</option>
                      {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select id="transmission-filter" className="filter-select" value={filters.transmissionFilter}
                      onChange={(e) => setFilters({ ...filters, transmissionFilter: e.target.value })} aria-label="Transmission">
                      <option value="">⚙️ Trans.</option>
                      {transmissionOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select id="color-filter" className="filter-select" value={filters.colorFilter}
                      onChange={(e) => setFilters({ ...filters, colorFilter: e.target.value })} aria-label="Color">
                      <option value="">🎨 Color</option>
                      {colorOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input id="mileage-filter" type="number" min="0" className="filter-input" value={filters.maxMileage}
                      onChange={(e) => setFilters({ ...filters, maxMileage: e.target.value })}
                      placeholder="🏁 Max km" aria-label="Max mileage" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Results count ── */}
            {!loading && (
              <p className="results-count">
                {filteredCars.length === 0 && !error
                  ? 'No cars match your filters.'
                  : `Showing ${filteredCars.length} car${filteredCars.length !== 1 ? 's' : ''}`}
              </p>
            )}

            {/* ── Car grid ── */}
            <div className="car-grid">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : filteredCars.map((car) => {
                    const imgIdx = selectedImageIndexes[car._id] || 0;
                    const currentImage = car.images?.[imgIdx] || NO_IMAGE_SVG;
                    const isExpanded = expandedCardId === car._id;

                    return (
                      <motion.article
                        key={car._id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: .22 }}
                        className="car-card"
                      >
                        {/* Image */}
                        <div className="car-image-wrap">
                          <img
                            src={currentImage}
                            alt={`${car.title} — view ${imgIdx + 1}`}
                            className="car-image"
                            onClick={() => car.images?.length && setFullscreenImage(currentImage)}
                            onError={(e) => { e.target.src = NO_IMAGE_SVG; }}
                            style={{ cursor: car.images?.length ? 'zoom-in' : 'default' }}
                          />
                          {car.condition && (
                            <span className={`car-badge ${car.condition === 'New' ? 'car-badge--new' : 'car-badge--used'}`}>
                              {car.condition}
                            </span>
                          )}
                          {car.images?.length > 1 && (
                            <span className="car-img-counter">{imgIdx + 1}/{car.images.length}</span>
                          )}
                        </div>

                        {/* Thumbnails */}
                        {car.images?.length > 1 && (
                          <div className="car-thumbs">
                            {car.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                className={`car-thumb ${imgIdx === idx ? 'active' : ''}`}
                                onClick={() => setSelectedImageIndexes((p) => ({ ...p, [car._id]: idx }))}
                                onError={(e) => { e.target.src = NO_IMAGE_SVG; }}
                              />
                            ))}
                          </div>
                        )}

                        {/* Body */}
                        <div className="car-body">
                          <h3 className="car-title">{car.title}</h3>
                          <p className="car-price">KES {car.price?.toLocaleString()}</p>

                          <div className="car-meta">
                            <span className="car-pill"><FaCalendarAlt />{car.year}</span>
                            <span className="car-pill"><FaGasPump />{car.fuelType}</span>
                            <span className="car-pill"><FaCogs />{car.transmission}</span>
                          </div>

                          {/* Expanded details */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: .18 }}
                                className="car-details-expanded"
                              >
                                <div><strong>Brand</strong><br />{car.brand}</div>
                                <div><strong>Model</strong><br />{car.model}</div>
                                <div><strong><FaTachometerAlt /> Mileage</strong><br />{car.mileage?.toLocaleString()} km</div>
                                <div><strong><FaPalette /> Color</strong><br />{car.color}</div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Actions */}
                          <div className="car-actions">
                            <button
                              className={`btn ${isExpanded ? 'btn-ghost' : 'btn-primary'}`}
                              onClick={() => setExpandedCardId((p) => p === car._id ? null : car._id)}
                            >
                              {isExpanded ? 'Less' : 'Details'}
                            </button>
                            <a
                              href={`tel:${car.contactNumber}`}
                              className="btn btn-success"
                              aria-label={`Call about ${car.title}`}
                            >
                              <FaPhone /> Call
                            </a>
                            <a
                              href={`https://wa.me/254${String(car.contactNumber).replace(/^0/, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-wa"
                              aria-label={`WhatsApp about ${car.title}`}
                            >
                              <FaWhatsapp /> WA
                            </a>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
            </div>

            {/* Empty state */}
            {!loading && filteredCars.length === 0 && !error && (
              <div className="empty-state">
                <FaCarSide size={48} />
                <p style={{ fontWeight: 600 }}>No cars found</p>
                <p>Try adjusting your filters or search term.</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <footer className="footer">
            <div className="footer-grid">
              <div>
                <h3>Nairobi Branch</h3>
                <p>📍 Local Car Dealership Rd, Nairobi</p>
                <p>✉️ <a href="mailto:mbaelawrence2013@gmail.com">mbaelawrence2013@gmail.com</a></p>
                <p>🕒 Mon – Sun: 9:00 am – 6:00 pm</p>
                <p style={{ fontWeight: 700, marginTop: '.5rem' }}>📞 0723-215-715</p>
              </div>
              <div>
                <h3>Our Location</h3>
                <iframe
                  title="SMVT Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.911875754985!2d36.888385174711004!3d-1.2213493987669972!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1514094c240f%3A0xdf30344c655956f5!2sTee%20Tee%20Club!5e0!3m2!1sen!2ske!4v1764138428043!5m2!1sen!2ske"
                  width="100%"
                  height="160"
                  style={{ border: 0, borderRadius: 'var(--radius)', display: 'block', marginTop: '.5rem', opacity: .9 }}
                  allowFullScreen=""
                  loading="lazy"
                />
              </div>
            </div>

            <div className="footer-bottom">
              <span>© {new Date().getFullYear()} Signature Motor Vehicle Traders. All rights reserved.</span>
              <div className="footer-socials">
                <a href="https://www.facebook.com/share/1BAet68kxF/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* ── Fullscreen image modal ── */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Fullscreen image"
            onClick={() => setFullscreenImage(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src={fullscreenImage}
              alt="Full size view"
              className="modal-img"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: .9 }}
              animate={{ scale: 1 }}
              exit={{ scale: .9 }}
            />
            <button className="modal-close" onClick={() => setFullscreenImage(null)} aria-label="Close image">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
