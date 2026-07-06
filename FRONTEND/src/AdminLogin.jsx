import React, { useState } from 'react';
import { FaLock, FaUser, FaCarSide } from 'react-icons/fa';
import { API_URL } from './api';
import './smvt.css';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid username or password');
      localStorage.setItem('smvtAdminToken', data.token);
      onLogin(data.token);
    } catch (err) {
      setError(err.message || 'Unable to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'var(--bg)'
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(1.5rem, 5vw, 2.5rem)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid var(--border)'
      }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
            borderRadius: '18px',
            marginBottom: '.75rem',
            boxShadow: '0 6px 20px rgba(29,78,216,.3)'
          }}>
            <FaCarSide size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>Admin Login</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '.875rem', marginTop: '.3rem' }}>
            Signature Motor Vehicle Traders
          </p>
        </div>

        {error && (
          <div className="alert alert--error" style={{ marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: '.9rem' }}>
            <label style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: '.35rem' }}>
              Username
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '.6rem',
              border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
              padding: '.7rem .9rem', background: 'var(--bg)',
              transition: 'border-color .18s'
            }}
              onFocus={() => {}} // handled via CSS below
            >
              <FaUser style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="admin"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                required
                autoComplete="username"
                style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontFamily: 'inherit', fontSize: '.9rem', color: 'var(--text)' }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: '.35rem' }}>
              Password
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '.6rem',
              border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
              padding: '.7rem .9rem', background: 'var(--bg)'
            }}>
              <FaLock style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              <input
                type="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
                autoComplete="current-password"
                style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontFamily: 'inherit', fontSize: '.9rem', color: 'var(--text)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
