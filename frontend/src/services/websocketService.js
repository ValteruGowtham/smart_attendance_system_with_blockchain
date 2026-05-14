/**
 * Attendance WebSocket Service
 * Handles communication for real-time attendance updates
 */

import useWebSocket from '../hooks/useWebSocket';
import { useCallback, useEffect, useState } from 'react';

/**
 * useAttendanceWebSocket Hook
 * Manages WebSocket connection and updates for attendance data
 * 
 * @returns {Object} WebSocket state and handlers
 */
export const useAttendanceWebSocket = () => {
  const [attendanceUpdates, setAttendanceUpdates] = useState([]);
  const [connectionStats, setConnectionStats] = useState({
    updatesReceived: 0,
    lastUpdate: null,
    connectedAt: null,
  });

  /**
   * Handle incoming WebSocket messages
   */
  const handleMessage = useCallback((data) => {
    console.log('[AttendanceService] Received message:', data);

    if (data.type === 'attendance_update') {
      // Add to updates list (keep last 100)
      setAttendanceUpdates((prev) => {
        const updated = [data.data, ...prev];
        return updated.slice(0, 100);
      });

      // Update stats
      setConnectionStats((prev) => ({
        ...prev,
        updatesReceived: prev.updatesReceived + 1,
        lastUpdate: data.timestamp,
      }));
    } else if (data.type === 'connection_alert') {
      console.log('[AttendanceService] Alert:', data.message);
    } else if (data.type === 'broadcast') {
      console.log('[AttendanceService] Broadcast:', data.data);
    }
  }, []);

  // Use WebSocket hook
  const {
    connectionStatus,
    send,
    disconnect,
    reconnect,
    lastPingTime,
    connectionError,
    isConnected,
  } = useWebSocket('/ws/attendance/updates/', handleMessage);

  // Update connection stats on connect
  useEffect(() => {
    if (isConnected) {
      setConnectionStats((prev) => ({
        ...prev,
        connectedAt: new Date().toISOString(),
      }));
    }
  }, [isConnected]);

  /**
   * Request status from server
   */
  const requestStatus = useCallback(() => {
    send({ type: 'request_status' });
  }, [send]);

  /**
   * Clear updates list
   */
  const clearUpdates = useCallback(() => {
    setAttendanceUpdates([]);
  }, []);

  /**
   * Reset stats
   */
  const resetStats = useCallback(() => {
    setConnectionStats({
      updatesReceived: 0,
      lastUpdate: null,
      connectedAt: new Date().toISOString(),
    });
  }, []);

  return {
    // Connection status
    connectionStatus,
    isConnected,
    connectionError,
    lastPingTime,
    
    // Updates
    attendanceUpdates,
    clearUpdates,
    
    // Stats
    connectionStats,
    resetStats,
    
    // Actions
    send,
    disconnect,
    reconnect,
    requestStatus,
  };
};

/**
 * useNotificationWebSocket Hook
 * Manages WebSocket for personal notifications
 */
export const useNotificationWebSocket = () => {
  const [notifications, setNotifications] = useState([]);

  const handleMessage = useCallback((data) => {
    console.log('[NotificationService] Received:', data);

    if (data.type === 'notification') {
      setNotifications((prev) => [data, ...prev].slice(0, 50));
    } else if (data.type === 'attendance_alert') {
      setNotifications((prev) => [data, ...prev].slice(0, 50));
    }
  }, []);

  const {
    connectionStatus,
    send,
    disconnect,
    reconnect,
    isConnected,
  } = useWebSocket('/ws/notifications/', handleMessage);

  /**
   * Clear notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Remove specific notification
   */
  const removeNotification = useCallback((index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    // Connection status
    connectionStatus,
    isConnected,
    
    // Notifications
    notifications,
    clearNotifications,
    removeNotification,
    
    // Actions
    send,
    disconnect,
    reconnect,
  };
};

export default useAttendanceWebSocket;
