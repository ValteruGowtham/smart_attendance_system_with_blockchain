// src/utils/constants.js
export const USER_ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
};

export const API_ENDPOINTS = {
  AUTH: '/auth',
  ATTENDANCE: '/attendance',
  STUDENTS: '/students',
  FACULTY: '/faculty',
  ADMIN: '/admin',
  BLOCKCHAIN: '/blockchain',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
};

export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const API_TIMEOUT = 30000; // 30 seconds
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Logged in successfully',
    LOGOUT: 'Logged out successfully',
    ATTENDANCE_MARKED: 'Attendance marked successfully',
    DATA_SAVED: 'Data saved successfully',
  },
  ERROR: {
    UNAUTHORIZED: 'Unauthorized access',
    SERVER_ERROR: 'Server error. Please try again.',
    NETWORK_ERROR: 'Network error. Check your connection.',
    INVALID_FILE: 'Invalid file format',
  },
};
