// src/services/api/userService.js
import apiClient from './apiClient';

const userService = {
  // Student operations
  getStudents: () => apiClient.get('/students/'),

  addStudent: (formData) =>
    apiClient.post('/students/add/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateStudent: (id, formData) =>
    apiClient.post(`/students/${id}/update/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteStudent: (id) =>
    apiClient.post(`/students/${id}/delete/`),

  // Faculty operations
  getFaculty: () => apiClient.get('/faculty/'),

  addFaculty: (formData) =>
    apiClient.post('/faculty/add/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateFaculty: (id, formData) =>
    apiClient.post(`/faculty/${id}/update/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteFaculty: (id) =>
    apiClient.post(`/faculty/${id}/delete/`),

  // Admin operations
  getAdminStats: () => apiClient.get('/admin/stats/'),

  // Dashboard data
  getFacultyDashboard: () => apiClient.get('/faculty/dashboard/'),

  getStudentDashboard: () => apiClient.get('/student/dashboard/'),
};

export default userService;
