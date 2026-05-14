// src/hooks/useAttendance.js
import { useState, useCallback, useEffect } from 'react';
import attendanceService from '../services/api/attendanceService';

/**
 * Custom hook for attendance management
 * Handles fetching, filtering, and state management
 */
export const useAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchAttendance = useCallback(async (searchParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceService.getAttendance(searchParams.search || '');
      setAttendance(res.data);
      setFilters(searchParams);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to fetch attendance';
      setError(errorMsg);
      console.error('Fetch attendance error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAttendance = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceService.markAttendance(formData);
      // Refresh attendance data
      await fetchAttendance(filters);
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to mark attendance';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, fetchAttendance]);

  const generateReport = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceService.generateReport(params);
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to generate report';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    attendance,
    loading,
    error,
    filters,
    fetchAttendance,
    markAttendance,
    generateReport,
  };
};

export default useAttendance;
