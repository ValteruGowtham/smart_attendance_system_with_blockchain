import React from 'react';

export const Skeleton = ({ className = '', count = 1, inline = false }) => {
  const skeletonClasses = `animate-pulse bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg ${className}`;
  
  if (inline) {
    return (
      <div className="flex gap-2">
        {Array(count).fill(0).map((_, i) => <div key={i} className={`h-4 w-12 ${skeletonClasses}`} />)}
      </div>
    );
  }
  
  return Array(count).fill(0).map((_, i) => <div key={i} className={`h-6 mb-3 ${skeletonClasses}`} />);
};

export const SkeletonCard = ({ lines = 3 }) => (
  <div className="p-4 space-y-3">
    <Skeleton className="h-4 w-2/3" />
    {Array(lines).fill(0).map((_, i) => <Skeleton key={i} className="h-3 w-full" />)}
  </div>
);

export const SkeletonText = ({ lines = 2, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array(lines).fill(0).map((_, i) => <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />)}
  </div>
);

export const SkeletonAvatar = ({ size = 'md' }) => {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' };
  return <div className={`${sizes[size]} rounded-full animate-pulse bg-gradient-to-r from-gray-300 to-gray-200 dark:from-slate-700 dark:to-slate-600`} />;
};

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="w-full space-y-2">
    {Array(rows).fill(0).map((_, r) => (
      <div key={r} className="flex gap-2">
        {Array(cols).fill(0).map((_, c) => <Skeleton key={c} className="flex-1 h-4" />)}
      </div>
    ))}
  </div>
);

export default Skeleton;
