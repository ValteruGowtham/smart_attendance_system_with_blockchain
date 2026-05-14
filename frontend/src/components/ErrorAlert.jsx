/**
 * ErrorAlert.jsx
 * Reusable error alert component with actions and dismiss
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineArrowPath,
} from 'react-icons/hi2';

const ErrorAlert = ({
  error,
  onDismiss,
  onRetry,
  autoDismiss = true,
  dismissTimeout = 8000,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss functionality
  useEffect(() => {
    if (!autoDismiss || !error) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, dismissTimeout);

    return () => clearTimeout(timer);
  }, [error, autoDismiss, dismissTimeout]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  const handleRetry = () => {
    setIsVisible(false);
    setTimeout(() => {
      onRetry?.();
      setIsVisible(true);
    }, 100);
  };

  if (!error || !isVisible) return null;

  // Determine icon and colors based on error type
  const getErrorConfig = () => {
    const type = error.error_type || error.type;

    if (type === 'camera_permission_denied' || type === 'permission_denied') {
      return {
        icon: HiOutlineExclamationCircle,
        bgColor: 'bg-red-900/20',
        borderColor: 'border-red-700',
        textColor: 'text-red-100',
        accentColor: 'text-red-400',
        badge: '🔒',
      };
    }

    if (type === 'network_timeout' || type === 'network_unreachable') {
      return {
        icon: HiOutlineExclamationCircle,
        bgColor: 'bg-orange-900/20',
        borderColor: 'border-orange-700',
        textColor: 'text-orange-100',
        accentColor: 'text-orange-400',
        badge: '🌐',
      };
    }

    if (type === 'blockchain_transaction_failed' || type === 'blockchain_timeout') {
      return {
        icon: HiOutlineInformationCircle,
        bgColor: 'bg-blue-900/20',
        borderColor: 'border-blue-700',
        textColor: 'text-blue-100',
        accentColor: 'text-blue-400',
        badge: '⛓️',
      };
    }

    if (type === 'duplicate_attendance' || type === 'attendance_already_marked') {
      return {
        icon: HiOutlineInformationCircle,
        bgColor: 'bg-cyan-900/20',
        borderColor: 'border-cyan-700',
        textColor: 'text-cyan-100',
        accentColor: 'text-cyan-400',
        badge: '⏰',
      };
    }

    // Default error styling
    return {
      icon: HiOutlineExclamationCircle,
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-700',
      textColor: 'text-red-100',
      accentColor: 'text-red-400',
      badge: '❌',
    };
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  // Extract message
  const title = error.title || 'Error';
  const message = error.message || error.user_message || 'An error occurred';
  const details = error.details || {};
  const canRetry = error.retry_possible ?? false;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={`rounded-lg border-2 p-4 ${config.bgColor} ${config.borderColor} ${config.textColor} ${className}`}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Icon className={`h-6 w-6 ${config.accentColor}`} />
              </motion.div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <p className="text-sm opacity-90 mt-1">{message}</p>

                  {/* Details */}
                  {details.recommendation && (
                    <p className="text-xs opacity-75 mt-2 pl-2 border-l-2 border-current">
                      💡 {details.recommendation}
                    </p>
                  )}

                  {details.resolution && (
                    <p className="text-xs opacity-75 mt-2 pl-2 border-l-2 border-current">
                      🔧 {details.resolution}
                    </p>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 opacity-75 hover:opacity-100 transition-opacity"
                  aria-label="Dismiss"
                >
                  <HiOutlineXMark className="h-5 w-5" />
                </button>
              </div>

              {/* Action buttons */}
              {(canRetry || onRetry) && (
                <div className="mt-3 flex gap-2">
                  {canRetry && onRetry && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRetry}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium ${config.accentColor} border ${config.borderColor} hover:${config.bgColor} transition-all`}
                    >
                      <HiOutlineArrowPath className="h-4 w-4" />
                      Retry
                    </motion.button>
                  )}
                </div>
              )}

              {/* Auto-retry info */}
              {error.fallback_possible && error.error_type?.includes('blockchain') && (
                <p className="text-xs opacity-75 mt-2">
                  ✓ Will retry automatically in background
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorAlert;
