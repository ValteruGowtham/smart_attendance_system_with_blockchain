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
      { label: 'Reports', icon: HiChartBar, path: '/admin/reports' },
      { label: 'Settings', icon: HiCog, path: '/admin/settings' },
    ],
    faculty: [
      { label: 'Dashboard', icon: HiHome, path: '/faculty' },
      { label: 'Attendance', icon: HiClipboardList, path: '/faculty/attendance' },
      { label: 'Reports', icon: HiChartBar, path: '/faculty/reports' },
      { label: 'Settings', icon: HiCog, path: '/faculty/settings' },
    ],
    student: [
      { label: 'Dashboard', icon: HiHome, path: '/student' },
      { label: 'My Attendance', icon: HiClipboardList, path: '/student/attendance' },
      { label: 'Reports', icon: HiChartBar, path: '/student/reports' },
      { label: 'Settings', icon: HiCog, path: '/student/settings' },
    ],
  };

  const menu = navigationItems[userRole] || navigationItems.student;
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">AI</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm">AI Attendance</h1>
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
          <p className="font-semibold text-slate-900 text-sm truncate">{user?.name || 'User'}</p>
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
