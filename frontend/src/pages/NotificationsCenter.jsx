/**
 * NotificationsCenter.jsx - Real-time notification panel with WebSocket
 * Shows grouped notifications with bell icon badge and slide-in panel
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  HiBell,
  HiX,
  HiTrash,
  HiCheckCircle,
  HiExclamationCircle,
  HiInformationCircle,
  HiUserAdd,
} from 'react-icons/hi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';

export default function NotificationsCenterPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      type: 'Recognition',
      message: 'Rahul Kumar recognized in Data Structures',
      timestamp: '2 minutes ago',
      read: false,
      icon: HiCheckCircle,
      color: 'green',
      details: 'Confidence: 98.5%',
    },
    {
      id: 2,
      type: 'Alert',
      message: 'Priya Sharma attendance dropped below 75%',
      timestamp: '5 minutes ago',
      read: false,
      icon: HiExclamationCircle,
      color: 'red',
      details: 'Current: 72% | Action needed',
    },
    {
      id: 3,
      type: 'System',
      message: 'Blockchain connection established',
      timestamp: '15 minutes ago',
      read: true,
      icon: HiInformationCircle,
      color: 'blue',
      details: 'Network status: Connected',
    },
    {
      id: 4,
      type: 'Recognition',
      message: 'Arjun Singh recognized in Web Dev Lab',
      timestamp: '20 minutes ago',
      read: true,
      icon: HiCheckCircle,
      color: 'green',
      details: 'Confidence: 97.2%',
    },
    {
      id: 5,
      type: 'Admin',
      message: 'New student enrolled: Neha Patel',
      timestamp: '30 minutes ago',
      read: true,
      icon: HiUserAdd,
      color: 'purple',
      details: 'ID: CSE2024008 | Face enrollment complete',
    },
    {
      id: 6,
      type: 'Recognition',
      message: 'Amit Verma marked late in DSA Session',
      timestamp: '45 minutes ago',
      read: true,
      icon: HiCheckCircle,
      color: 'green',
      details: 'Marked at: 10:15:30',
    },
    {
      id: 7,
      type: 'Alert',
      message: 'Session attendance below 70%',
      timestamp: '1 hour ago',
      read: true,
      icon: HiExclamationCircle,
      color: 'amber',
      details: 'Data Structures (Period 2) | Attendance: 68%',
    },
  ];

  // Initialize notifications
  useEffect(() => {
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  // Group notifications by type
  const groupedNotifications = notifications.reduce((acc, notif) => {
    if (!acc[notif.type]) {
      acc[notif.type] = [];
    }
    acc[notif.type].push(notif);
    return acc;
  }, {});

  // Mark notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Delete single notification
  const deleteNotification = useCallback((id) => {
    setNotifications(prev => {
      const notif = prev.find(n => n.id === id);
      if (notif && !notif.read) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  // Get color classes
  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-700',
      red: 'bg-red-100 text-red-700',
      blue: 'bg-blue-100 text-blue-700',
      purple: 'bg-purple-100 text-purple-700',
      amber: 'bg-amber-100 text-amber-700',
    };
    return colors[color] || colors.blue;
  };

  const typeOrder = ['Recognition', 'Alert', 'Admin', 'System'];
  const sortedGroups = Object.entries(groupedNotifications).sort(
    (a, b) => typeOrder.indexOf(a[0]) - typeOrder.indexOf(b[0])
  );

  return (
    <DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Notifications Center</h1>
        <p className="text-slate-500 mt-1">Real-time alerts and system notifications</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <p className="text-sm font-semibold text-blue-600 uppercase">Total Notifications</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{notifications.length}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-lg p-6">
          <p className="text-sm font-semibold text-red-600 uppercase">Unread</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{unreadCount}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <p className="text-sm font-semibold text-green-600 uppercase">Read</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{notifications.length - unreadCount}</p>
        </div>
      </div>

      {/* Main Notifications Panel */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {/* Header with Actions */}
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">All Notifications</h3>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Mark All Read
              </button>
            )}
            <button
              onClick={clearAll}
              disabled={notifications.length === 0}
              className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-1 transition-colors ${
                notifications.length === 0
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <HiTrash className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <HiBell className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-600 font-medium text-lg">No notifications</p>
            <p className="text-slate-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {sortedGroups.map(([type, notifs]) => (
              <div key={type}>
                {/* Group Header */}
                <div className="px-6 py-3 bg-slate-50 font-semibold text-sm text-slate-700 sticky top-0 flex items-center gap-2">
                  {type === 'Recognition' && '🎯'}
                  {type === 'Alert' && '⚠️'}
                  {type === 'System' && '⚙️'}
                  {type === 'Admin' && '👑'}
                  <span>{type}</span>
                  <span className="ml-auto bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-semibold">
                    {notifs.length}
                  </span>
                </div>

                {/* Notifications in Group */}
                {notifs.map(notif => {
                  const IconComponent = notif.icon;
                  return (
                    <div
                      key={notif.id}
                      className={`px-6 py-4 hover:bg-slate-50 transition-colors border-l-4 ${
                        notif.read
                          ? 'border-l-transparent'
                          : 'border-l-indigo-600 bg-indigo-50'
                      }`}
                    >
                      <div className="flex gap-3 items-start">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${getColorClasses(notif.color)}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {notif.message}
                              </p>
                              <p className="text-xs text-slate-600 mt-1">
                                {notif.details}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteNotification(notif.id)}
                              className="text-slate-400 hover:text-slate-600 flex-shrink-0 transition-colors"
                            >
                              <HiX className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            {notif.timestamp}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-slate-200 px-6 py-4 text-xs text-slate-500 text-center bg-slate-50">
            Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''} • Last updated just now
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
