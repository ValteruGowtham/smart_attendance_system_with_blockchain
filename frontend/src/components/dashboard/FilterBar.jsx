import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineFilter, HiOutlineX } from 'react-icons/hi';
import { Input, Select, Button } from '../ui';

export const FilterBar = ({ filters = [], onFilter, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const handleFilterChange = (filterId, value) => {
    const updated = { ...activeFilters, [filterId]: value };
    setActiveFilters(updated);
    onFilter?.(updated);
  };

  const handleReset = () => {
    setActiveFilters({});
    onReset?.();
  };

  const hasActiveFilters = Object.values(activeFilters).some(v => v !== undefined && v !== '');

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all font-medium text-gray-700 dark:text-gray-300"
      >
        <HiOutlineFilter size={18} />
        Filters
        {hasActiveFilters && (
          <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded text-xs font-bold">
            {Object.values(activeFilters).filter(v => v !== undefined && v !== '').length}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filters.map((filter) => (
                <div key={filter.id}>
                  {filter.type === 'text' ? (
                    <Input
                      label={filter.label}
                      placeholder={filter.placeholder}
                      value={activeFilters[filter.id] || ''}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    />
                  ) : filter.type === 'select' ? (
                    <Select
                      label={filter.label}
                      options={filter.options || []}
                      value={activeFilters[filter.id] || ''}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    />
                  ) : filter.type === 'date' ? (
                    <Input
                      label={filter.label}
                      type="date"
                      value={activeFilters[filter.id] || ''}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    />
                  ) : null}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  className="flex items-center gap-2"
                >
                  <HiOutlineX size={16} />
                  Reset Filters
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterBar;
