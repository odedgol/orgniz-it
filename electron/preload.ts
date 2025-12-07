import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Badge management
  setBadge: (count: number) => ipcRenderer.invoke('set-badge', count),
  clearBadge: () => ipcRenderer.invoke('clear-badge'),
  getBadge: () => ipcRenderer.invoke('get-badge'),

  // Native notifications
  showNotification: (title: string, body: string, data?: any) =>
    ipcRenderer.invoke('show-notification', title, body, data),

  // Google Auth (opens in system browser for passkey support)
  startGoogleAuth: () => ipcRenderer.invoke('start-google-auth'),

  // Auth callback listener (receives custom token from custom protocol)
  onAuthCallback: (callback: (data: { customToken: string }) => void) => {
    ipcRenderer.on('auth-callback', (_event, data) => callback(data));
  },

  // Navigation events (from main process)
  onNavigate: (callback: (url: string) => void) => {
    ipcRenderer.on('navigate', (_event, url) => callback(url));
  },

  // Platform info
  platform: process.platform,
  isElectron: true,
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI?: {
      setBadge: (count: number) => Promise<boolean>;
      clearBadge: () => Promise<boolean>;
      getBadge: () => Promise<number>;
      showNotification: (title: string, body: string, data?: any) => Promise<boolean>;
      startGoogleAuth: () => Promise<boolean>;
      onAuthCallback: (callback: (data: { customToken: string }) => void) => void;
      onNavigate: (callback: (url: string) => void) => void;
      platform: string;
      isElectron: boolean;
    };
  }
}
