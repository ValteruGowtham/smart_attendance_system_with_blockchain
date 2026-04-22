import React from 'react';

const Button = React.forwardRef(
  ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    onClick,
    className = '',
    ...props
  }, ref) => {
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-300 hover:bg-gray-400 text-gray-900',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
      ghost: 'text-gray-700 hover:bg-gray-100',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const baseClasses = `
      inline-flex items-center gap-2 rounded-lg font-medium
      transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
      ${variants[variant] || variants.primary}
      ${sizes[size] || sizes.md}
      ${className}
    `;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        onClick={onClick}
        className={baseClasses}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : Icon ? (
          <Icon className="w-5 h-5" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export default Button;
