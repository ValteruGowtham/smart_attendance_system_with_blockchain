import React from 'react';

/**
 * ChartCard - Wrapper component for displaying charts
 * Usage: Line charts, bar charts, pie charts, etc.
 */
const ChartCard = ({ title, subtitle, children, loading = false }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>

      {/* Content */}
      <div className="h-80 flex items-center justify-center bg-slate-50 rounded-lg">
        {loading ? (
          <div className="text-slate-400">Loading chart...</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default ChartCard;
