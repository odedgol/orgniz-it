'use client';

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import { useTaskStore } from '@/src/stores/taskStore';
import { formatDate } from '@/src/lib/utils';

export function useStreak() {
  const { user, updateStreak } = useAuthStore();
  const { tasks } = useTaskStore();

  const calculateStreak = useCallback(() => {
    if (!user) return;

    const today = formatDate(new Date());
    const yesterday = formatDate(new Date(Date.now() - 86400000));

    // Get today's tasks
    const todayTasks = tasks.filter((t) => t.date === today);
    const todayCompleted = todayTasks.some((t) => t.completed);

    // Get yesterday's tasks
    const yesterdayTasks = tasks.filter((t) => t.date === yesterday);
    const yesterdayCompleted = yesterdayTasks.some((t) => t.completed);

    const lastCompletedDate = user.streak?.lastCompletedDate || '';
    let currentStreak = user.streak?.current || 0;
    let longestStreak = user.streak?.longest || 0;

    // If completed today and last completion was yesterday or today, continue streak
    if (todayCompleted) {
      if (lastCompletedDate === yesterday || lastCompletedDate === today) {
        // Continue streak
        if (lastCompletedDate !== today) {
          currentStreak += 1;
        }
      } else if (lastCompletedDate !== today) {
        // Start new streak
        currentStreak = 1;
      }

      // Update longest if current exceeds it
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      // Update if changed
      if (
        lastCompletedDate !== today ||
        currentStreak !== user.streak?.current ||
        longestStreak !== user.streak?.longest
      ) {
        updateStreak({
          current: currentStreak,
          longest: longestStreak,
          lastCompletedDate: today,
        });
      }
    } else if (lastCompletedDate !== yesterday && lastCompletedDate !== today) {
      // Streak broken - reset if not yesterday or today
      if (currentStreak > 0) {
        updateStreak({
          current: 0,
          longest: longestStreak,
          lastCompletedDate,
        });
      }
    }
  }, [user, tasks, updateStreak]);

  useEffect(() => {
    calculateStreak();
  }, [calculateStreak]);

  return {
    currentStreak: user?.streak?.current || 0,
    longestStreak: user?.streak?.longest || 0,
    lastCompletedDate: user?.streak?.lastCompletedDate || '',
  };
}
