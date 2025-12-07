'use client';

import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, List, LayoutGrid, Columns, Target, Plus } from 'lucide-react';
import { Button } from '@/components/ui';

export type DayViewMode = 'timeline' | 'agenda' | 'schedule' | 'kanban' | 'focus';

interface DayViewHeaderProps {
  selectedDate: Date;
  viewMode: DayViewMode;
  onViewModeChange: (mode: DayViewMode) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onToday: () => void;
  onAddTask: () => void;
}

export const DayViewHeader: React.FC<DayViewHeaderProps> = ({
  selectedDate,
  viewMode,
  onViewModeChange,
  onNavigate,
  onToday,
  onAddTask,
}) => {
  const viewOptions: { mode: DayViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'timeline', label: 'Timeline', icon: <Clock size={14} /> },
    { mode: 'agenda', label: 'Agenda', icon: <List size={14} /> },
    { mode: 'schedule', label: 'Schedule', icon: <LayoutGrid size={14} /> },
    { mode: 'kanban', label: 'Kanban', icon: <Columns size={14} /> },
    { mode: 'focus', label: 'Focus', icon: <Target size={14} /> },
  ];

  return (
    <div className="flex flex-col gap-3 md:gap-0 md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
      {/* Title and Date Navigation - Mobile */}
      <div className="flex items-center justify-between md:hidden">
        <h1 className="text-xl font-bold">Day View</h1>
        <Button size="sm" onClick={onAddTask} className="ml-auto">
          <Plus size={16} />
        </Button>
      </div>

      {/* Title - Desktop */}
      <h1 className="hidden md:block text-2xl font-bold">Day View</h1>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
        {/* View Toggle - Scrollable on mobile */}
        <div className="flex items-center gap-1 bg-bg-tertiary rounded-lg p-1 overflow-x-auto">
          {viewOptions.map((option) => (
            <button
              key={option.mode}
              onClick={() => onViewModeChange(option.mode)}
              className={`flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                viewMode === option.mode
                  ? 'bg-bg-secondary text-text-primary shadow-sm'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
              title={`${option.label} View`}
            >
              {option.icon}
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 md:gap-2 bg-bg-secondary border border-bg-active rounded-lg p-1 flex-1 md:flex-initial">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('prev')}>
              <ChevronLeft size={16} />
            </Button>
            <span className="text-xs md:text-sm font-medium px-1 md:px-2 md:min-w-[180px] text-center flex-1">
              {format(selectedDate, 'EEE, MMM d, yyyy')}
            </span>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('next')}>
              <ChevronRight size={16} />
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={onToday} className="hidden md:flex">
            Today
          </Button>

          <Button size="sm" onClick={onAddTask} className="hidden md:flex">
            <Plus size={16} className="mr-1" /> Add Task
          </Button>
        </div>
      </div>
    </div>
  );
};
