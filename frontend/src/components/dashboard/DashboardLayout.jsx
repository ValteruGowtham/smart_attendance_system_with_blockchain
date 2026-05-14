import React from 'react';

/**
 * DashboardLayout - Main wrapper component for dashboard pages
 * Provides: fixed sidebar (240px), top navbar (64px), main content area
 */
const DashboardLayout = ({ children, sidebar, navbar }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-slate-200 z-40">
        {sidebar}
      </div>

      {/* Top Navbar */}
      <div className="fixed top-0 right-0 left-60 h-16 bg-white border-b border-slate-200 z-30">
        {navbar}
      </div>

      {/* Main Content Area */}
      <div className="ml-60 mt-16">
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
