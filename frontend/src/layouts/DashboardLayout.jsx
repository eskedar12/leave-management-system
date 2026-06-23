import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  Users, 
  User, 
  LogOut, 
  Globe 
} from 'lucide-react';
import NotificationBell from '../components/common/NotificationBell';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const { user, logout, updateProfile } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLanguageChange = async (e) => {
    const selectedLang = e.target.value;
    // Update i18n locally immediately
    i18n.changeLanguage(selectedLang);
    localStorage.setItem('language', selectedLang);
    
    // Sync with backend database profile
    if (user) {
      await updateProfile({ preferredLanguage: selectedLang });
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo-section">
          <span className="sidebar-logo">🔒 {t('common.appName')}</span>
        </div>

        <nav className="sidebar-nav">
          {/* Shared/Role-based Navigation */}
          {user.role === 'employee' && (
            <>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end
              >
                <LayoutDashboard size={20} />
                <span>{t('nav.dashboard')}</span>
              </NavLink>

              <NavLink 
                to="/leaves/new" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <CalendarPlus size={20} />
                <span>{t('nav.newRequest')}</span>
              </NavLink>
            </>
          )}

          {user.role === 'admin' && (
            <>
              <NavLink 
                to="/admin" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end
              >
                <LayoutDashboard size={20} />
                <span>{t('nav.dashboard')}</span>
              </NavLink>

              <NavLink 
                to="/admin/employees" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Users size={20} />
                <span>{t('nav.employees')}</span>
              </NavLink>
            </>
          )}

          {/* Settings & Profile */}
          <NavLink 
            to="/profile" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <User size={20} />
            <span>{t('nav.profile')}</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button 
            onClick={handleLogoutClick}
            className="nav-item btn-link"
            style={{ 
              width: '100%', 
              background: 'none', 
              border: 'none', 
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <LogOut size={20} />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div>
            <h1>{t('common.welcome')}, {user.fullName}</h1>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'capitalize' }}>
              ✦ {t(`common.${user.role}`)}
            </span>
          </div>

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Language Switcher */}
            <div className="lang-selector-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={16} style={{ color: 'var(--text-muted)' }} />
              <select 
                value={i18n.language} 
                onChange={handleLanguageChange}
              >
                <option value="en">English</option>
                <option value="am">አማርኛ (Amharic)</option>
              </select>
            </div>

            {/* 🔔 Notification Bell */}
            <NotificationBell />
          </div>
        </header>

        {/* Page Content Injection */}
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;