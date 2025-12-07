'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  saveFcmToken,
  onForegroundMessage,
  showLocalNotification,
  sendTestNotification as sendTestNotificationFn,
} from '@/lib/firebase-messaging';
import { useAuthStore } from '@/stores/authStore';

export type NotificationStatus =
  | 'loading'
  | 'unsupported'
  | 'denied'
  | 'default'
  | 'granted'
  | 'error';

interface UseNotificationsReturn {
  status: NotificationStatus;
  isSupported: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  sendTestNotification: () => Promise<{ success: boolean; error?: string }>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<NotificationStatus>('loading');
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check notification support and permission on mount
  useEffect(() => {
    const checkSupport = async () => {
      const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

      // In Electron, use native notifications (no FCM)
      if (isElectron) {
        console.log('[useNotifications] Running in Electron, using native notifications');
        setIsSupported(true);
        setStatus('granted'); // Electron always has notification permission
        return;
      }

      const supported = await isNotificationSupported();
      setIsSupported(supported);

      if (!supported) {
        setStatus('unsupported');
        return;
      }

      const permission = getNotificationPermission();
      if (permission === 'unsupported') {
        setStatus('unsupported');
      } else {
        setStatus(permission);

        // If already granted and user is logged in, ensure token is saved
        // Skip FCM token registration in Electron (no push service available)
        if (permission === 'granted' && user) {
          console.log('[useNotifications] Permission already granted, ensuring token is saved...');
          try {
            const token = await requestNotificationPermission();
            if (token) {
              await saveFcmToken(user.id, token);
              console.log('[useNotifications] Token saved successfully');
            }
          } catch (err) {
            console.error('[useNotifications] Error saving existing token:', err);
          }
        }
      }
    };

    checkSupport();
  }, [user]);

  // Set up foreground message listener
  useEffect(() => {
    if (status !== 'granted') return;

    const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

    const unsubscribe = onForegroundMessage(async (payload) => {
      // Show notification when app is in foreground
      const title = payload.notification?.title || 'Interview Reminder';
      const body = payload.notification?.body || 'You have an upcoming interview!';

      // Use Electron native notifications if available
      if (isElectron && window.electronAPI) {
        await window.electronAPI.showNotification(title, body, payload.data);
        // Badge is automatically incremented by Electron main process
      } else {
        showLocalNotification(title, {
          body,
          tag: payload.data?.interviewId || 'interview-reminder',
          data: payload.data,
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [status]);

  // Clear app badge when app becomes visible
  useEffect(() => {
    const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

    const clearBadge = async () => {
      // Use Electron native badge if available
      if (isElectron && window.electronAPI) {
        try {
          await window.electronAPI.clearBadge();
          console.log('[useNotifications] Cleared Electron badge');
        } catch (err) {
          console.log('[useNotifications] Error clearing Electron badge:', err);
        }
        return;
      }

      // Fallback to Badging API for PWA
      if ('clearAppBadge' in navigator) {
        try {
          await (navigator as any).clearAppBadge();
        } catch (err) {
          console.log('[useNotifications] Error clearing badge:', err);
        }
      }

      // Also notify service worker to reset its counter
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_BADGE' });
      }
    };

    // Clear badge on mount (when app opens)
    clearBadge();

    // Clear badge when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        clearBadge();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

    // In Electron, notifications are always available (no permission needed)
    if (isElectron) {
      console.log('[useNotifications] Electron: notifications always available');
      setStatus('granted');
      return true;
    }

    if (!isSupported) {
      setError('Notifications are not supported in this browser');
      return false;
    }

    if (!user) {
      setError('You must be logged in to enable notifications');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await requestNotificationPermission();

      if (!token) {
        setStatus('denied');
        setError('Permission denied or failed to get token');
        return false;
      }

      // Save token to Firestore
      await saveFcmToken(user.id, token);

      setStatus('granted');
      return true;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to enable notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user]);

  const sendTestNotification = useCallback(async () => {
    return sendTestNotificationFn();
  }, []);

  return {
    status,
    isSupported,
    isEnabled: status === 'granted',
    isLoading,
    error,
    requestPermission,
    sendTestNotification,
  };
};

export default useNotifications;
