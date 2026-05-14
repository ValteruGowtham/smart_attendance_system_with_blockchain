// src/services/api/attendanceService.js
import apiClient from './apiClient';

const attendanceService = {
  /**
   * Get attendance records
   * @param {string} search - Optional search filter
   * @returns {Promise}
   */
  getAttendance: (search = '') =>
    apiClient.get('/attendance/', { params: { search } }),

  /**
   * Open attendance window for a session
   * @param {FormData} formData - Session data
   * @returns {Promise}
   */
  openAttendanceWindow: (formData) =>
    apiClient.post('/attendance/window/open/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Mark attendance for a student
   * @param {FormData} formData - Student image and session info
   * @returns {Promise}
   */
  markAttendance: (formData) =>
    apiClient.post('/attendance/mark/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Close attendance window for a session
   * @param {FormData} formData
   * @returns {Promise}
   */
  closeAttendanceWindow: (formData) =>
    apiClient.post('/attendance/window/close/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Get filtered attendance
   * @param {Object} filters - Filter criteria
   * @returns {Promise}
   */
  getFilteredAttendance: (filters) =>
    apiClient.get('/attendance/filtered/', { params: filters }),

  /**
   * Generate attendance report
   * @param {Object} params - Report parameters
   * @returns {Promise}
   */
  generateReport: (params) =>
    apiClient.get('/attendance/report/', { params }),

  /**
   * Export attendance data
   * @param {string} format - csv, pdf, etc
   * @param {Object} params
   * @returns {Promise}
   */
  exportData: (format = 'csv', params) =>
    apiClient.get(`/attendance/export/${format}/`, { params }),
};

export default attendanceService;
