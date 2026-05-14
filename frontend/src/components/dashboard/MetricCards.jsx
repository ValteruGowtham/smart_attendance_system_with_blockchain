import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineTrendingUp, HiOutlineTrendingDown } from 'react-icons/hi';

export const KPICard = ({ icon: Icon, label, value, change, changeType = 'positive', color = 'blue', loading = false }) => {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700',
    green: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700',
    purple: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700',
    orange: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700',
    red: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700',
  };

  const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-500',
    green: 'text-green-600 dark:text-green-500',
    purple: 'text-purple-600 dark:text-purple-500',
    orange: 'text-orange-600 dark:text-orange-500',
    red: 'text-red-600 dark:text-red-500',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{label}</p>
          {loading ? (
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mt-2 animate-pulse" />
          ) : (
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          )}
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'positive' ? <HiOutlineTrendingUp size={16} /> : <HiOutlineTrendingDown size={16} />}
              <span>{Math.abs(change)}% {changeType === 'positive' ? 'increase' : 'decrease'}</span>
            </div>
          )}
        </div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={`w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm ${iconColorClasses[color]}`}
        >
          <Icon size={24} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export const MetricCard = ({ icon: Icon, title, value, subtitle, status = 'normal', onClick }) => {
  const statusColors = {
    normal: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400',
    critical: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`border rounded-xl p-4 cursor-pointer transition-all ${statusColors[status]}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white dark:bg-slate-800 opcity-50">
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs opacity-60 mt-1">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default KPICard;
