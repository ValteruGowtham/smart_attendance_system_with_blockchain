import React from 'react';

export const Input = React.forwardRef(
  ({ label, error, success, type = 'text', placeholder, className = '', ...props }, ref) => (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={`
          w-full px-4 py-2 border rounded-lg
          ${error ? 'border-red-500' : success ? 'border-green-500' : 'border-gray-300 dark:border-gray-700'}
          dark:bg-slate-800 dark:text-white
          focus:outline-none focus:ring-2
          ${error ? 'focus:ring-red-500' : success ? 'focus:ring-green-500' : 'focus:ring-blue-500'}
          transition-colors ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {success && <p className="text-xs text-green-500 mt-1">{success}</p>}
    </div>
  )
);

export const Textarea = React.forwardRef(
  ({ label, error, rows = 4, className = '', ...props }, ref) => (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <textarea ref={ref} rows={rows} className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-slate-800 dark:text-white ${className}`} {...props} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
);

export const Select = React.forwardRef(
  ({ label, options = [], className = '', ...props }, ref) => (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <select ref={ref} className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-slate-800 dark:text-white ${className}`} {...props}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  )
);

export const Checkbox = ({ label, className = '', ...props }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input type="checkbox" className={`w-4 h-4 border-gray-300 rounded ${className}`} {...props} />
    {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
  </label>
);

Input.displayName = 'Input';
Textarea.displayName = 'Textarea';
Select.displayName = 'Select';
Checkbox.displayName = 'Checkbox';

export default Input;
