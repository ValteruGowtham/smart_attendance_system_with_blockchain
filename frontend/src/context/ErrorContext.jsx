/**
 * ErrorContext.jsx
 * Global error state management for attendance system
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const ErrorContext = createContext(null);

export const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);
  const [networkStatus, setNetworkStatus] = useState('online');

  // Add error to queue
  const addError = useCallback((error) => {
    const errorId = Date.now();
    const errorWithId = { ...error, id: errorId };
    setErrors((prev) => [...prev, errorWithId]);
    return errorId;
  }, []);

  // Remove specific error
  const removeError = useCallback((errorId) => {
    setErrors((prev) => prev.filter((e) => e.id !== errorId));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Update network status
  const updateNetworkStatus = useCallback((status) => {
    setNetworkStatus(status);
  }, []);

  // Get latest error
  const getLatestError = useCallback(() => {
    return errors[errors.length - 1] || null;
  }, [errors]);

  // Check if error is critical (requires action)
  const isCriticalError = useCallback(() => {
    return errors.some((e) =>
      ['camera_not_available', 'camera_permission_denied', 'network_unreachable'].includes(
        e.error_type
      )
    );
  }, [errors]);

  const value = {
    errors,
    addError,
    removeError,
    clearErrors,
    networkStatus,
    updateNetworkStatus,
    getLatestError,
    isCriticalError,
  };

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
};

// Hook to use error context
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
};

// Hook for error handling
export const useErrorHandler = () => {
  const { addError, removeError, clearErrors } = useError();

  const handleError = useCallback(
    (error, options = {}) => {
      const {
        autoDismiss = true,
        dismissDelay = 8000,
        onRetry = null,
      } = options;

      // Add error to state
      const errorId = addError(error);

      // Auto-dismiss if needed
      if (autoDismiss) {
        setTimeout(() => {
          removeError(errorId);
        }, dismissDelay);
      }

      return {
        errorId,
        dismiss: () => removeError(errorId),
        retry: onRetry,
      };
    },
    [addError, removeError]
  );

  return {
    handleError,
    clearErrors,
  };
};

// Hook for network status monitoring
export const useNetworkStatus = () => {
  const { networkStatus, updateNetworkStatus } = useError();

  React.useEffect(() => {
    const handleOnline = () => updateNetworkStatus('online');
    const handleOffline = () => updateNetworkStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateNetworkStatus]);

  return networkStatus;
};

// Hook for camera permission status
export const useCameraPermission = () => {
  const [permission, setPermission] = React.useState('unknown'); // unknown, granted, denied
  const [isChecking, setIsChecking] = React.useState(false);

  const checkPermission = React.useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await navigator.permissions?.query({ name: 'camera' });
      if (result) {
        setPermission(result.state === 'granted' ? 'granted' : 'denied');
      }
    } catch (error) {
      // Permissions API not available, try to request
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
        setPermission('granted');
      } catch (err) {
        setPermission('denied');
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  React.useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    permission,
    isChecking,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    checkPermission,
  };
};

// Hook for blockchain status monitoring
export const useBlockchainStatus = () => {
  const [status, setStatus] = React.useState({
    isConnected: false,
    isSyncing: false,
    pendingTransactions: 0,
    failedTransactions: 0,
    error: null,
  });

  const checkBlockchainStatus = React.useCallback(async () => {
    try {
      const response = await fetch('/api/blockchain/transactions/stats/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Blockchain API error');

      const data = await response.json();
      setStatus({
        isConnected: true,
        isSyncing: false,
        pendingTransactions: data.pending || 0,
        failedTransactions: data.failed || 0,
        error: null,
      });
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isConnected: false,
        error: error.message,
      }));
    }
  }, []);

  React.useEffect(() => {
    checkBlockchainStatus();
    const interval = setInterval(checkBlockchainStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkBlockchainStatus]);

  return {
    status,
    refetch: checkBlockchainStatus,
  };
};
