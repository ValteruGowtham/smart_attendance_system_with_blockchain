import React from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineExclamation,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineX,
} from 'react-icons/hi';

export const AlertCard = ({ type = 'info', title, message, action, onClose, icon: CustomIcon }) => {
  const alertConfig = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-700',
      icon: HiOutlineInformationCircle,
      iconColor: 'text-blue-600 dark:text-blue-500',
      title: 'text-blue-900 dark:text-blue-100',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-700',
      icon: HiOutlineCheckCircle,
      iconColor: 'text-green-600 dark:text-green-500',
      title: 'text-green-900 dark:text-green-100',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-700',
      icon: HiOutlineExclamation,
      iconColor: 'text-yellow-600 dark:text-yellow-500',
      title: 'text-yellow-900 dark:text-yellow-100',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-700',
      icon: HiOutlineExclamation,
      iconColor: 'text-red-600 dark:text-red-500',
      title: 'text-red-900 dark:text-red-100',
    },
  };

  const config = alertConfig[type] || alertConfig.info;
  const Icon = CustomIcon || config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${config.bg} border ${config.border} rounded-lg p-4 flex gap-4`}
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />

      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-sm ${config.title}`}>{title}</h3>
        <p className={`text-sm opacity-75 mt-1 ${config.title}`}>{message}</p>
        {action && (
          <button className={`text-sm font-medium mt-2 hover:opacity-75 transition ${config.title}`}>
            {action.label}
          </button>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
        >
          <HiOutlineX size={18} />
        </button>
      )}
    </motion.div>
  );
};

export const AlertsList = ({ alerts = [] }) => {
  const [visibleAlerts, setVisibleAlerts] = React.useState(alerts);

  return (
    <div className="space-y-3">
      {visibleAlerts.map((alert) => (
        <AlertCard
          key={alert.id}
          {...alert}
          onClose={() => setVisibleAlerts(prev => prev.filter(a => a.id !== alert.id))}
        />
      ))}
    </div>
  );
};

export default AlertCard;
