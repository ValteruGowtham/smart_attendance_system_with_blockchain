/**
 * Real-time Attendance Updates Component
 * Displays live attendance updates as they happen
 */

import React, { useMemo } from 'react';
import './AttendanceUpdatesPanel.css';

const AttendanceUpdatesPanel = ({ updates = [], isLoading = false, maxDisplay = 10 }) => {
  /**
   * Format timestamp to readable time
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  /**
   * Group updates by status
   */
  const groupedUpdates = useMemo(() => {
    return {
      present: updates.filter((u) => u.status === 'Present'),
      absent: updates.filter((u) => u.status === 'Absent'),
    };
  }, [updates]);

  /**
   * Get display updates (limited to maxDisplay)
   */
  const displayUpdates = updates.slice(0, maxDisplay);

  /**
   * Render individual update item
   */
  const renderUpdateItem = (update, index) => {
    const statusColor =
      update.status === 'Present'
        ? '#10b981' // green
        : '#ef4444'; // red

    return (
      <div
        key={`${update.student_id}-${update.timestamp}-${index}`}
        className="update-item"
        style={{
          borderLeftColor: statusColor,
          animation: `slideIn 0.4s ease-out`,
        }}
      >
        {/* Status Badge */}
        <div className="status-badge" style={{ backgroundColor: statusColor }}>
          {update.status?.charAt(0).toUpperCase()}
        </div>

        {/* Update Content */}
        <div className="update-content">
          <div className="student-info">
            <span className="student-name">{update.name}</span>
            <span className="student-id">{update.registration_id}</span>
          </div>

          <div className="update-details">
            <span className="class-info">
              {update.class} • Period {update.period}
            </span>
            <span className="timestamp">{formatTime(update.timestamp)}</span>
          </div>
        </div>

        {/* Status Text */}
        <div className="status-text" style={{ color: statusColor }}>
          {update.status}
        </div>
      </div>
    );
  };

  return (
    <div className="attendance-updates-panel">
      {/* Header */}
      <div className="panel-header">
        <h3 className="panel-title">
          Live Attendance Updates
          {updates.length > 0 && (
            <span className="update-count">({updates.length})</span>
          )}
        </h3>
        
        {/* Stats */}
        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Present:</span>
            <span className="stat-value present">{groupedUpdates.present.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Absent:</span>
            <span className="stat-value absent">{groupedUpdates.absent.length}</span>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="loading-container">
          <div className="loader"></div>
          <span>Listening for updates...</span>
        </div>
      )}

      {/* Updates List */}
      <div className="updates-list">
        {displayUpdates.length > 0 ? (
          displayUpdates.map((update, index) => renderUpdateItem(update, index))
        ) : (
          <div className="no-updates">
            <p>No attendance updates yet</p>
            <small>Updates will appear here when attendance is marked</small>
          </div>
        )}
      </div>

      {/* Show More Info */}
      {updates.length > maxDisplay && (
        <div className="more-info">
          Showing {maxDisplay} of {updates.length} updates
        </div>
      )}
    </div>
  );
};

export default AttendanceUpdatesPanel;
