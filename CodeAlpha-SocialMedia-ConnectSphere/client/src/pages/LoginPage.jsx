import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/authService';
import logoImg from '../assets/logo.png';

export default function LoginPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (token) navigate('/feed', { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await loginUser({ email: email.trim(), password });
      const { token: authToken, ...userData } = res.data;
      login(userData, authToken);
      navigate('/feed', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ??
        err.response?.data?.error ??
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-ring">
            <img src={logoImg} alt="ConnectSphere Logo" className="auth-logo-img" />
          </div>
          <h1 className="auth-title">ConnectSphere</h1>
          <p className="auth-subtitle">Connect with the world</p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="auth-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="auth-form-group">
            <label className="auth-label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <div className="input-password-wrapper">
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                className="input-field input-with-icon"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="pw-toggle-btn"
                onClick={() => setShowPw(v => !v)}
                tabIndex={-1}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16 }} />Signing in…</>
            ) : (
              'Sign In →'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>
            Create account
          </a>
        </div>
      </div>
    </div>
  );
}
