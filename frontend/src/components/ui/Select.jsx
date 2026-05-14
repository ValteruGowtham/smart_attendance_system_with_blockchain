import React, { useState } from 'react';
import { HiOutlineChevronDown } from 'react-icons/hi';

export const SelectDropdown = React.forwardRef(
  ({ label, options = [], placeholder = 'Select option...', className = '', onChange, value, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;
    
    return (
      <div className="relative">
        {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
        <button
          ref={ref}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
            dark:bg-slate-800 dark:text-white text-left
            flex justify-between items-center
            hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${className}
          `}
          {...props}
        >
          <span>{selectedLabel}</span>
          <HiOutlineChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-10">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange?.({ target: { value: opt.value } }); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 ${value === opt.value ? 'bg-blue-100 dark:bg-slate-700 text-blue-700 dark:text-blue-400 font-medium' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

SelectDropdown.displayName = 'SelectDropdown';

export default SelectDropdown;
