import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, Calendar, AlertTriangle } from 'lucide-react';
import API from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import EthiopianDatePicker from '../components/common/EthiopianDatePicker';

const NewLeaveRequest = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [leaveType, setLeaveType] = useState('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [totalRemainingDays, setTotalRemainingDays] = useState(30);
  const [daysRequested, setDaysRequested] = useState(0);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // Fetch leave balance on component mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await API.get('/leaves/balance');
        if (res.data.success) {
          // Use remainingDays from the response
          setTotalRemainingDays(res.data.remainingDays || 30);
        }
      } catch (err) {
        console.error('Error fetching balance:', err);
      } finally {
        setBalanceLoading(false);
      }
    };
    fetchBalance();
  }, []);

  // Calculate days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start <= end) {
        let days = 0;
        const current = new Date(start);
        while (current <= end) {
          const dayOfWeek = current.getDay();
          if (dayOfWeek !== 6 && dayOfWeek !== 0) {
            days++;
          }
          current.setDate(current.getDate() + 1);
        }
        setDaysRequested(days);
      } else {
        setDaysRequested(0);
      }
    }
  }, [startDate, endDate]);

  const isBalanceSufficient = () => {
    return daysRequested <= totalRemainingDays;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!leaveType || !startDate || !endDate || !reason) {
      setError(t('request.errorFields'));
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError(t('request.errorDate'));
      return;
    }

    if (daysRequested === 0) {
      setError('Please select a valid date range.');
      return;
    }

    if (!isBalanceSufficient()) {
      setError(`Insufficient balance. You have ${totalRemainingDays} days remaining.`);
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/leaves', {
        leaveType,
        startDate,
        endDate,
        reason,
        calendarSystem: 'GC'
      });

      if (res.data.success) {
        setSuccess(`${t('request.success')} (${daysRequested} days requested)`);
        // Update the remaining days locally
        setTotalRemainingDays(prev => prev - daysRequested);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Submit leave request error:', err);
      setError(err.response?.data?.message || 'An error occurred while submitting.');
    } finally {
      setLoading(false);
    }
  };

  // Handle date changes - works with both input and EthiopianDatePicker
  const handleStartDateChange = (value) => {
    const dateValue = value?.target?.value !== undefined ? value.target.value : value;
    setStartDate(dateValue);
    if (endDate && new Date(dateValue) > new Date(endDate)) {
      setEndDate('');
    }
  };

  const handleEndDateChange = (value) => {
    const dateValue = value?.target?.value !== undefined ? value.target.value : value;
    setEndDate(dateValue);
  };

  const isAmharic = i18n.language === 'am';
  const today = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Back Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="btn btn-outline btn-sm"
          style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} />
          <span>{t('common.cancel')}</span>
        </button>

        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            📅 {t('request.title')}
          </h2>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Remaining Leave Days - Small indicator */}
          {!balanceLoading && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                background: 'var(--bg-secondary)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}>
                <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Remaining:</span>
                <strong style={{ 
                  color: totalRemainingDays < 5 ? '#EF4444' : 'var(--text-bright)',
                  fontSize: '1.1rem'
                }}>
                  {totalRemainingDays}
                </strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>days</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Leave Type Select */}
            <div className="form-group">
              <label className="form-label">{t('request.type')}</label>
              <select
                className="form-control"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                required
              >
                <option value="Annual">{t('request.annual')}</option>
                <option value="Sick">{t('request.sick')}</option>
                <option value="Emergency">Emergency</option>
                <option value="Maternity">{t('request.maternity')}</option>
                <option value="Paternity">{t('request.paternity')}</option>
                <option value="Compassionate">{t('request.compassionate')}</option>
                <option value="Unpaid">{t('request.unpaid')}</option>
              </select>
            </div>

            {/* Date Pickers */}
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                {isAmharic ? (
                  <EthiopianDatePicker
                    label={t('request.startDate')}
                    value={startDate}
                    onChange={handleStartDateChange}
                  />
                ) : (
                  <div>
                    <label className="form-label">{t('request.startDate')}</label>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={handleStartDateChange}
                      min={today}
                      max={endDate || undefined}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                {isAmharic ? (
                  <EthiopianDatePicker
                    label={t('request.endDate')}
                    value={endDate}
                    onChange={handleEndDateChange}
                  />
                ) : (
                  <div>
                    <label className="form-label">{t('request.endDate')}</label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={handleEndDateChange}
                      min={startDate || today}
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Days Summary */}
            {daysRequested > 0 && (
              <div style={{ 
                padding: '0.75rem', 
                borderRadius: '8px', 
                marginBottom: '1rem',
                background: isBalanceSufficient() ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${isBalanceSufficient() ? 'var(--success)' : 'var(--danger)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span>
                    <strong>Days Requested:</strong> {daysRequested} working days
                  </span>
                  <span>
                    <strong>Remaining Balance:</strong> {totalRemainingDays - daysRequested} days
                  </span>
                  {!isBalanceSufficient() && (
                    <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertTriangle size={16} />
                      Insufficient balance!
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Reason Textarea */}
            <div className="form-group">
              <label className="form-label">{t('request.reason')}</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder={t('request.reasonPlaceholder')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem' }}
              disabled={loading || !isBalanceSufficient() || daysRequested === 0 || !startDate || !endDate}
            >
              <Send size={16} />
              <span>{loading ? t('request.submitting') : t('common.submit')}</span>
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewLeaveRequest;