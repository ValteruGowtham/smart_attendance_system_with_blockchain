// src/services/api/authService.js
import apiClient from './apiClient';
import { setToken, setUser, getToken } from '../../utils/tokenManager';

const authService = {
  /**
   * Login user with credentials
   * @param {string} username
   * @param {string} password
   * @returns {Promise}
   */
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login/', { username, password });
    const { token, ...userData } = response.data;
    
    // Store token and user data
    setToken(token);
    setUser(userData);
    
    return response.data;
  },

  /**
   * Get current user info
   * @returns {Promise}
   */
  getUserInfo: () => apiClient.get('/auth/user/'),

  /**
   * Logout user
   * @returns {Promise}
   */
  logout: () => {
    // Clear local storage before logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return apiClient.post('/auth/logout/');
  },

  /**
   * Verify token validity
   * @returns {Promise}
   */
  verifyToken: () => apiClient.get('/auth/verify/'),

  /**
   * Check if user has a specific role
   * @param {string} requiredRole
   * @returns {boolean}
   */
  hasRole: (requiredRole) => {
    const user = localStorage.getItem('user');
    if (!user) return false;
    return JSON.parse(user).role === requiredRole;
  },
};

export default authService;
