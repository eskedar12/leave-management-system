import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Users, CheckSquare, Search, Filter, UserCheck, Calendar } from 'lucide-react';
import API from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import { formatGregorianAsEthiopian } from '../utils/ethiopianDate';

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  
  // States
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    employeesOnLeaveToday: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  
  // Modal states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalType, setModalType] = useState('');
  const [managerComment, setManagerComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Fetch functions
  const fetchStats = async () => {
    try {
      const res = await API.get('/leaves/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (employeeSearch) params.employeeName = employeeSearch;
      
      const res = await API.get('/leaves', { params });
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error('Error fetching all requests:', err);
      setError(t('dashboard.noRequests'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRequests();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleOpenModal = (req, type) => {
    setSelectedRequest(req);
    setModalType(type);
    setManagerComment('');
    setActionSuccess('');
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setModalType('');
    setManagerComment('');
  };

  const handleResolveRequest = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    setActionLoading(true);
    try {
      const res = await API.put(`/leaves/${selectedRequest.id}/resolve`, {
        status: modalType,
        managerComment
      });

      if (res.data.success) {
        setActionSuccess(t('admin.resolveSuccess'));
        fetchStats();
        fetchRequests();
        setTimeout(() => {
          handleCloseModal();
        }, 1000);
      }
    } catch (err) {
      console.error('Error resolving leave request:', err);
      setError('Failed to resolve request.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (gregString) => {
    if (!gregString) return '';
    if (i18n.language === 'am') {
      return formatGregorianAsEthiopian(gregString, 'am');
    }
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(gregString).toLocaleDateString('en-US', options);
  };

  const employeesOnLeaveCount = stats.employeesOnLeaveToday?.length || 0;

  return (
    <DashboardLayout>
      {/* Admin Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card total">
          <span className="stat-title">{t('dashboard.totalEmployees')}</span>
          <span className="stat-value">{stats.totalEmployees}</span>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #8B5CF6' }}>
          <span className="stat-title">{t('dashboard.employeesOnLeaveToday')}</span>
          <span className="stat-value">{employeesOnLeaveCount}</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-title">{t('dashboard.pendingActions')}</span>
          <span className="stat-value">{stats.pendingRequests}</span>
        </div>
        <div className="stat-card approved">
          <span className="stat-title">{t('dashboard.approvedLeaves')}</span>
          <span className="stat-value">{stats.approvedRequests}</span>
        </div>
        <div className="stat-card rejected">
          <span className="stat-title">{t('dashboard.rejectedRequests')}</span>
          <span className="stat-value">{stats.rejectedRequests}</span>
        </div>
      </div>

      {/* Employees on Leave Today List */}
      {employeesOnLeaveCount > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--bg-secondary)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: '1rem' }}>
              <UserCheck size={18} style={{ display: 'inline-block', marginRight: '0.5rem' }} />
              {t('dashboard.employeesOnLeaveToday')} ({employeesOnLeaveCount})
            </h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {stats.employeesOnLeaveToday?.map((emp, index) => (
              <span 
                key={index}
                style={{
                  background: 'var(--bg-card)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-color)'
                }}
              >
                {emp.fullName} 
                {emp.department && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}> ({emp.department})</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Request Manager list */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📋 {t('dashboard.allRequestsTitle')}</h2>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                style={{ padding: '0.5rem 1rem', width: '220px', fontSize: '0.85rem' }}
                placeholder={t('common.search')}
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-outline btn-sm">
                <Search size={14} />
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={14} style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-control"
                style={{ padding: '0.5rem 1rem', width: '160px', fontSize: '0.85rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">{t('common.filter')} ({t('common.all')})</option>
                <option value="pending">{t('status.pending')}</option>
                <option value="approved">{t('status.approved')}</option>
                <option value="rejected">{t('status.rejected')}</option>
              </select>
            </div>
          </div>
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
                  <th>{t('admin.employeeName')}</th>
                  <th>{t('request.type')}</th>
                  <th>{t('request.startDate')}</th>
                  <th>{t('request.endDate')}</th>
                  <th>Days</th>
                  <th>{t('request.reason')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('dashboard.commentTitle')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-bright)' }}>
                        {req.user?.fullName}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        @{req.user?.username}
                      </div>
                      {req.user?.department && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {req.user.department}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: '500' }}>
                      {t(`request.${req.leaveType.toLowerCase()}`, req.leaveType)}
                    </td>
                    <td>{formatDate(req.startDate)}</td>
                    <td>{formatDate(req.endDate)}</td>
                    <td>{req.daysRequested || 1}</td>
                    <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.reason}>
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
                    <td>
                      {req.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleOpenModal(req, 'approved')}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.35rem 0.75rem', background: 'var(--success)', boxShadow: 'none' }}
                          >
                            ✓
                          </button>
                          <button 
                            onClick={() => handleOpenModal(req, 'rejected')}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.35rem 0.75rem' }}
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Resolution Modal */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {t('admin.resolveTitle')}: {selectedRequest.user?.fullName}
              </h3>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            
            <form onSubmit={handleResolveRequest}>
              <div className="modal-body">
                {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}
                
                <div style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <p><strong>{t('request.type')}:</strong> {t(`request.${selectedRequest.leaveType.toLowerCase()}`, selectedRequest.leaveType)}</p>
                  <p><strong>{t('request.startDate')}:</strong> {formatDate(selectedRequest.startDate)}</p>
                  <p><strong>{t('request.endDate')}:</strong> {formatDate(selectedRequest.endDate)}</p>
                  <p><strong>Days:</strong> {selectedRequest.daysRequested || 1}</p>
                  <p style={{ marginTop: '0.5rem' }}><strong>{t('request.reason')}:</strong> "{selectedRequest.reason}"</p>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('admin.commentLabel')}</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder={t('admin.commentPlaceholder')}
                    value={managerComment}
                    onChange={(e) => setManagerComment(e.target.value)}
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleCloseModal}
                  disabled={actionLoading}
                >
                  {t('common.cancel')}
                </button>
                <button 
                  type="submit" 
                  className={`btn btn-sm ${modalType === 'approved' ? 'btn-primary' : 'btn-danger'}`}
                  style={modalType === 'approved' ? { background: 'var(--success)' } : {}}
                  disabled={actionLoading}
                >
                  {modalType === 'approved' ? t('admin.approveBtn') : t('admin.rejectBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;