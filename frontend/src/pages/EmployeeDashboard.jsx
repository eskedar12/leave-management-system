import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarPlus, ClipboardList, CheckCircle, Clock, AlertTriangle, Calendar, TrendingDown } from 'lucide-react';
import API from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import { formatGregorianAsEthiopian } from '../utils/ethiopianDate';

const EmployeeDashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [remainingDays, setRemainingDays] = useState(30); // Changed from leaveBalance object to single number
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get('/leaves/my-requests');
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error('Error fetching own requests:', err);
      setError(t('dashboard.noRequests'));
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const res = await API.get('/leaves/balance');
      if (res.data.success) {
        // Use remainingDays from the response
        setRemainingDays(res.data.remainingDays || 30);
      }
    } catch (err) {
      console.error('Error fetching leave balance:', err);
    }
  };

  useEffect(() => {
    fetchMyRequests();
    fetchLeaveBalance();
  }, []);

  // Compute local stats
  const total = requests.length;
  const pending = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;

  const formatDate = (gregString) => {
    if (!gregString) return '';
    if (i18n.language === 'am') {
      return formatGregorianAsEthiopian(gregString, 'am');
    }
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(gregString).toLocaleDateString('en-US', options);
  };

  return (
    <DashboardLayout>
      {/* Leave Balance Card - Single Box */}
      <div style={{ marginBottom: '2rem' }}>
        <div 
          className="stat-card" 
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '2rem',
            borderRadius: '12px',
            textAlign: 'center',
            border: 'none',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Calendar size={24} style={{ opacity: 0.8 }} />
            <span style={{ fontSize: '1rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {t('dashboard.remainingLeaveDays')}
            </span>
          </div>
          <div style={{ fontSize: '4rem', fontWeight: '700', lineHeight: '1.2' }}>
            {remainingDays}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
            days available
          </div>
        </div>
      </div>

      {/* Top Banner & Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card total">
          <span className="stat-title">{t('dashboard.totalRequests')}</span>
          <span className="stat-value">{total}</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-title">{t('dashboard.pending')}</span>
          <span className="stat-value">{pending}</span>
        </div>
        <div className="stat-card approved">
          <span className="stat-title">{t('dashboard.approved')}</span>
          <span className="stat-value">{approved}</span>
        </div>
        <div className="stat-card rejected">
          <span className="stat-title">{t('dashboard.rejected')}</span>
          <span className="stat-value">{rejected}</span>
        </div>
      </div>

      {/* Main Request History Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📝 {t('dashboard.recentHistory')}</h2>
          <button 
            onClick={() => navigate('/leaves/new')}
            className="btn btn-primary btn-sm"
          >
            <CalendarPlus size={16} />
            <span>{t('dashboard.requestLeaveBtn')}</span>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loader" style={{ margin: '0 auto 1rem auto' }}></div>
            <p>{t('common.loading')}</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <ClipboardList size={48} style={{ marginBottom: '1rem', opacity: '0.4' }} />
            <p>{t('dashboard.noRequests')}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>{t('request.type')}</th>
                  <th>{t('request.startDate')}</th>
                  <th>{t('request.endDate')}</th>
                  <th>Days</th>
                  <th>{t('request.reason')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('dashboard.commentTitle')}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: '600' }}>
                      {t(`request.${req.leaveType.toLowerCase()}`, req.leaveType)}
                    </td>
                    <td>{formatDate(req.startDate)}</td>
                    <td>{formatDate(req.endDate)}</td>
                    <td>{req.daysRequested || 1}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.reason}
                    </td>
                    <td>
                      <span className={`badge badge-${req.status}`}>
                        {t(`status.${req.status}`)}
                      </span>
                    </td>
                    <td>
                      {req.managerComment ? (
                        <div className="comment-text">{req.managerComment}</div>
                      ) : (
                        <span className="comment-empty">{t('dashboard.noComment')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;