'use client';

import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  color = '#5E6AD2',
}) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="h-1.5 w-full bg-bg-tertiary rounded-full overflow-hidden">
      <div
        className="h-full transition-all duration-300 ease-out"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
};
