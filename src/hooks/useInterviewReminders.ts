'use client';

import { useEffect, useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useInterviewStore } from '@/stores/interviewStore';
import { useJobStore } from '@/stores/jobStore';
import { useNotifications } from './useNotifications';
import { showLocalNotification } from '@/lib/firebase-messaging';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

/**
 * Show notification - uses Electron native notifications if available, otherwise browser
 */
const showNotification = async (title: string, body: string, data?: any) => {
  if (isElectron && window.electronAPI?.showNotification) {
    // Use Electron native notifications
    await window.electronAPI.showNotification(title, body, data);
  } else {
    // Fallback to browser notifications (only in browser, not Electron)
    showLocalNotification(title, {
      body,
      tag: data?.tag || 'notification',
      requireInteraction: data?.requireInteraction || false,
    });
  }
};

/**
 * Hook that checks for upcoming interviews and shows notifications
 * This runs on the client side when the app is open
 */
export const useInterviewReminders = () => {
  const { interviews } = useInterviewStore();
  const { jobs } = useJobStore();
  const { isEnabled } = useNotifications();

  const checkAndNotify = useCallback(async () => {
    if (!isEnabled) return;

    const now = new Date();

    for (const interview of interviews) {
      const interviewDate = interview.date?.toDate?.() || new Date(interview.date as any);

      // Combine date and time
      const [hours, minutes] = (interview.time || '12:00').split(':').map(Number);
      interviewDate.setHours(hours, minutes, 0, 0);

      const timeDiff = interviewDate.getTime() - now.getTime();
      const hoursUntil = timeDiff / (1000 * 60 * 60);

      const job = jobs.find((j) => j.id === interview.jobId);
      const companyName = job?.company || 'Company';
      const jobTitle = job?.title || 'Position';
      const interviewType = interview.type.charAt(0).toUpperCase() + interview.type.slice(1);

      // Check for 24-hour reminder (between 23-25 hours)
      if (!interview.reminderSent?.dayBefore && hoursUntil > 23 && hoursUntil <= 25) {
        await showNotification(
          `Interview Tomorrow at ${companyName}`,
          `Your ${interviewType} interview for ${jobTitle} is scheduled for tomorrow at ${interview.time}`,
          { tag: `interview-${interview.id}-day`, requireInteraction: true }
        );

        // Update reminder sent flag
        try {
          await updateDoc(doc(db, 'interviews', interview.id), {
            'reminderSent.dayBefore': true,
          });
        } catch (error) {
          console.error('Error updating reminder flag:', error);
        }
      }

      // Check for 1-hour reminder (between 0.5-1.5 hours)
      if (!interview.reminderSent?.hourBefore && hoursUntil > 0.5 && hoursUntil <= 1.5) {
        await showNotification(
          `Interview in 1 Hour - ${companyName}`,
          `Your ${interviewType} interview for ${jobTitle} starts at ${interview.time}. Good luck!`,
          { tag: `interview-${interview.id}-hour`, requireInteraction: true }
        );

        // Update reminder sent flag
        try {
          await updateDoc(doc(db, 'interviews', interview.id), {
            'reminderSent.hourBefore': true,
          });
        } catch (error) {
          console.error('Error updating reminder flag:', error);
        }
      }
    }
  }, [interviews, jobs, isEnabled]);

  // Check on mount and when interviews change
  useEffect(() => {
    checkAndNotify();

    // Also check periodically while app is open (every 5 minutes)
    const interval = setInterval(checkAndNotify, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkAndNotify]);
};

export default useInterviewReminders;
