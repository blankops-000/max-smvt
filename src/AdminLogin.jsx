import React, { useState } from 'react';
import { FaLock, FaUser } from 'react-icons/fa';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || 'https://smvt-backend.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid username or password');
      }

      localStorage.setItem('smvtAdminToken', data.token);
      onLogin(data.token);
      setError('');
    } catch (error) {
      setError(error.message || 'Unable to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f2f4f8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>Admin Login</h2>
        
        {error && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '0.75rem', border: '1px solid #ddd' }}>
              <FaUser style={{ marginRight: '0.75rem', color: '#6c757d' }} />
              <input
                type="text"
                placeholder="admin"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                required
                style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '0.75rem', border: '1px solid #ddd' }}>
              <FaLock style={{ marginRight: '0.75rem', color: '#6c757d' }} />
              <input
                type="password"
                placeholder="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
                style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1 }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '8px', padding: '1rem', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>


      </div>
    </div>
  );
};

export default AdminLogin;
