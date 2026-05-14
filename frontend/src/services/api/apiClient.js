// src/services/api/apiClient.js
import axios from 'axios';
import { getToken, removeToken } from '../../utils/tokenManager';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor - add token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - redirect to login
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    
    // Log errors for debugging
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      url: error.config?.url,
    });
    
    return Promise.reject(error);
  }
);

export default apiClient;
