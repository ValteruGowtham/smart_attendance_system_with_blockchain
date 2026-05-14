import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineXCircle } from 'react-icons/hi';

export const ProgressBar = ({ value, max = 100, label, showPercentage = true, color = 'blue', size = 'md' }) => {
  const percentage = (value / max) * 100;

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          {showPercentage && (
            <span className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full`}
        />
      </div>
    </div>
  );
};

export const AttendanceStatus = ({ percentage, showDetails = false, className = '' }) => {
  let status = 'critical';
  let statusColor = 'red';
  let statusIcon = HiOutlineXCircle;
  let statusText = 'Critical - Action Required';

  if (percentage >= 75) {
    status = 'safe';
    statusColor = 'green';
    statusIcon = HiOutlineCheckCircle;
    statusText = 'Safe - Good Standing';
  } else if (percentage >= 60) {
    status = 'warning';
    statusColor = 'yellow';
    statusIcon = HiOutlineExclamationCircle;
    statusText = 'Warning - Needs Improvement';
  }

  const StatusIcon = statusIcon;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Card */}
      <div className={`bg-${statusColor}-50 dark:bg-${statusColor}-900/20 border border-${statusColor}-200 dark:border-${statusColor}-700 rounded-lg p-6`}>
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <StatusIcon className={`w-12 h-12 text-${statusColor}-600`} />
          </motion.div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold text-${statusColor}-900 dark:text-${statusColor}-100`}>
              {percentage}%
            </h3>
            <p className={`text-sm text-${statusColor}-700 dark:text-${statusColor}-300`}>{statusText}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar
        value={percentage}
        max={100}
        label="Current Attendance"
        color={statusColor}
        size="lg"
      />

      {showDetails && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Required</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">75%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{percentage}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Difference</p>
            <p className={`text-lg font-bold ${percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
              {percentage >= 75 ? '+' : ''}{percentage - 75}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
