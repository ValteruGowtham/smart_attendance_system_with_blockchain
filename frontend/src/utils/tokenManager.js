// src/utils/tokenManager.js
/**
 * Token Management Utilities
 * Centralized token storage and retrieval
 */

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const isAuthenticated = () => !!getToken();

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setUser = (user) => 
  localStorage.setItem(USER_KEY, JSON.stringify(user));

export const removeUser = () => localStorage.removeItem(USER_KEY);

export const clearAuthData = () => {
  removeToken();
  removeUser();
};

export const hasRole = (role) => {
  const user = getUser();
  return user?.role === role;
};

export const hasAnyRole = (roles) => {
  const user = getUser();
  return roles.includes(user?.role);
};
