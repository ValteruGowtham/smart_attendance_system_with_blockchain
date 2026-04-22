import React from 'react';

/**
 * StatCard - Displays a single metric with icon
 * Usage: KPI metrics, statistics display
 */
const StatCard = ({ icon: Icon, label, value, change, changeType = 'positive', color = 'blue' }) => {
  const colorMap = {
    blue: 'border-slate-200',
    green: 'border-slate-200',
    purple: 'border-slate-200',
    orange: 'border-slate-200',
    red: 'border-slate-200',
  };

  const iconColorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className={`bg-white border rounded-xl p-6 ${colorMap[color]} hover:shadow-sm transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {change !== undefined && (
            <p className={`text-xs font-semibold mt-2 ${changeType === 'positive' ? 'text-green-600' : 'text-red-500'}`}>
              {changeType === 'positive' ? '↑' : '↓'} {Math.abs(change)}% from last month
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColorMap[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
