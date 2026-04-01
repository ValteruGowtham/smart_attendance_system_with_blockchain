/**
 * Connection Status Indicator Component
 * Displays WebSocket connection status visually
 */

import React from 'react';
import './ConnectionIndicator.css';

const ConnectionIndicator = ({
  connectionStatus,
  isConnected,
  connectionError,
  lastPingTime,
  onReconnect,
  className = '',
}) => {
  /**
   * Get status color and icon
   */
  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          color: '#10b981', // green
          icon: '●',
          label: 'Connected',
          className: 'connected',
        };
      case 'connecting':
        return {
          color: '#f59e0b', // amber
          icon: '◐',
          label: 'Connecting...',
          className: 'connecting',
        };
      case 'disconnected':
        return {
          color: '#ef4444', // red
          icon: '○',
          label: 'Disconnected',
          className: 'disconnected',
        };
      case 'error':
        return {
          color: '#dc2626', // dark red
          icon: '✕',
          label: 'Error',
          className: 'error',
        };
      default:
        return {
          color: '#6b7280', // gray
          icon: '?',
          label: 'Unknown',
          className: 'unknown',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`connection-indicator ${statusInfo.className} ${className}`}>
      {/* Status Dot */}
      <div
        className="status-dot"
        style={{
          backgroundColor: statusInfo.color,
          animation: connectionStatus === 'connecting' ? 'pulse 2s infinite' : 'none',
        }}
      >
        <span className="status-icon">{statusInfo.icon}</span>
      </div>

      {/* Status Text */}
      <div className="status-text">
        <span className="status-label">{statusInfo.label}</span>
        
        {/* Error Message */}
        {connectionError && (
          <span className="error-message" title={connectionError}>
            {connectionError}
          </span>
        )}

        {/* Last Ping Time */}
        {lastPingTime && isConnected && (
          <span className="ping-info">
            Last ping: {new Date(lastPingTime).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Reconnect Button */}
      {!isConnected && connectionStatus !== 'connecting' && onReconnect && (
        <button
          className="reconnect-btn"
          onClick={onReconnect}
          title="Attempt to reconnect"
          type="button"
        >
          Reconnect
        </button>
      )}
    </div>
  );
};

export default ConnectionIndicator;
