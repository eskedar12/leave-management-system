import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Search, Filter, Phone, Mail, User, Calendar, Building } from 'lucide-react';
import API from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';

const AdminEmployees = () => {
  const { t, i18n } = useTranslation();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = employees.filter(emp => 
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await API.get('/leaves/employees');
      if (res.data.success) {
        setEmployees(res.data.employees);
        setFilteredEmployees(res.data.employees);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getDepartmentBadge = (department) => {
    if (!department) return 'N/A';
    const colors = {
      'IT': '#3B82F6',
      'HR': '#8B5CF6',
      'Finance': '#10B981',
      'Marketing': '#F59E0B',
      'Operations': '#EF4444',
      'Sales': '#EC4899'
    };
    const color = colors[department] || '#6B7280';
    return (
      <span style={{
        background: color + '20',
        color: color,
        padding: '0.2rem 0.6rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600'
      }}>
        {department}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Users size={20} style={{ display: 'inline-block', marginRight: '0.5rem' }} />
            {t('admin.employeesTitle')}
          </h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                style={{ padding: '0.5rem 1rem', width: '250px', fontSize: '0.85rem' }}
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {filteredEmployees.length} {t('common.employee')}{filteredEmployees.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loader" style={{ margin: '0 auto 1rem auto' }}></div>
            <p>{t('common.loading')}</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : filteredEmployees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ marginBottom: '1rem', opacity: '0.4' }} />
            <p>{searchTerm ? 'No employees match your search.' : 'No employees found.'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>{t('admin.employeeName')}</th>
                  <th>{t('auth.username')}</th>
                  <th>{t('auth.email')}</th>
                  <th>{t('admin.department')}</th>
                  <th>{t('admin.phone')}</th>
                  <th>{t('common.role')}</th>
                  <th>{t('admin.joinedDate')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-bright)' }}>
                        {emp.fullName}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      @{emp.username}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      <Mail size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      {emp.email}
                    </td>
                    <td>
                      {getDepartmentBadge(emp.department)}
                    </td>
                    <td>
                      <Phone size={14} style={{ display: 'inline', marginRight: '0.25rem', color: 'var(--text-muted)' }} />
                      {emp.phone || 'N/A'}
                    </td>
                    <td>
                      <span style={{
                        background: emp.role === 'admin' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        color: emp.role === 'admin' ? '#8B5CF6' : '#3B82F6',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {emp.role || 'Employee'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      {formatDate(emp.createdAt)}
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

export default AdminEmployees;