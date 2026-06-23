import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import API from '../../services/api';

const NotificationBell = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications?limit=20');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get('/notifications/unread-count');
      if (res.data.success) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave_approved':
        return '✅';
      case 'leave_rejected':
        return '❌';
      case 'leave_request':
        return '📝';
      default:
        return '🔔';
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          borderRadius: '50%',
          transition: 'background 0.2s',
          color: 'var(--text-bright)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            padding: '0.1rem 0.4rem',
            fontSize: '0.65rem',
            fontWeight: '700',
            minWidth: '18px',
            textAlign: 'center'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 0.5rem)',
          right: '0',
          width: '380px',
          maxHeight: '500px',
          background: 'var(--bg-card)',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          zIndex: 1000
        }}>
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
              🔔 Notifications
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '0.5rem'
          }}>
            {notifications.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'var(--text-muted)'
              }}>
                <Bell size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    borderRadius: '8px',
                    background: notification.read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                    border: notification.read ? 'none' : '1px solid rgba(59, 130, 246, 0.1)',
                    transition: 'background 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {getNotificationIcon(notification.type)}
                        </span>
                        <strong style={{ fontSize: '0.9rem' }}>
                          {notification.title}
                        </strong>
                      </div>
                      <p style={{
                        margin: '0.25rem 0 0.5rem 0',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        lineHeight: '1.4'
                      }}>
                        {notification.message}
                      </p>
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        opacity: 0.7
                      }}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--primary)',
                            padding: '0.25rem'
                          }}
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          padding: '0.25rem',
                          opacity: 0.5,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                        title="Delete"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;