import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaFilter, FaPhone, FaWhatsapp, FaFacebook, FaInstagram,
  FaTwitter, FaCog, FaSignOutAlt, FaCarSide, FaGasPump,
  FaCogs, FaTachometerAlt, FaCalendarAlt, FaTimes, FaChevronDown,
  FaStar, FaCheckCircle, FaPalette
} from 'react-icons/fa';
import logo from './assets/logo.png';
import AdminPanel from './AdminPanel';
import AdminLogin from './AdminLogin';
import { API_URL } from './api';
import './smvt.css';

const NO_IMAGE_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect width='400' height='260' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Inter,sans-serif' font-size='14' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E`;

const SkeletonCard = () => (
  <div className="car-card">
    <div className="skeleton" style={{ height: '215px' }} />
    <div className="car-body" style={{ gap: '.6rem' }}>
      <div className="skeleton" style={{ height: '15px', width: '65%' }} />
      <div className="skeleton" style={{ height: '22px', width: '42%' }} />
      <div style={{ display: 'flex', gap: '.4rem' }}>
        <div className="skeleton" style={{ height: '24px', width: '60px', borderRadius: '20px' }} />
        <div className="skeleton" style={{ height: '24px', width: '70px', borderRadius: '20px' }} />
        <div className="skeleton" style={{ height: '24px', width: '65px', borderRadius: '20px' }} />
      </div>
      <div className="skeleton" style={{ height: '44px', borderRadius: '8px', marginTop: '.4rem' }} />
    </div>
  </div>
);

const CONTACT = '0723215715';
const WA_NUM  = `254${CONTACT.replace(/^0/, '')}`;

