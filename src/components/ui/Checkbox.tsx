'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  className,
}) => {
  return (
    <button
      onClick={onChange}
      className={cn(
        'w-5 h-5 rounded-full border flex items-center justify-center transition-all',
        checked
          ? 'bg-accent-green border-accent-green text-bg-primary'
          : 'border-text-muted hover:border-text-primary',
        className
      )}
    >
      {checked && <Check size={12} strokeWidth={4} />}
    </button>
  );
};
