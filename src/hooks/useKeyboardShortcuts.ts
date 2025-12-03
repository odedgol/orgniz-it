'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/src/stores/uiStore';

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { toggleCommandPalette } = useUIStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Command palette: Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // Navigation shortcuts with Cmd/Ctrl + number
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            router.push('/');
            break;
          case '2':
            e.preventDefault();
            router.push('/day');
            break;
          case '3':
            e.preventDefault();
            router.push('/month');
            break;
          case '4':
            e.preventDefault();
            router.push('/subjects');
            break;
          case '5':
            e.preventDefault();
            router.push('/jobs');
            break;
          case '6':
            e.preventDefault();
            router.push('/stats');
            break;
        }
        return;
      }

      // Quick add task: N
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        const quickAddInput = document.getElementById('quick-add');
        if (quickAddInput) {
          quickAddInput.focus();
        }
      }
    },
    [router, toggleCommandPalette]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
