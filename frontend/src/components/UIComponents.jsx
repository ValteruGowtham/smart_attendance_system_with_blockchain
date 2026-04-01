/**
 * Reusable UI Components
 * Glassmorphism cards, stat cards, and utility components
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

/**
 * GlassmorphismCard Component
 * Modern glassmorphic card with blur and transparency
 */
export const GlassmorphismCard = ({ children, className = '', hover = true, delay = 0 }) => {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`
        relative
        rounded-2xl
        p-6
        backdrop-blur-md
        border
        overflow-hidden
        group
        ${
          isDark
            ? 'bg-white/10 border-white/20 shadow-2xl shadow-black/20'
            : 'bg-white/40 border-white/60 shadow-2xl shadow-black/10'
        }
        ${hover && 'hover:shadow-2xl transition-all duration-300 cursor-default'}
        ${className}
      `}
    >
      {/* Background gradient effect */}
      <div
        className={`
          absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300
          ${isDark ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10' : 'bg-gradient-to-br from-blue-400/5 to-purple-400/5'}
        `}
      />

      {children}
    </motion.div>
  );
};

/**
 * StatCard Component
 * Displays a single statistic with icon and trend
 */
export const StatCard = ({ title, value, unit = '', trend = null, icon: Icon, color = 'blue', delay = 0 }) => {
  const { isDark } = useTheme();

  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-amber-500',
    red: 'from-red-500 to-pink-500',
  };

  return (
    <GlassmorphismCard delay={delay}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </h3>
            {unit && (
              <span className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {unit}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`
            w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]}
            flex items-center justify-center shadow-lg
          `}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {/* Trend indicator */}
      {trend !== null && (
        <div className={`
          flex items-center gap-1 text-sm font-medium
          ${trend >= 0 ? 'text-green-500' : 'text-red-500'}
        `}>
          <span>{trend >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend)}% from last week</span>
        </div>
      )}
    </GlassmorphismCard>
  );
};

/**
 * ProgressBar Component
 * Animated progress bar with percentage
 */
export const ProgressBar = ({ value, max = 100, color = 'blue', showLabel = true, animated = true }) => {
  const { isDark } = useTheme();
  const percentage = (value / max) * 100;

  const colorMap = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-amber-500',
    red: 'from-red-500 to-pink-500',
  };

  return (
    <div className="w-full">
      <div className={`
        relative w-full h-3 rounded-full overflow-hidden
        ${isDark ? 'bg-gray-700' : 'bg-gray-200'}
      `}>
        <motion.div
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${colorMap[color]} shadow-lg`}
        />
      </div>

      {showLabel && (
        <p className={`text-sm font-medium mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {percentage.toFixed(1)}%
        </p>
      )}
    </div>
  );
};

/**
 * Badge Component
 * Small label/badge for categorization
 */
export const Badge = ({ label, color = 'blue', size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  };

  return (
    <span className={`
      inline-flex items-center rounded-full font-semibold
      ${sizeClasses[size]}
      ${colorClasses[color]}
    `}>
      {label}
    </span>
  );
};

/**
 * EmptyState Component
 * Display when no data is available
 */
export const EmptyState = ({ icon: Icon, title, description, action = null }) => {
  const { isDark } = useTheme();

  return (
    <GlassmorphismCard>
      <div className="flex flex-col items-center justify-center py-12 px-4">
        {Icon && (
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center mb-4
            ${isDark ? 'bg-gray-800' : 'bg-gray-100'}
          `}>
            <Icon className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
        )}

        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>

        <p className={`text-center mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>

        {action && (
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:shadow-lg transition-shadow">
            {action}
          </button>
        )}
      </div>
    </GlassmorphismCard>
  );
};

/**
 * LoadingSpinner Component
 * Animated loading indicator
 */
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`
        rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-500
        ${sizeClasses[size]}
        ${className}
      `}
    />
  );
};

/**
 * Tooltip Component
 * Hover tooltip for additional info
 */
export const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <div className="relative inline-block group">
      <div onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
        {children}
      </div>

      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`
            absolute ${positionClasses[position]} left-1/2 -translate-x-1/2
            bg-gray-900 dark:bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap
            pointer-events-none z-50
          `}
        >
          {content}
        </motion.div>
      )}
    </div>
  );
};

/**
 * SectionHeader Component
 * Header for dashboard sections
 */
export const SectionHeader = ({ title, subtitle = '', action = null }) => {
  const { isDark } = useTheme();

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="ml-auto">
          {action}
        </div>
      )}
    </div>
  );
};

export default {
  GlassmorphismCard,
  StatCard,
  ProgressBar,
  Badge,
  EmptyState,
  LoadingSpinner,
  Tooltip,
  SectionHeader,
};
