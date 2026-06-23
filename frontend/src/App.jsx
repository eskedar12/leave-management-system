import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './i18n/i18n'; // Initialize translations
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import EmployeeDashboard from './pages/EmployeeDashboard';
import NewLeaveRequest from './pages/NewLeaveRequest';
import AdminDashboard from './pages/AdminDashboard';
import AdminEmployees from './pages/AdminEmployees';

// Fallback routing based on authenticated user's role
const RootRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p className="loading-text">Loading Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Employee Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leaves/new" 
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <NewLeaveRequest />
              </ProtectedRoute>
            } 
          />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/employees" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminEmployees />
              </ProtectedRoute>
            } 
          />

          {/* Shared Protected Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['employee', 'admin']}>
                <UserProfile />
              </ProtectedRoute>
            } 
          />

          {/* Root Fallback Redirect */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
