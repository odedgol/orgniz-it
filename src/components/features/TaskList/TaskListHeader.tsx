'use client';

import React from 'react';
import { Clock, Grid3X3 } from 'lucide-react';

interface TaskListHeaderProps {
  completed: number;
  total: number;
  viewMode: 'timeline' | 'grouped';
  onViewModeChange: (mode: 'timeline' | 'grouped') => void;
}

export const TaskListHeader: React.FC<TaskListHeaderProps> = ({
  completed,
  total,
  viewMode,
  onViewModeChange,
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex items-center justify-between p-4 border-b border-bg-active">
      <div className="flex-1">
        <h2 className="text-base font-semibold text-text-primary mb-2">Today's Focus</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary">
            {completed} of {total} completed
          </span>
          <div className="w-20 h-1 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-green rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1 bg-bg-tertiary rounded-lg p-1">
        <button
          onClick={() => onViewModeChange('timeline')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            viewMode === 'timeline'
              ? 'bg-bg-secondary text-text-primary shadow-sm'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
          title="Timeline View"
        >
          <Clock size={14} />
          Timeline
        </button>
        <button
          onClick={() => onViewModeChange('grouped')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            viewMode === 'grouped'
              ? 'bg-bg-secondary text-text-primary shadow-sm'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
          title="Grouped View"
        >
          <Grid3X3 size={14} />
          Grouped
        </button>
      </div>
    </div>
  );
};
