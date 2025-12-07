// Firebase Cloud Messaging Service Worker
// This handles background push notifications when the app is closed or in background

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Badge count for unread notifications
let badgeCount = 0;

// Initialize Firebase in the service worker
// These values must match your Firebase config
firebase.initializeApp({
  apiKey: 'AIzaSyAtJy1hbS-tuShmxwqK2HtZbG5gLVL7pQA',
  authDomain: 'orgniz-it.firebaseapp.com',
  projectId: 'orgniz-it',
  storageBucket: 'orgniz-it.firebasestorage.app',
  messagingSenderId: '93159189652',
  appId: '1:93159189652:web:f5e0b0e0dc28ef449b5881',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Interview Reminder';
  const notificationOptions = {
    body: payload.notification?.body || 'You have an upcoming interview!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: payload.data?.interviewId || 'interview-reminder',
    data: payload.data,
    requireInteraction: true, // Keep notification visible until user interacts
    actions: [
      {
        action: 'view',
        title: 'View Details',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  // Increment and set app badge
  badgeCount++;
  if ('setAppBadge' in navigator) {
    navigator.setAppBadge(badgeCount).catch((err) => {
      console.log('[firebase-messaging-sw.js] Error setting badge:', err);
    });
  }

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  // Decrement badge count
  badgeCount = Math.max(0, badgeCount - 1);
  if ('setAppBadge' in navigator) {
    if (badgeCount === 0) {
      navigator.clearAppBadge().catch((err) => {
        console.log('[firebase-messaging-sw.js] Error clearing badge:', err);
      });
    } else {
      navigator.setAppBadge(badgeCount).catch((err) => {
        console.log('[firebase-messaging-sw.js] Error setting badge:', err);
      });
    }
  }

  if (event.action === 'view' || !event.action) {
    // Open the app or focus if already open
    const urlToOpen = event.notification.data?.url || '/jobs';

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        // Check if there's already an open window
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// Listen for messages from the app to clear badge
self.addEventListener('message', (event) => {
  console.log('[firebase-messaging-sw.js] Received message:', event.data);

  if (event.data && event.data.type === 'CLEAR_BADGE') {
    badgeCount = 0;
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge().catch((err) => {
        console.log('[firebase-messaging-sw.js] Error clearing badge:', err);
      });
    }
  }
});
