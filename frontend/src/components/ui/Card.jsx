import React from 'react';
import { motion } from 'framer-motion';

// Main Card component
export const Card = React.forwardRef(
  ({
    children,
    elevation = 'md',
    interactive = false,
    hoverable = false,
    padding = 'md',
    rounded = 'lg',
    border = false,
    onClick,
    className = '',
    ...props
  }, ref) => {
    const elevationMap = {
      none: 'shadow-none',
      xs: 'shadow-sm',
      sm: 'shadow-md',
      md: 'shadow-lg',
      lg: 'shadow-xl',
      xl: 'shadow-2xl',
    };

    const paddingMap = {
      xs: 'p-2',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-6',
      xl: 'p-8',
    };

    const roundedMap = {
      none: 'rounded-none',
      sm: 'rounded-md',
      md: 'rounded-lg',
      lg: 'rounded-xl',
      xl: 'rounded-2xl',
    };

    const baseClasses = `
      bg-white dark:bg-slate-800
      ${elevationMap[elevation] || elevationMap.md}
      ${paddingMap[padding] || paddingMap.md}
      ${roundedMap[rounded] || roundedMap.lg}
      ${border ? 'border border-slate-200 dark:border-slate-700' : ''}
      transition-all duration-300
      ${interactive ? 'cursor-pointer' : ''}
      ${hoverable ? 'hover:shadow-2xl' : ''}
      ${className}
    `;

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        onClick={onClick}
        whileHover={hoverable ? { y: -2 } : {}}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// CardHeader
export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

// CardTitle
export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-bold text-gray-900 dark:text-white ${className}`}>
    {children}
  </h3>
);

// CardDescription
export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${className}`}>
    {children}
  </p>
);

// CardContent
export const CardContent = ({ children, className = '' }) => (
  <div className={`my-3 ${className}`}>
    {children}
  </div>
);

// CardFooter
export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 ${className}`}>
    {children}
  </div>
);

// StatCard - specialized card for displaying statistics
export const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trendPositive,
  className = '',
}) => (
  <Card elevation="lg" hoverable padding="lg" className={className}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{description}</p>
        )}
      </div>
      {Icon && (
        <Icon className="w-10 h-10 text-blue-500 opacity-20" />
      )}
    </div>
    {trendPositive !== undefined && (
      <div className={`mt-3 text-xs font-semibold ${trendPositive ? 'text-green-600' : 'text-red-600'}`}>
        {trendPositive ? '↑ Trending up' : '↓ Trending down'}
      </div>
    )}
  </Card>
);

// HighlightCard - for important alerts
export const HighlightCard = ({ children, className = '' }) => (
  <Card
    elevation="lg"
    border
    padding="lg"
    className={`bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ${className}`}
  >
    {children}
  </Card>
);

export default Card;
