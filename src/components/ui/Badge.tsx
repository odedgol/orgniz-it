'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = '#5E6AD2',
  className = '',
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium',
        className
      )}
      style={{ backgroundColor: `${color}20`, color: color }}
    >
      {children}
    </span>
  );
};
