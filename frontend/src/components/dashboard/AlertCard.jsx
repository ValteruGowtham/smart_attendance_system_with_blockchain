import React, { useState } from 'react';
import {
  HiInformationCircle,
  HiCheckCircle,
  HiExclamation,
  HiXCircle,
} from 'react-icons/hi';

/**
 * AlertCard - Display alerts/warnings/info messages
 * Clean, simple alert component for light background
 */
const AlertCard = ({ type = 'info', title, message, onClose }) => {
  const [visible, setVisible] = useState(true);

  const typeConfig = {
    info: {
      border: 'border-blue-100',
      bg: 'bg-blue-50',
      icon: HiInformationCircle,
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
    },
    success: {
      border: 'border-green-100',
      bg: 'bg-green-50',
      icon: HiCheckCircle,
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      messageColor: 'text-green-700',
    },
    warning: {
      border: 'border-yellow-100',
      bg: 'bg-yellow-50',
      icon: HiExclamation,
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      messageColor: 'text-yellow-700',
    },
    error: {
      border: 'border-red-100',
      bg: 'bg-red-50',
      icon: HiXCircle,
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div className={`border ${config.border} ${config.bg} rounded-xl p-4 flex gap-4`}
      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <h4 className={`font-semibold text-sm ${config.titleColor}`}>{title}</h4>
        <p className={`text-sm mt-1 ${config.messageColor}`}>{message}</p>
      </div>
      <button
        onClick={handleClose}
        className={`text-slate-400 hover:text-slate-600 flex-shrink-0 transition-colors`}
      >
        ✕
      </button>
    </div>
  );
};

export default AlertCard;
