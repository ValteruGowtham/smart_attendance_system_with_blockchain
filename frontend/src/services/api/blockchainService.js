// src/services/api/blockchainService.js
import apiClient from './apiClient';

const blockchainService = {
  /**
   * Get blockchain status
   * @returns {Promise}
   */
  getStatus: () => apiClient.get('/blockchain/status/'),

  /**
   * Store attendance record on blockchain
   * @param {Object} attendanceData
   * @returns {Promise}
   */
  storeAttendance: (attendanceData) =>
    apiClient.post('/blockchain/attendance/store/', attendanceData),

  /**
   * Verify attendance record on blockchain
   * @param {string} recordHash
   * @returns {Promise}
   */
  verifyAttendance: (recordHash) =>
    apiClient.get(`/blockchain/attendance/verify/${recordHash}/`),

  /**
   * Get blockchain transaction history
   * @param {Object} filters
   * @returns {Promise}
   */
  getTransactionHistory: (filters) =>
    apiClient.get('/blockchain/transactions/', { params: filters }),

  /**
   * Get blockchain statistics
   * @returns {Promise}
   */
  getStatistics: () => apiClient.get('/blockchain/stats/'),

  /**
   * Verify certificate on blockchain
   * @param {string} certificateHash
   * @returns {Promise}
   */
  verifyCertificate: (certificateHash) =>
    apiClient.get(`/blockchain/certificate/verify/${certificateHash}/`),
};

export default blockchainService;
