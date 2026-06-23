import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/auth/profile');
      if (res.data.success) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      localStorage.removeItem('token');
      delete API.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, username, email, password, preferredLanguage, department, position, phone, joinDate) => {
    try {
      const res = await API.post('/auth/register', {
        fullName,
        username,
        email,
        password,
        preferredLanguage,
        department,
        position,
        phone,
        joinDate
      });

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const login = async (usernameOrEmail, password) => {
    try {
      const res = await API.post('/auth/login', { usernameOrEmail, password });

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete API.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (updateData) => {
    try {
      const res = await API.put('/auth/profile', updateData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Update failed' 
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};