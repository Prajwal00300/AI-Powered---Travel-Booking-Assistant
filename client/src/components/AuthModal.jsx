import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await api.post('/auth/register', formData);
        // Automatically switch to login on success
        setMode('login');
        setError('Registration successful! Please sign in.');
      } else {
        const res = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
        login(res.data.data.user, res.data.data.token);
        onClose(); // Close modal on success
        navigate('/dashboard'); // Redirect to dashboard
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div
        className="modal-content animate-scale-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button className="modal-close" onClick={onClose}>&times;</button>

        <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 'bold' }}>
          {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
        </h2>

        {error && (
          <div className={error.includes('successful') ? 'success-msg' : 'error-msg'}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn" disabled={loading} style={{ marginTop: '16px', padding: '12px', fontSize: '16px' }}>
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="link-text" style={{ marginTop: '24px' }}>
          {mode === 'login' ? (
            <>Don't have an account? <span onClick={toggleMode} style={{ color: '#1e3c72', cursor: 'pointer', fontWeight: 'bold' }}>Sign up</span></>
          ) : (
            <>Already have an account? <span onClick={toggleMode} style={{ color: '#1e3c72', cursor: 'pointer', fontWeight: 'bold' }}>Sign in</span></>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
