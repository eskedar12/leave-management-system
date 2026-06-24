import axios from 'axios';

// Use environment variable or fallback to production URL
const API_URL = import.meta.env.VITE_API_URL || 'https://lms-backend-tiv3.onrender.com/api';

const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;