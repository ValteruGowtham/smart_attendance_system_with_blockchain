import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const userRole = user?.role?.toLowerCase() || 'student';

  const navigationItems = {
    admin: [
      { icon: HiOutlineHome, label: 'Dashboard', path: '/admin' },
      { icon: HiOutlineUserGroup, label: 'Students', path: '/admin/students' },
      { icon: HiOutlineAcademicCap, label: 'Faculty', path: '/admin/faculty' },
      { icon: HiOutlineClipboardList, label: 'Attendance', path: '/admin/attendance' },
      { icon: HiOutlineChartBar, label: 'Reports', path: '/admin/reports' },
      { icon: HiOutlineCog, label: 'Settings', path: '/admin/settings' },
    ],
    faculty: [
      { icon: HiOutlineHome, label: 'Dashboard', path: '/faculty' },
      { icon: HiOutlineClipboardList, label: 'Attendance', path: '/faculty/attendance' },
      { icon: HiOutlineChartBar, label: 'Reports', path: '/faculty/reports' },
      { icon: HiOutlineCog, label: 'Settings', path: '/faculty/settings' },
    ],
    student: [
      { icon: HiOutlineHome, label: 'Dashboard', path: '/student' },
      { icon: HiOutlineClipboardList, label: 'My Attendance', path: '/student/attendance' },
      { icon: HiOutlineChartBar, label: 'Reports', path: '/student/reports' },
      { icon: HiOutlineCog, label: 'Settings', path: '/student/settings' },
    ],
  };

  const items = navigationItems[userRole] || navigationItems.student;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {isOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-r border-gray-200 dark:border-gray-700 z-40 lg:relative lg:translate-x-0 lg:animate-none overflow-y-auto"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">AI Attendance</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
              {isActive(item.path) && (
                <motion.div layoutId="activeIndicator" className="ml-auto w-1 h-6 bg-white rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-4 my-4 border-t border-gray-200 dark:border-gray-700" />

        {/* User Info */}
        <div className="p-4 space-y-3">
          <div className="px-4 py-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Logged in as</p>
            <p className="font-medium text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</p>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
          >
            <HiOutlineLogout size={20} />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Close on mobile when clicking a link */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
