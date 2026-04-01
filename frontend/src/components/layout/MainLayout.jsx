import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout = ({ children, pageTitle, onRefresh, isRefreshing = false }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Sidebar */}
      <Sidebar />

      {/* TopBar */}
      <TopBar onRefresh={onRefresh} isRefreshing={isRefreshing} />

      {/* Main Content */}
      <div className="lg:ml-64 mt-16 min-h-screen">
        <div className="p-4 lg:p-8">
          {/* Page Title */}
          {pageTitle && (
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                {pageTitle}
              </h1>
            </div>
          )}

          {/* Content */}
          <div className="max-w-7xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
