import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HiHome,
  HiUsers,
  HiAcademicCap,
  HiClipboardList,
  HiChartBar,
  HiCog,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

/**
 * Sidebar - Fixed left sidebar navigation (240px)
 * Displays role-based menu and user info
 */
const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const userRole = user?.role?.toLowerCase() || 'student';

  const navigationItems = {
    admin: [
      { label: 'Dashboard', icon: HiHome, path: '/admin' },
      { label: 'Students', icon: HiUsers, path: '/admin/students' },
      { label: 'Faculty', icon: HiAcademicCap, path: '/admin/faculty' },
      { label: 'Attendance', icon: HiClipboardList, path: '/admin/attendance' },
      { label: 'Add Student', icon: HiUsers, path: '/admin/add-student' },
      { label: 'Add Faculty', icon: HiAcademicCap, path: '/admin/add-faculty' },
    ],
    faculty: [
      { label: 'Dashboard', icon: HiHome, path: '/faculty/dashboard' },
      { label: 'Session Report', icon: HiClipboardList, path: '/faculty/session-report' },
      { label: 'Alerts', icon: HiChartBar, path: '/faculty/attendance-alerts' },
      { label: 'Update Profile', icon: HiCog, path: '/faculty/profile' },
    ],
    student: [
      { label: 'Dashboard', icon: HiHome, path: '/student/dashboard' },
      { label: 'Calendar', icon: HiClipboardList, path: '/student/attendance-calendar' },
      { label: 'Update Profile', icon: HiCog, path: '/student/profile' },
      { label: 'Notifications', icon: HiChartBar, path: '/student/notifications' },
    ],
  };

  const menu = navigationItems[userRole] || navigationItems.student;
  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <HiAcademicCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm">Smart Attendance</h1>
            <p className="text-xs text-slate-500">System</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                active
                  ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info Section */}
      <div className="border-t border-slate-200 p-4 space-y-3">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Logged in as</p>
          <p className="font-semibold text-slate-900 text-sm truncate">
            {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username || 'User'}
          </p>
          <p className="text-xs text-slate-500 capitalize">{userRole}</p>
        </div>
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
