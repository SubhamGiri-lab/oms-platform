import React from 'react';

export default function Skeleton({ className = '', count = 1, variant = 'rect' }) {
  const items = Array.from({ length: count });
  return (
    <div className={`skeleton-root ${className}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200 dark:bg-slate-700 ${
            variant === 'rect' ? 'rounded-md' : 'rounded-full'
          }`}
          style={{ height: variant === 'rect' ? undefined : 12 }}
        >
          &nbsp;
        </div>
      ))}
    </div>
  );
}
