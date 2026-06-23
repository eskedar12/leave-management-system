import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { t, i18n } = useTranslation();
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Handle language change
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!usernameOrEmail || !password) {
      setError(t('auth.validationRequired'));
      return;
    }

    setLoading(true);
    const result = await login(usernameOrEmail, password);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-logo">🔒 {t('common.appName')}</h2>
          <p className="auth-subtitle">{t('auth.loginTitle')}</p>
        </div>

        {/* Language Selector */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          marginBottom: '1rem',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t('common.preferredLanguage')}:
          </span>
          <select
            className="form-control"
            value={selectedLanguage}
            onChange={handleLanguageChange}
            style={{ 
              width: 'auto', 
              padding: '0.35rem 1rem',
              fontSize: '0.85rem',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-bright)',
              cursor: 'pointer'
            }}
          >
            <option value="en">English</option>
            <option value="am">አማርኛ</option>
          </select>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('auth.usernameOrEmail')}</label>
            <input
              type="text"
              className="form-control"
              placeholder="username or email"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.password')}</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? t('common.loading') : t('auth.loginButton')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>{t('auth.noAccount')} </span>
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
            {t('auth.registerLink')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;