import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Auth ─────────────────────────────────────────────────────
export const getUserInfo = () => API.get('/auth/user/');
export const loginUser = (username, password) =>
  API.post('/auth/login/', { username, password });
export const logoutUser = () => API.post('/auth/logout/');

// ─── Admin ────────────────────────────────────────────────────
export const getAdminStats = () => API.get('/admin/stats/');

// ─── Students CRUD ────────────────────────────────────────────────
export const getStudents = () => API.get('/students/');
export const addStudent = (formData) =>
  API.post('/students/add/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateStudent = (id, formData) =>
  API.post(`/students/${id}/update/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteStudent = (id) =>
  API.post(`/students/${id}/delete/`);

// ─── Faculty CRUD ──────────────────────────────────────────────────
export const getFaculty = () => API.get('/faculty/');
export const addFaculty = (formData) =>
  API.post('/faculty/add/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateFaculty = (id, formData) =>
  API.post(`/faculty/${id}/update/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteFaculty = (id) =>
  API.post(`/faculty/${id}/delete/`);

// ─── Attendance ───────────────────────────────────────────────
export const getAttendance = (search = '') =>
  API.get('/attendance/', { params: { search } });
export const openAttendanceWindow = (formData) =>
  API.post('/attendance/window/open/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const markAttendance = (formData) =>
  API.post('/attendance/mark/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const closeAttendanceWindow = (formData) =>
  API.post('/attendance/window/close/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ─── Dashboards ───────────────────────────────────────────────
export const getFacultyDashboard = () => API.get('/faculty/dashboard/');
export const getStudentDashboard = () => API.get('/student/dashboard/');

// ─── Notifications ────────────────────────────────────────────┐
export const getNotifications = (limit = 20) =>
  API.get('/notifications/', { params: { limit } });
export const markNotificationAsRead = (id) =>
  API.post(`/notifications/${id}/read/`);
export const deleteNotification = (id) =>
  API.post(`/notifications/${id}/delete/`);

// ─── Reports & Analytics ─────────────────────────────────────
export const generateAttendanceReport = (params) =>
  API.get('/reports/attendance/', { params });
export const generateBranchwiseAnalytics = (params) =>
  API.get('/reports/branchwise/', { params });
export const generateStudentwiseAnalytics = (params) =>
  API.get('/reports/studentwise/', { params });
export const exportReportPDF = (reportType, params) =>
  API.get(`/reports/${reportType}/export/pdf/`, { 
    params,
    responseType: 'blob'
  });
export const exportReportCSV = (reportType, params) =>
  API.get(`/reports/${reportType}/export/csv/`, { 
    params,
    responseType: 'blob'
  });

// ─── Batch Operations ────────────────────────────────────────
export const bulkUpdateStudents = (updates) =>
  API.post('/students/bulk-update/', { updates });
export const bulkDeleteStudents = (ids) =>
  API.post('/students/bulk-delete/', { ids });
export const bulkUpdateFaculty = (updates) =>
  API.post('/faculty/bulk-update/', { updates });
export const bulkMarkAttendance = (data) =>
  API.post('/attendance/bulk-mark/', data);

// ─── Student Analytics ──────────────────────────────────────
export const getStudentAttendanceTrends = (studentId) =>
  API.get(`/students/${studentId}/attendance-trends/`);
export const getAttendanceCertificate = (studentId) =>
  API.get(`/students/${studentId}/certificate/`, { responseType: 'blob' });
export const getStudentAtRiskStatus = () =>
  API.get('/students/at-risk/');

// ─── Faculty Analytics ──────────────────────────────────────
export const getFacultySessionHistory = () =>
  API.get('/faculty/sessions/');
export const getFacultyClasswiseAttendance = (facultyId) =>
  API.get(`/faculty/${facultyId}/classwise-attendance/`);
export const editAttendanceRecord = (recordId, data) =>
  API.post(`/attendance/${recordId}/edit/`, data);

// ─── System Health & Monitoring ─────────────────────────────
export const getSystemHealth = () =>
  API.get('/system/health/');
export const getActivityLog = (limit = 50) =>
  API.get('/system/activity-log/', { params: { limit } });
export const getSystemStats = () =>
  API.get('/system/stats/');

// ─── Two-Factor Authentication ──────────────────────────────
export const enableTwoFactor = () =>
  API.post('/auth/2fa/enable/');
export const verifyTwoFactor = (code) =>
  API.post('/auth/2fa/verify/', { code });
export const disableTwoFactor = (password) =>
  API.post('/auth/2fa/disable/', { password });

// Response interceptor for better error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
