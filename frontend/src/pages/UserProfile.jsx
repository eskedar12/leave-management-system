import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

const UserProfile = () => {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState(user?.department || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !username || !email) {
      setError(t('auth.validationRequired'));
      return;
    }

    setLoading(true);
    const updateData = { 
      fullName, 
      username, 
      email, 
      department,
      phone
    };
    if (password) {
      updateData.password = password;
    }

    const result = await updateProfile(updateData);
    setLoading(false);

    if (result.success) {
      setSuccess(t('profile.success'));
      setPassword('');
    } else {
      setError(result.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h2 className="card-title" style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          ⚙️ {t('profile.title')}
        </h2>

        {/* Display user info in a nice format */}
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem 1rem'
        }}>
          <div>
            <strong>{t('profile.fullName')}:</strong> {user?.fullName}
          </div>
          <div>
            <strong>{t('auth.username')}:</strong> @{user?.username}
          </div>
          <div>
            <strong>{t('profile.department')}:</strong> {user?.department || 'N/A'}
          </div>
          <div>
            <strong>{t('profile.phone')}:</strong> {user?.phone || 'N/A'}
          </div>
          <div>
            <strong>{t('common.role')}:</strong> {user?.role === 'admin' ? 'Admin' : 'Employee'}
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('profile.fullName')}</label>
            <input
              type="text"
              className="form-control"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('profile.username')}</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('profile.email')}</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('profile.department')}</label>
            <input
              type="text"
              className="form-control"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. IT, HR, Finance"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('profile.phone')}</label>
            <input
              type="tel"
              className="form-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +251 911 123 456"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {t('profile.password')}{' '}
              <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                ({t('profile.passwordHint')})
              </span>
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? t('profile.updating') : t('common.save')}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;