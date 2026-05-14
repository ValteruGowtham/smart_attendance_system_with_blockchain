// src/hooks/useBlockchain.js
import { useState, useCallback, useEffect } from 'react';
import blockchainService from '../services/api/blockchainService';

/**
 * Custom hook for blockchain operations
 * Handles verification and transaction management
 */
export const useBlockchain = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);

  // Check blockchain status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await blockchainService.getStatus();
        setStatus(res.data);
        setIsEnabled(res.data.enabled);
      } catch (err) {
        console.warn('Blockchain not available:', err.message);
        setIsEnabled(false);
      }
    };

    checkStatus();
  }, []);

  const verifyAttendance = useCallback(async (recordHash) => {
    setLoading(true);
    setError(null);
    try {
      const res = await blockchainService.verifyAttendance(recordHash);
      return res.data;
    } catch (err) {
      const errorMsg = 'Failed to verify attendance on blockchain';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTransactionHistory = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await blockchainService.getTransactionHistory(filters);
      return res.data;
    } catch (err) {
      setError('Failed to fetch transaction history');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    status,
    isEnabled,
    loading,
    error,
    verifyAttendance,
    getTransactionHistory,
  };
};

export default useBlockchain;
