import { app, BrowserWindow, ipcMain, nativeImage, Notification, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { createTray, updateTrayMenu } from './tray';

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

// Development mode flag
const isDev = process.env.NODE_ENV !== 'production';

// App icon path - use PNG for all platforms (nativeImage reads PNG better than icns)
// Use app.getAppPath() for more reliable path resolution
const appPath = app.getAppPath();
const iconPath = path.join(appPath, 'public/icons/icon-512x512.png');

// Log icon path for debugging
console.log('[Electron] App path:', appPath);
console.log('[Electron] Icon path:', iconPath);
console.log('[Electron] Icon exists:', fs.existsSync(iconPath));

// Custom protocol for auth callback
const PROTOCOL = 'orgnizit';

// Register as default protocol handler
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

// Handle the protocol on macOS
app.on('open-url', (_event, url) => {
  handleProtocolUrl(url);
});

// Handle protocol URL
function handleProtocolUrl(url: string): void {
  console.log('[Electron] Protocol URL received:', url);

  // Parse the URL: orgnizit://auth/callback?customToken=xxx
  try {
    const urlObj = new URL(url);
    console.log('[Electron] Pathname:', urlObj.pathname);
    console.log('[Electron] Host:', urlObj.host);

    // The URL format is orgnizit://auth/callback?customToken=xxx
    // So pathname will be "//auth/callback" or host will be "auth"
    const isAuthCallback =
      urlObj.pathname.includes('auth/callback') ||
      urlObj.host === 'auth';

    if (isAuthCallback) {
      const customToken = urlObj.searchParams.get('customToken');
      console.log('[Electron] Custom token found:', customToken ? 'yes' : 'no');
      console.log('[Electron] MainWindow exists:', mainWindow ? 'yes' : 'no');

      if (customToken && mainWindow) {
        console.log('[Electron] Sending custom token to renderer...');
        mainWindow.webContents.send('auth-callback', { customToken });
        mainWindow.show();
        mainWindow.focus();
        console.log('[Electron] Custom token sent successfully');
      } else if (customToken && !mainWindow) {
        console.log('[Electron] MainWindow is null, creating window first...');
        // Store token and send after window is ready
        app.whenReady().then(() => {
          if (!mainWindow) createWindow();
          setTimeout(() => {
            if (mainWindow) {
              mainWindow.webContents.send('auth-callback', { customToken });
              mainWindow.show();
              mainWindow.focus();
            }
          }, 1000);
        });
      }
    }
  } catch (err) {
    console.error('[Electron] Error parsing protocol URL:', err);
  }
}

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Orgniz-it',
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    // macOS specific
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    backgroundColor: '#0A0A0B',
  });

  // Load the app
  const url = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../out/index.html')}`;
  mainWindow.loadURL(url);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Handle popups - including Firebase auth
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Allow Firebase auth handler and Google OAuth
    if (
      url.includes('accounts.google.com') ||
      url.includes('googleapis.com') ||
      url.includes('firebaseapp.com/__/auth') ||
      url.includes('orgniz-it.firebaseapp.com')
    ) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 500,
          height: 700,
          autoHideMenuBar: true,
          parent: mainWindow!,
          modal: false,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
          },
        },
      };
    }
    // Open other external links in default browser
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle window close - hide instead of quit (for tray)
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      updateTrayMenu(mainWindow);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('show', () => {
    updateTrayMenu(mainWindow);
  });

  mainWindow.on('hide', () => {
    updateTrayMenu(mainWindow);
  });

  // Create system tray
  createTray(mainWindow);
}

// Set dock badge (macOS)
function setDockBadge(count: number): void {
  if (process.platform === 'darwin' && app.dock) {
    if (count > 0) {
      app.dock.setBadge(count.toString());
    } else {
      app.dock.setBadge('');
    }
  }
}

// Clear dock badge
function clearDockBadge(): void {
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setBadge('');
  }
}

// Show native notification
function showNativeNotification(title: string, body: string, data?: any): void {
  const notification = new Notification({
    title,
    body,
    icon: path.join(__dirname, '../public/icons/icon-192x192.png'),
    silent: false,
  });

  notification.on('click', () => {
    // Show and focus the window when notification is clicked
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
      // Navigate to the relevant page if URL is provided
      if (data?.url) {
        mainWindow.webContents.send('navigate', data.url);
      }
    }
  });

  notification.show();
}

// IPC Handlers
ipcMain.handle('set-badge', (_event, count: number) => {
  setDockBadge(count);
  return true;
});

ipcMain.handle('clear-badge', () => {
  clearDockBadge();
  return true;
});

ipcMain.handle('show-notification', (_event, title: string, body: string, data?: any) => {
  showNativeNotification(title, body, data);
  // Also set badge when notification arrives
  const currentBadge = app.dock?.getBadge?.() || '0';
  const newCount = parseInt(currentBadge) + 1;
  setDockBadge(newCount);
  return true;
});

ipcMain.handle('get-badge', () => {
  if (process.platform === 'darwin' && app.dock) {
    const badge = app.dock.getBadge();
    return badge ? parseInt(badge) : 0;
  }
  return 0;
});

// Start Google auth in system browser
ipcMain.handle('start-google-auth', () => {
  // Open auth page in system browser where passkey works
  const authUrl = isDev
    ? 'http://localhost:3000/auth/electron'
    : 'https://orgniz-it.web.app/auth/electron'; // Use your production URL

  shell.openExternal(authUrl);
  return true;
});

// App lifecycle
app.whenReady().then(() => {
  // Set dock icon on macOS
  if (process.platform === 'darwin' && app.dock) {
    console.log('[Electron] Setting dock icon from:', iconPath);
    const dockIcon = nativeImage.createFromPath(iconPath);
    console.log('[Electron] Dock icon empty?', dockIcon.isEmpty());
    console.log('[Electron] Dock icon size:', dockIcon.getSize());
    if (!dockIcon.isEmpty()) {
      app.dock.setIcon(dockIcon);
      console.log('[Electron] Dock icon set successfully');
    } else {
      console.log('[Electron] WARNING: Dock icon is empty! File may not exist or be invalid');
    }
  }

  createWindow();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

// Prevent app from quitting when all windows are closed (keep in tray)
app.on('window-all-closed', () => {
  // Don't quit on macOS - keep in tray
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle before-quit to actually quit
app.on('before-quit', () => {
  app.isQuitting = true;
});

// Extend app type for isQuitting flag
declare global {
  namespace Electron {
    interface App {
      isQuitting?: boolean;
    }
  }
}
