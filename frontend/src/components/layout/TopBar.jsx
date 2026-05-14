import React, { useState } from 'react';
import {
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineRefresh,
} from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const TopBar = ({ onRefresh, isRefreshing = false }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user } = useAuth();

  // Mock notifications
  const notifications = [
    { id: 1, title: 'Low Attendance Alert', message: 'Student ID 101 attendance < 75%', time: '5 mins', read: false },
    { id: 2, title: 'Faculty Online', message: 'Dr. Kumar is now online', time: '30 mins', read: true },
    { id: 3, title: 'System Update', message: 'Weekly data sync completed', time: '2 hours', read: true },
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 z-30 backdrop-blur-sm bg-opacity-95">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Search Bar */}
        <motion.div
          className="flex-1 max-w-md"
          animate={{ width: searchOpen ? '100%' : 'auto' }}
        >
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search students, faculty, records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </motion.div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Refresh Button */}
          {onRefresh && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-600 dark:text-gray-400"
              title="Refresh dashboard"
            >
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
              >
                <HiOutlineRefresh size={20} />
              </motion.div>
            </motion.button>
          )}

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-600 dark:text-gray-400"
            >
              <HiOutlineBell size={20} />
              {unreadNotifications > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                >
                  {unreadNotifications}
                </motion.span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
                        !notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{notif.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                </div>
              </motion.div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:inline truncate max-w-24">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
            </motion.button>

            {/* User Dropdown */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.email || 'user@example.com'}</p>
                </div>
                <div className="p-2 space-y-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm">
                    <HiOutlineUser size={18} />
                    View Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm">
                    <HiOutlineCog size={18} />
                    Settings
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
