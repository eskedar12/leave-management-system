import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { t } = useTranslation();
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Profile fields
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName || !username || !email || !password || !confirmPassword) {
      setError(t('auth.validationRequired'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.validationMismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.validationPasswordLength'));
      return;
    }

    setLoading(true);
    
    // ✅ FIX: Make sure parameters are in the correct order
    // register(fullName, username, email, password, department, phone)
    const result = await register(
      fullName,      // 1: fullName
      username,      // 2: username
      email,         // 3: email
      password,      // 4: password
      department,    // 5: department
      phone          // 6: phone
    );
    
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="auth-wrapper" style={{ minHeight: '120vh' }}>
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-logo">🔒 {t('common.appName')}</h2>
          <p className="auth-subtitle">{t('auth.registerTitle')}</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('auth.fullName')}</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Abebe Kebede"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.username')}</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. abebe12"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('auth.email')}</label>
            <input
              type="email"
              className="form-control"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <div className="form-group">
            <label className="form-label">{t('auth.confirmPassword')}</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Profile Fields */}
          <div className="form-group">
            <label className="form-label">{t('profile.department')}</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. IT, HR, Finance"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('profile.phone')}</label>
            <input
              type="tel"
              className="form-control"
              placeholder="e.g. +251 911 123 456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? t('common.loading') : t('auth.registerButton')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>{t('auth.haveAccount')} </span>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
            {t('auth.loginLink')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;