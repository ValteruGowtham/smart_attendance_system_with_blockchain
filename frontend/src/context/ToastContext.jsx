/**
 * ToastContext.jsx
 * Global toast state management
 */

import React from 'react';
import { ToastContainer } from '../components/Toast';

const ToastContext = React.createContext(null);

export const ToastProvider = ({ children, position = 'top-right' }) => {
  const [toasts, setToasts] = React.useState([]);

  // Generate unique ID for each toast
  const generateId = () => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add a new toast
  const addToast = (config) => {
    const {
      title,
      message,
      variant = 'info',
      duration = 5000,
      icon,
      action,
    } = config;

    const id = generateId();
    const newToast = {
      id,
      title,
      message,
      variant,
      duration,
      icon,
      action,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  // Remove a toast by ID
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Clear all toasts
  const clearAll = () => {
    setToasts([]);
  };

  // Convenience methods for each variant
  const toast = {
    success: (message, options = {}) =>
      addToast({
        title: options.title || 'Success',
        message,
        variant: 'success',
        ...options,
      }),

    error: (message, options = {}) =>
      addToast({
        title: options.title || 'Error',
        message,
        variant: 'error',
        ...options,
      }),

    warning: (message, options = {}) =>
      addToast({
        title: options.title || 'Warning',
        message,
        variant: 'warning',
        ...options,
      }),

    info: (message, options = {}) =>
      addToast({
        title: options.title || 'Info',
        message,
        variant: 'info',
        ...options,
      }),

    // Custom toast
    custom: addToast,
  };

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAll,
    toast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} position={position} />
    </ToastContext.Provider>
  );
};

/**
 * useToast Hook
 * Hook to use toast functionality anywhere in the app
 */
export const useToast = () => {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};

export default ToastContext;
