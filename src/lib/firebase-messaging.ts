import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import app, { db } from './firebase';

// VAPID key for web push - you need to generate this in Firebase Console
// Go to Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * Check if the browser supports notifications
 * Safari 16+ supports FCM web push notifications
 */
export const isNotificationSupported = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  if (!('serviceWorker' in navigator)) return false;

  try {
    return await isSupported();
  } catch {
    return false;
  }
};

/**
 * Get the current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    console.log('[FCM] Starting notification permission request...');
    console.log('[FCM] VAPID_KEY present:', !!VAPID_KEY);

    const supported = await isNotificationSupported();
    console.log('[FCM] Notifications supported:', supported);

    if (!supported) {
      console.warn('[FCM] Notifications not supported in this browser');
      return null;
    }

    console.log('[FCM] Requesting permission...');
    const permission = await Notification.requestPermission();
    console.log('[FCM] Permission result:', permission);

    if (permission !== 'granted') {
      console.warn('[FCM] Notification permission denied');
      return null;
    }

    // Register service worker
    console.log('[FCM] Registering service worker...');
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('[FCM] Service Worker registered:', registration);

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('[FCM] Service Worker ready');

    // Get messaging instance
    console.log('[FCM] Getting messaging instance...');
    const messaging = getMessaging(app);
    console.log('[FCM] Messaging instance obtained');

    // Get FCM token
    console.log('[FCM] Requesting FCM token with VAPID key...');
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('[FCM] Token obtained successfully:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.warn('[FCM] No FCM token received - token was empty');
      return null;
    }
  } catch (error: any) {
    console.error('[FCM] Error getting notification permission:', error);
    console.error('[FCM] Error name:', error?.name);
    console.error('[FCM] Error message:', error?.message);
    console.error('[FCM] Error code:', error?.code);
    throw error; // Re-throw to show error in UI
  }
};

/**
 * Save FCM token to Firestore for the user
 */
export const saveFcmToken = async (userId: string, token: string): Promise<void> => {
  try {
    const tokenRef = doc(collection(db, 'users', userId, 'fcmTokens'));
    await setDoc(tokenRef, {
      token,
      device: getDeviceInfo(),
      createdAt: serverTimestamp(),
      lastUsed: serverTimestamp(),
    });
    console.log('FCM token saved to Firestore');
  } catch (error) {
    console.error('Error saving FCM token:', error);
    throw error;
  }
};

/**
 * Get device info for token identification
 */
const getDeviceInfo = (): string => {
  if (typeof window === 'undefined') return 'unknown';

  const ua = navigator.userAgent;
  let device = 'Unknown Device';

  if (ua.includes('iPhone')) device = 'iPhone';
  else if (ua.includes('iPad')) device = 'iPad';
  else if (ua.includes('Android')) device = 'Android';
  else if (ua.includes('Mac')) device = 'Mac';
  else if (ua.includes('Windows')) device = 'Windows';
  else if (ua.includes('Linux')) device = 'Linux';

  // Add browser
  if (ua.includes('Chrome')) device += ' Chrome';
  else if (ua.includes('Firefox')) device += ' Firefox';
  else if (ua.includes('Safari')) device += ' Safari';
  else if (ua.includes('Edge')) device += ' Edge';

  return device;
};

/**
 * Listen for foreground messages
 */
export const onForegroundMessage = (callback: (payload: any) => void): (() => void) | null => {
  if (typeof window === 'undefined') return null;

  // Skip FCM in Electron - Electron uses native notifications via IPC
  const isElectron = typeof window !== 'undefined' && (window as any).electronAPI?.isElectron;
  if (isElectron) {
    console.log('[FCM] Skipping foreground message listener in Electron');
    return null;
  }

  try {
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      callback(payload);
    });
  } catch (error) {
    console.error('Error setting up foreground message listener:', error);
    return null;
  }
};

/**
 * Show a local notification (useful for foreground messages)
 * Skipped in Electron - use window.electronAPI.showNotification instead
 */
export const showLocalNotification = (title: string, options?: NotificationOptions): void => {
  if (typeof window === 'undefined') return;

  // Skip browser notifications in Electron - use native notifications instead
  const isElectron = (window as any).electronAPI?.isElectron;
  if (isElectron) {
    console.log('[FCM] Skipping browser notification in Electron, use native instead');
    return;
  }

  if (Notification.permission !== 'granted') return;

  const notification = new Notification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    ...options,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
};

/**
 * Send a test notification via Cloud Function
 */
export const sendTestNotification = async (title?: string, body?: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // First show a local notification immediately so user sees something
    showLocalNotification(
      title || 'Test Notification',
      { body: body || 'Push notifications are working! 🎉' }
    );

    // Also send via Cloud Function for background notifications
    const functions = getFunctions(app);
    const sendTest = httpsCallable(functions, 'sendTestNotification');
    const result = await sendTest({
      title: title || 'Test Notification',
      body: body || 'Push notifications are working! 🎉'
    });
    console.log('[FCM] Test notification result:', result);
    return { success: true };
  } catch (error: any) {
    console.error('[FCM] Test notification error:', error);
    // Even if cloud function fails, local notification should have shown
    return { success: false, error: error.message };
  }
};

/**
 * Send a local-only test notification (no cloud function)
 */
export const sendLocalTestNotification = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (Notification.permission !== 'granted') {
    console.warn('[FCM] Notification permission not granted');
    return false;
  }

  try {
    const notification = new Notification('Test from Orgniz-it', {
      body: 'If you see this, notifications are working!',
      icon: '/icons/icon-192x192.png',
      tag: 'test-notification',
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    console.log('[FCM] Local notification created successfully');
    return true;
  } catch (error) {
    console.error('[FCM] Error creating local notification:', error);
    return false;
  }
};
