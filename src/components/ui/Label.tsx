'use client';

import React from 'react';
import { cn } from '@/src/lib/utils';

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({
  children,
  htmlFor,
  className = '',
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide',
        className
      )}
    >
      {children}
    </label>
  );
};
