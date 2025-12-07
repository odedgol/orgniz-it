'use client';

import { useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';

/**
 * Hook to update the Dock badge with the count of incomplete tasks for today.
 * Only works in Electron - in browser it's a no-op.
 */
export const useDockBadge = () => {
  const { tasks } = useTaskStore();

  useEffect(() => {
    const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

    if (!isElectron || !window.electronAPI?.setBadge) {
      return;
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Count incomplete tasks for today
    const incompleteCount = tasks.filter(
      (task) => task.date === today && !task.completed
    ).length;

    // Update the dock badge
    if (incompleteCount > 0) {
      window.electronAPI.setBadge(incompleteCount);
      console.log('[useDockBadge] Set badge to:', incompleteCount);
    } else {
      window.electronAPI.clearBadge();
      console.log('[useDockBadge] Cleared badge');
    }
  }, [tasks]);
};

export default useDockBadge;
