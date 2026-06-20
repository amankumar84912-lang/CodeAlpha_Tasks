import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/authService';
import logoImg from '../assets/logo.png';

function getStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6)  s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#EF4444', '#F59E0B', '#3B82F6', '#22C55E'];

export default function RegisterPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (token) navigate('/feed', { replace: true });
  }, [token, navigate]);

  const validate = () => {
    if (!username.trim())                       return 'Username is required.';
    if (username.trim().length < 3)             return 'Username must be at least 3 characters.';
    if (!email.trim())                          return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
    if (!password)                              return 'Password is required.';
    if (password.length < 6)                   return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const res = await registerUser({ username: username.trim(), email: email.trim(), password });
      const { token: authToken, ...userData } = res.data;
      login(userData, authToken);
      navigate('/feed', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ??
        err.response?.data?.error ??
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(password);

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob-1" style={{ background: '#6366F1' }} />
      <div className="auth-blob auth-blob-2" style={{ background: '#8B5CF6' }} />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-ring">
            <img src={logoImg} alt="ConnectSphere Logo" className="auth-logo-img" />
          </div>
          <h1 className="auth-title">Join ConnectSphere</h1>
          <p className="auth-subtitle">Create your account and start connecting</p>
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
            <label className="auth-label" htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="cooluser123"
              autoComplete="username"
              disabled={loading}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label" htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
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
            <label className="auth-label" htmlFor="reg-password">Password</label>
            <div className="input-password-wrapper">
              <input
                id="reg-password"
                type={showPw ? 'text' : 'password'}
                className="input-field input-with-icon"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
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
            {/* Strength meter */}
            {password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4].map((seg) => (
                    <div
                      key={seg}
                      style={{
                        flex: 1, height: 4, borderRadius: 4,
                        background: strength >= seg ? STRENGTH_COLORS[strength] : 'var(--border)',
                        transition: 'background 0.3s ease',
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: STRENGTH_COLORS[strength] }}>
                  {STRENGTH_LABELS[strength]}
                </span>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16 }} />Creating account…</>
            ) : (
              '✦ Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
