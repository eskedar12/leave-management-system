import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  Users, 
  User, 
  LogOut, 
  Globe,
  Menu,
  X
} from 'lucide-react';
import NotificationBell from '../components/common/NotificationBell';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const { user, logout, updateProfile } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLanguageChange = async (e) => {
    const selectedLang = e.target.value;
    i18n.changeLanguage(selectedLang);
    localStorage.setItem('language', selectedLang);
    
    if (user) {
      await updateProfile({ preferredLanguage: selectedLang });
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={closeMobileMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 998,
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo-section">
          <span className="sidebar-logo">🔒 {t('common.appName')}</span>
          <button 
            className="mobile-close-btn"
            onClick={closeMobileMenu}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text-bright)',
              cursor: 'pointer',
              fontSize: '1.5rem',
            }}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {user.role === 'employee' && (
            <>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end
                onClick={closeMobileMenu}
              >
                <LayoutDashboard size={20} />
                <span>{t('nav.dashboard')}</span>
              </NavLink>

              <NavLink 
                to="/leaves/new" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
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
                onClick={closeMobileMenu}
              >
                <LayoutDashboard size={20} />
                <span>{t('nav.dashboard')}</span>
              </NavLink>

              <NavLink 
                to="/admin/employees" 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <Users size={20} />
                <span>{t('nav.employees')}</span>
              </NavLink>
            </>
          )}

          <NavLink 
            to="/profile" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <User size={20} />
            <span>{t('nav.profile')}</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button 
            onClick={() => {
              handleLogoutClick();
              closeMobileMenu();
            }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Mobile Menu Toggle Button */}
            <button 
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: 'var(--text-bright)',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)' }}>{t('common.welcome')}, {user.fullName}</h1>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                ✦ {t(`common.${user.role}`)}
              </span>
            </div>
          </div>

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Language Switcher */}
            <div className="lang-selector-container" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Globe size={16} style={{ color: 'var(--text-muted)' }} />
              <select 
                value={i18n.language} 
                onChange={handleLanguageChange}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: 'clamp(0.7rem, 1vw, 0.85rem)',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-bright)',
                  maxWidth: '100px',
                }}
              >
                <option value="en">EN</option>
                <option value="am">አማ</option>
              </select>
            </div>

            {/* Notification Bell */}
            <NotificationBell />
          </div>
        </header>

        {/* Page Content Injection */}
        <div className="page-content">
          {children}
        </div>
      </main>

      {/* Mobile Responsive Styles */}
      <style>{`
        /* Mobile menu toggle - visible on mobile */
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: flex !important;
          }

          .sidebar {
            position: fixed !important;
            top: 0;
            left: -280px !important;
            width: 280px !important;
            height: 100vh !important;
            z-index: 999 !important;
            transition: left 0.3s ease !important;
            background: var(--bg-card) !important;
            box-shadow: 2px 0 10px rgba(0,0,0,0.2) !important;
          }

          .sidebar.mobile-open {
            left: 0 !important;
          }

          .mobile-close-btn {
            display: flex !important;
          }

          .main-content {
            margin-left: 0 !important;
            width: 100% !important;
          }

          .top-header {
            padding: 0.75rem !important;
            flex-wrap: wrap !important;
            gap: 0.5rem !important;
          }

          .top-header > div:first-child {
            flex: 1 !important;
            min-width: 120px !important;
          }

          .header-actions {
            gap: 0.5rem !important;
          }

          .lang-selector-container select {
            max-width: 70px !important;
            font-size: 0.7rem !important;
            padding: 0.2rem 0.3rem !important;
          }

          .page-content {
            padding: 0.5rem !important;
          }

          /* Stats grid - 2 columns on mobile */
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.5rem !important;
          }

          .stat-card {
            padding: 0.75rem 0.5rem !important;
          }

          .stat-title {
            font-size: 0.6rem !important;
          }

          .stat-value {
            font-size: 1.2rem !important;
          }

          /* Cards */
          .card {
            padding: 0.75rem !important;
            margin: 0.5rem 0 !important;
          }

          .card-title {
            font-size: 0.9rem !important;
          }

          .card-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.5rem !important;
          }

          /* Tables */
          .table-wrapper {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }

          table {
            font-size: 0.7rem !important;
            min-width: 500px !important;
          }

          table th, table td {
            padding: 0.3rem 0.4rem !important;
          }

          /* Buttons */
          .btn {
            padding: 0.3rem 0.6rem !important;
            font-size: 0.7rem !important;
          }

          .btn-sm {
            padding: 0.2rem 0.4rem !important;
            font-size: 0.6rem !important;
          }

          /* Forms */
          .form-control {
            font-size: 0.85rem !important;
            padding: 0.4rem !important;
          }

          .form-group {
            margin-bottom: 0.5rem !important;
          }

          /* Notification bell on mobile */
          .notification-bell {
            width: 28px !important;
            height: 28px !important;
          }

          /* Leave balance card */
          .stat-card.leave-balance {
            padding: 1rem !important;
          }

          .stat-card.leave-balance .stat-value {
            font-size: 2.5rem !important;
          }

          /* Badge */
          .badge {
            font-size: 0.6rem !important;
            padding: 0.1rem 0.4rem !important;
          }

          /* Modal on mobile */
          .modal {
            width: 95% !important;
            max-width: 95% !important;
            margin: 1rem auto !important;
          }

          .modal-body {
            padding: 1rem !important;
          }
        }

        /* Very small screens */
        @media (max-width: 400px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 0.3rem !important;
          }

          .stat-card {
            padding: 0.5rem 0.3rem !important;
          }

          .stat-value {
            font-size: 1rem !important;
          }

          .stat-title {
            font-size: 0.5rem !important;
          }

          .top-header h1 {
            font-size: 0.85rem !important;
          }

          .top-header span {
            font-size: 0.7rem !important;
          }

          .header-actions {
            gap: 0.3rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;