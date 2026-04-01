/**
 * Sidebar Navigation Component
 * Responsive sidebar with theme toggle and navigation
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  FiMenu,
  FiX,
  FiHome,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiMoon,
  FiSun,
} from 'react-icons/fi';

const Sidebar = ({ activeTab, onTabChange, userRole = 'admin' }) => {
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = {
    admin: [
      { id: 'home', label: 'Dashboard', icon: FiHome },
      { id: 'students', label: 'Students', icon: FiUsers },
      { id: 'faculty', label: 'Faculty', icon: FiUsers },
      { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
      { id: 'settings', label: 'Settings', icon: FiSettings },
    ],
    faculty: [
      { id: 'home', label: 'Dashboard', icon: FiHome },
      { id: 'classes', label: 'My Classes', icon: FiBarChart2 },
      { id: 'students', label: 'Students', icon: FiUsers },
      { id: 'settings', label: 'Settings', icon: FiSettings },
    ],
    student: [
      { id: 'home', label: 'My Attendance', icon: FiHome },
      { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
      { id: 'settings', label: 'Settings', icon: FiSettings },
    ],
  };

  const items = navigationItems[userRole] || navigationItems.student;

  const sidebarVariants = {
    hidden: { x: -256, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: { x: -256, opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05 },
    }),
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed top-4 left-4 z-50 p-2 rounded-lg lg:hidden
          ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          shadow-lg hover:shadow-xl transition-shadow
        `}
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={isOpen || window.innerWidth >= 1024 ? 'visible' : 'hidden'}
        exit="exit"
        className={`
          fixed left-0 top-0 h-screen w-64 z-40 lg:z-auto lg:static
          ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
          border-r shadow-2xl lg:shadow-none
          overflow-y-auto
        `}
      >
        {/* Sidebar Header */}
        <div className={`
          p-6 border-b
          ${isDark ? 'border-gray-800' : 'border-gray-200'}
        `}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <F1 className="text-white text-xl font-bold">A</F1>
            </div>
            <div>
              <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                SmartAttend
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-4 py-8 space-y-2">
          {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                custom={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                onClick={() => {
                  onTabChange(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? isDark
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                      : isDark
                        ? 'text-gray-400 hover:bg-gray-800/50'
                        : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className={`
          absolute bottom-0 left-0 right-0 p-4 space-y-2
          border-t
          ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}
        `}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`
              w-full flex items-center gap-3 px-4 py-2 rounded-lg
              transition-all duration-200
              ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}
            `}
          >
            {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Logout Button */}
          <button
            className={`
              w-full flex items-center gap-3 px-4 py-2 rounded-lg
              transition-all duration-200
              ${isDark
                ? 'text-red-400 hover:bg-red-500/10'
                : 'text-red-600 hover:bg-red-50'
              }
            `}
          >
            <FiLogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Close sidebar on lg screens when clicking a nav item */}
      {typeof window !== 'undefined' && (
        <motion.div
          className="hidden lg:block flex-1"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
