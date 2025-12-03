'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Command } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/src/components/ui';
import { useUIStore } from '@/src/stores/uiStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showDateNav?: boolean;
  showViewToggle?: boolean;
  rightContent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showDateNav = false,
  showViewToggle = false,
  rightContent,
}) => {
  const { selectedDate, currentView, setCurrentView, navigateDate } = useUIStore();

  const getDateDisplay = () => {
    switch (currentView) {
      case 'day':
        return format(selectedDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        return format(selectedDate, 'MMMM yyyy');
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
      default:
        return format(selectedDate, 'MMMM d, yyyy');
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        {subtitle && <p className="text-text-secondary mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {showViewToggle && (
          <div className="flex items-center gap-1 bg-bg-secondary border border-bg-active rounded-lg p-1">
            {(['day', 'week', 'month'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                  currentView === view
                    ? 'bg-bg-tertiary text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        )}

        {showDateNav && (
          <div className="flex items-center gap-2 bg-bg-secondary border border-bg-active rounded-lg p-1">
            <Button variant="ghost" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm font-medium px-2 min-w-[160px] text-center">
              {getDateDisplay()}
            </span>
            <Button variant="ghost" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight size={16} />
            </Button>
          </div>
        )}

        {rightContent}
      </div>
    </div>
  );
};