const App = () => {
  const [showAdmin, setShowAdmin]   = useState(new URLSearchParams(window.location.search).get('admin') === 'true');
  const [authToken, setAuthToken]   = useState(() => localStorage.getItem('smvtAdminToken') || '');
  const isAuthenticated             = Boolean(authToken);

  const [filters, setFilters] = useState({ searchTerm: '', fuelFilter: '', yearFilter: '', transmissionFilter: '', colorFilter: '', maxMileage: '' });
  const [showFilters, setShowFilters]     = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [selectedImgIdx, setSelectedImgIdx] = useState({});
  const [cars, setCars]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [fullscreenImg, setFullscreenImg] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/cars`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setCars(d); setLoading(false); })
      .catch(() => { setError('Unable to load inventory. Please try again shortly.'); setLoading(false); });
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setFullscreenImg(null); setShowFilters(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const setFilter = (k, v) => setFilters(p => ({ ...p, [k]: v }));
  const clearFilters = () => setFilters({ searchTerm: '', fuelFilter: '', yearFilter: '', transmissionFilter: '', colorFilter: '', maxMileage: '' });
  const handleLogout = () => { localStorage.removeItem('smvtAdminToken'); setAuthToken(''); setShowAdmin(false); };

  const filtered = cars.filter(c => {
    const q = filters.searchTerm.toLowerCase();
    return (!q || [c.title, c.brand, c.model].some(f => f?.toLowerCase().includes(q)))
      && (!filters.fuelFilter         || c.fuelType     === filters.fuelFilter)
      && (!filters.yearFilter         || c.year?.toString() === filters.yearFilter)
      && (!filters.transmissionFilter || c.transmission === filters.transmissionFilter)
      && (!filters.colorFilter        || c.color?.toLowerCase() === filters.colorFilter.toLowerCase())
      && (!filters.maxMileage         || c.mileage <= parseInt(filters.maxMileage));
  });

  const uniq = f => [...new Set(cars.map(c => c[f]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  const yearOpts = uniq('year').sort((a, b) => Number(b) - Number(a));
  const activeFltCount = [filters.fuelFilter, filters.yearFilter, filters.transmissionFilter, filters.colorFilter, filters.maxMileage].filter(Boolean).length;

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <img src={logo} alt="SMVT Logo" className="navbar-logo" />
          <span className="navbar-name">SMV<span>T</span></span>
        </div>
        <div className="navbar-actions">
          <button onClick={() => setShowAdmin(false)} className={`btn btn-nav ${!showAdmin ? 'active' : ''}`} aria-label="Car listings">
            <FaCarSide />
            <span style={{ display: 'none', '@media(min-width:480px)': { display: 'inline' } }}> Cars</span>
          </button>
          <button onClick={() => setShowAdmin(true)} className={`btn btn-nav ${showAdmin ? 'active' : ''}`} aria-label="Admin panel">
            <FaCog />
          </button>
          {isAuthenticated && (
            <button onClick={handleLogout} className="btn btn-danger btn-icon" aria-label="Logout" title="Logout">
              <FaSignOutAlt size={14} />
            </button>
          )}
        </div>
      </nav>

      {showAdmin ? (
        isAuthenticated ? <AdminPanel authToken={authToken} onUnauthorized={handleLogout} /> : <AdminLogin onLogin={setAuthToken} />
      ) : (
        <>
          {/* ── Hero ── */}
          <section className="hero">
            <div className="hero-content">
              <div className="hero-eyebrow"><FaStar size={10} /> Nairobi's Premier Car Dealership</div>
              <h1>Drive Your <span>Dream Car</span><br />Today</h1>
              <p>Browse our handpicked selection of quality new &amp; used vehicles — best prices guaranteed in Nairobi.</p>
              <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href={`https://wa.me/${WA_NUM}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
                  <FaWhatsapp /> Chat with Us
                </a>
                <a href={`tel:${CONTACT}`} className="btn btn-outline-gold btn-lg">
                  <FaPhone /> Call Now
                </a>
              </div>
              <div className="hero-stats">
                <div className="hero-stat"><div className="hero-stat-num">{cars.length || '50'}+</div><div className="hero-stat-label">Cars Available</div></div>
                <div className="hero-stat"><div className="hero-stat-num">7+</div><div className="hero-stat-label">Years Experience</div></div>
                <div className="hero-stat"><div className="hero-stat-num">500+</div><div className="hero-stat-label">Happy Clients</div></div>
              </div>
            </div>
          </section>

          <div className="main-wrapper">
            {error && <div className="alert alert--error" role="alert">{error}</div>}

            {/* ── Search ── */}
            <div className="search-wrap">
              <FaCarSide size={20} color="var(--gold)" style={{ flexShrink: 0 }} />
              <input
                id="search-input" type="search" className="search-input"
                value={filters.searchTerm}
                onChange={e => setFilter('searchTerm', e.target.value)}
                placeholder="Search make, model or title…"
                aria-label="Search cars"
              />
              <button
                onClick={() => setShowFilters(v => !v)}
                className={`btn ${showFilters || activeFltCount ? 'btn-primary' : 'btn-ghost'}`}
                aria-expanded={showFilters}
                style={{ position: 'relative', flexShrink: 0 }}
              >
                <FaFilter />
                {activeFltCount > 0 && (
                  <span style={{ position: 'absolute', top: '-7px', right: '-7px', background: 'var(--red)', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {activeFltCount}
                  </span>
                )}
                <FaChevronDown size={11} style={{ transition: 'transform .2s', transform: showFilters ? 'rotate(180deg)' : 'none' }} />
              </button>
            </div>

            {/* ── Filters ── */}
            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .16 }} className="filter-panel">
                  <div className="filter-header">
                    <strong style={{ fontSize: '.95rem', color: 'var(--text)' }}>Refine Results</strong>
                    {activeFltCount > 0 && <button onClick={clearFilters} className="btn btn-danger btn-sm"><FaTimes /> Reset</button>}
                  </div>
                  <div className="filter-grid">
                    {[
                      { id: 'fuel-filter',         label: '⛽ Fuel',   key: 'fuelFilter',         opts: uniq('fuelType') },
                      { id: 'year-filter',         label: '📅 Year',   key: 'yearFilter',         opts: yearOpts },
                      { id: 'trans-filter',        label: '⚙️ Trans.', key: 'transmissionFilter', opts: uniq('transmission') },
                      { id: 'color-filter',        label: '🎨 Color',  key: 'colorFilter',        opts: uniq('color') },
                    ].map(({ id, label, key, opts }) => (
                      <select key={id} id={id} className="filter-select" value={filters[key]} onChange={e => setFilter(key, e.target.value)} aria-label={label}>
                        <option value="">{label}</option>
                        {opts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ))}
                    <input type="number" min="0" className="filter-input" value={filters.maxMileage} onChange={e => setFilter('maxMileage', e.target.value)} placeholder="🏁 Max km" aria-label="Max mileage" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!loading && (
              <p className="results-count">
                {filtered.length === 0 ? 'No cars match your filters.' : `${filtered.length} car${filtered.length !== 1 ? 's' : ''} found`}
              </p>
            )}

            {/* ── Car Grid ── */}
            <div className="car-grid">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : filtered.map(car => {
                    const imgIdx = selectedImgIdx[car._id] || 0;
                    const img    = car.images?.[imgIdx] || NO_IMAGE_SVG;
                    const exp    = expandedCardId === car._id;
                    const waMsg  = encodeURIComponent(`Hi, I'm interested in the ${car.title} listed at KES ${car.price?.toLocaleString()}. Is it still available?`);

                    return (
                      <motion.article key={car._id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .22 }} className="car-card">
                        {/* Image */}
                        <div className="car-image-wrap">
                          <img src={img} alt={car.title} className="car-image"
                            onClick={() => car.images?.length && setFullscreenImg(img)}
                            onError={e => { e.target.src = NO_IMAGE_SVG; }}
                            style={{ cursor: car.images?.length ? 'zoom-in' : 'default' }} />
                          {car.condition && (
                            <span className={`car-badge car-badge--${car.condition === 'New' ? 'new' : 'used'}`}>{car.condition}</span>
                          )}
                          {car.images?.length > 1 && (
                            <span className="car-img-counter">{imgIdx + 1}/{car.images.length}</span>
                          )}
                        </div>

                        {/* Thumbnails */}
                        {car.images?.length > 1 && (
                          <div className="car-thumbs">
                            {car.images.map((src, i) => (
                              <img key={i} src={src} alt={`View ${i + 1}`}
                                className={`car-thumb ${imgIdx === i ? 'active' : ''}`}
                                onClick={() => setSelectedImgIdx(p => ({ ...p, [car._id]: i }))}
                                onError={e => { e.target.src = NO_IMAGE_SVG; }} />
                            ))}
                          </div>
                        )}

                        {/* Body */}
                        <div className="car-body">
                          <h3 className="car-title">{car.title}</h3>
                          <div className="car-price-wrap">
                            <span className="car-price">KES {car.price?.toLocaleString()}</span>
                            <span className="car-price-label">Negotiable</span>
                          </div>
                          <div className="car-meta">
                            <span className="car-pill"><FaCalendarAlt size={10} />{car.year}</span>
                            <span className="car-pill"><FaGasPump size={10} />{car.fuelType}</span>
                            <span className="car-pill"><FaCogs size={10} />{car.transmission}</span>
                          </div>

                          <AnimatePresence>
                            {exp && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: .17 }} className="car-details-expanded">
                                <div><strong>Brand</strong><span>{car.brand}</span></div>
                                <div><strong>Model</strong><span>{car.model}</span></div>
                                <div><strong><FaTachometerAlt size={10} /> Mileage</strong><span>{car.mileage?.toLocaleString()} km</span></div>
                                <div><strong><FaPalette size={10} /> Color</strong><span>{car.color}</span></div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="car-actions">
                            <button className={`btn ${exp ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setExpandedCardId(p => p === car._id ? null : car._id)}>
                              {exp ? 'Less' : 'Details'}
                            </button>
                            <a href={`tel:${car.contactNumber}`} className="btn btn-success" aria-label={`Call about ${car.title}`}>
                              <FaPhone size={12} /> Call
                            </a>
                            <a href={`https://wa.me/254${String(car.contactNumber).replace(/^0/, '')}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="btn btn-wa" aria-label={`WhatsApp about ${car.title}`}>
                              <FaWhatsapp size={12} /> WA
                            </a>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
            </div>

            {!loading && filtered.length === 0 && !error && (
              <div className="empty-state">
                <FaCarSide size={52} />
                <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>No cars found</p>
                <p style={{ fontSize: '.875rem' }}>Try adjusting your filters or search term.</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            )}
          </div>

          {/* ── Trust bar ── */}
          {!loading && cars.length > 0 && (
            <div style={{ background: 'var(--navy)', padding: '1.25rem', marginTop: '1rem' }}>
              <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem, 5vw, 4rem)', flexWrap: 'wrap' }}>
                {[['✅', 'Verified Stock'], ['🔑', 'Genuine Deals'], ['📞', 'After-sale Support'], ['🚗', 'Test Drives Available']].map(([icon, text]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: 'rgba(255,255,255,.7)', fontSize: '.8rem', fontWeight: 600 }}>
                    <span style={{ fontSize: '1rem' }}>{icon}</span> {text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <footer className="footer">
            <div className="footer-grid">
              <div>
                <h3>Nairobi Branch</h3>
                <p>📍 Local Car Dealership Rd, Nairobi</p>
                <p>✉️ <a href="mailto:mbaelawrence2013@gmail.com">mbaelawrence2013@gmail.com</a></p>
                <p>🕒 Mon – Sun: 9:00 am – 6:00 pm</p>
                <p style={{ fontWeight: 700, color: '#fff', marginTop: '.5rem', fontSize: '1rem' }}>📞 0723-215-715</p>
              </div>
              <div>
                <h3>Our Location</h3>
                <iframe
                  title="SMVT Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.911875754985!2d36.888385174711004!3d-1.2213493987669972!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1514094c240f%3A0xdf30344c655956f5!2sTee%20Tee%20Club!5e0!3m2!1sen!2ske!4v1764138428043!5m2!1sen!2ske"
                  width="100%" height="155"
                  style={{ border: 0, borderRadius: 'var(--r)', display: 'block', marginTop: '.5rem', filter: 'brightness(.9) saturate(.9)' }}
                  allowFullScreen="" loading="lazy" />
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

          {/* ── Floating WhatsApp ── */}
          <a href={`https://wa.me/${WA_NUM}?text=${encodeURIComponent('Hi SMVT, I\'d like to enquire about a car.')}`}
            target="_blank" rel="noopener noreferrer"
            className="fab-wa" aria-label="Chat on WhatsApp" title="Chat on WhatsApp">
            <FaWhatsapp />
          </a>
        </>
      )}

      {/* ── Fullscreen Modal ── */}
      <AnimatePresence>
        {fullscreenImg && (
          <motion.div className="modal-overlay" role="dialog" aria-modal="true"
            onClick={() => setFullscreenImg(null)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.img src={fullscreenImg} alt="Full size" className="modal-img"
              onClick={e => e.stopPropagation()}
              initial={{ scale: .88 }} animate={{ scale: 1 }} exit={{ scale: .88 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
            <button className="modal-close" onClick={() => setFullscreenImg(null)} aria-label="Close">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
