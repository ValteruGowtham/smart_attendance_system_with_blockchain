import React, { useState } from 'react';
import { HiSearch, HiBell, HiChevronDown } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

/**
 * Topbar - Top navigation bar (64px height)
 * Provides: search, notifications, user profile
 */
const Topbar = () => {
  const [showProfile, setShowProfile] = useState(false);
  const { user } = useAuth();

  return (
    <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-slate-900"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-8">
        {/* Notifications */}
        <button className="relative p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
          <HiBell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-slate-900 hidden sm:inline">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <HiChevronDown className="w-4 h-4 text-slate-600" />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg">
              <div className="p-4 border-b border-slate-200">
                <p className="font-semibold text-slate-900 text-sm">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <div className="p-2 space-y-1">
                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded transition-colors">
                  Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded transition-colors">
                  Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
