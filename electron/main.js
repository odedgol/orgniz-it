"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const tray_1 = require("./tray");
// Keep a global reference of the window object
let mainWindow = null;
// Development mode flag
const isDev = process.env.NODE_ENV !== 'production';
// App icon path - use PNG for all platforms (nativeImage reads PNG better than icns)
// Use app.getAppPath() for more reliable path resolution
const appPath = electron_1.app.getAppPath();
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
        electron_1.app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
    }
}
else {
    electron_1.app.setAsDefaultProtocolClient(PROTOCOL);
}
// Handle the protocol on macOS
electron_1.app.on('open-url', (_event, url) => {
    handleProtocolUrl(url);
});
// Handle protocol URL
function handleProtocolUrl(url) {
    console.log('[Electron] Protocol URL received:', url);
    // Parse the URL: orgnizit://auth/callback?customToken=xxx
    try {
        const urlObj = new URL(url);
        console.log('[Electron] Pathname:', urlObj.pathname);
        console.log('[Electron] Host:', urlObj.host);
        // The URL format is orgnizit://auth/callback?customToken=xxx
        // So pathname will be "//auth/callback" or host will be "auth"
        const isAuthCallback = urlObj.pathname.includes('auth/callback') ||
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
            }
            else if (customToken && !mainWindow) {
                console.log('[Electron] MainWindow is null, creating window first...');
                // Store token and send after window is ready
                electron_1.app.whenReady().then(() => {
                    if (!mainWindow)
                        createWindow();
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
    }
    catch (err) {
        console.error('[Electron] Error parsing protocol URL:', err);
    }
}
function createWindow() {
    // Create the browser window
    mainWindow = new electron_1.BrowserWindow({
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
        if (url.includes('accounts.google.com') ||
            url.includes('googleapis.com') ||
            url.includes('firebaseapp.com/__/auth') ||
            url.includes('orgniz-it.firebaseapp.com')) {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    width: 500,
                    height: 700,
                    autoHideMenuBar: true,
                    parent: mainWindow,
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
        electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });
    // Handle window close - hide instead of quit (for tray)
    mainWindow.on('close', (event) => {
        if (!electron_1.app.isQuitting) {
            event.preventDefault();
            mainWindow?.hide();
            (0, tray_1.updateTrayMenu)(mainWindow);
        }
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    mainWindow.on('show', () => {
        (0, tray_1.updateTrayMenu)(mainWindow);
    });
    mainWindow.on('hide', () => {
        (0, tray_1.updateTrayMenu)(mainWindow);
    });
    // Create system tray
    (0, tray_1.createTray)(mainWindow);
}
// Set dock badge (macOS)
function setDockBadge(count) {
    if (process.platform === 'darwin' && electron_1.app.dock) {
        if (count > 0) {
            electron_1.app.dock.setBadge(count.toString());
        }
        else {
            electron_1.app.dock.setBadge('');
        }
    }
}
// Clear dock badge
function clearDockBadge() {
    if (process.platform === 'darwin' && electron_1.app.dock) {
        electron_1.app.dock.setBadge('');
    }
}
// Show native notification
function showNativeNotification(title, body, data) {
    const notification = new electron_1.Notification({
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
electron_1.ipcMain.handle('set-badge', (_event, count) => {
    setDockBadge(count);
    return true;
});
electron_1.ipcMain.handle('clear-badge', () => {
    clearDockBadge();
    return true;
});
electron_1.ipcMain.handle('show-notification', (_event, title, body, data) => {
    showNativeNotification(title, body, data);
    // Also set badge when notification arrives
    const currentBadge = electron_1.app.dock?.getBadge?.() || '0';
    const newCount = parseInt(currentBadge) + 1;
    setDockBadge(newCount);
    return true;
});
electron_1.ipcMain.handle('get-badge', () => {
    if (process.platform === 'darwin' && electron_1.app.dock) {
        const badge = electron_1.app.dock.getBadge();
        return badge ? parseInt(badge) : 0;
    }
    return 0;
});
// Start Google auth in system browser
electron_1.ipcMain.handle('start-google-auth', () => {
    // Open auth page in system browser where passkey works
    const authUrl = isDev
        ? 'http://localhost:3000/auth/electron'
        : 'https://orgniz-it.web.app/auth/electron'; // Use your production URL
    electron_1.shell.openExternal(authUrl);
    return true;
});
// App lifecycle
electron_1.app.whenReady().then(() => {
    // Set dock icon on macOS
    if (process.platform === 'darwin' && electron_1.app.dock) {
        console.log('[Electron] Setting dock icon from:', iconPath);
        const dockIcon = electron_1.nativeImage.createFromPath(iconPath);
        console.log('[Electron] Dock icon empty?', dockIcon.isEmpty());
        console.log('[Electron] Dock icon size:', dockIcon.getSize());
        if (!dockIcon.isEmpty()) {
            electron_1.app.dock.setIcon(dockIcon);
            console.log('[Electron] Dock icon set successfully');
        }
        else {
            console.log('[Electron] WARNING: Dock icon is empty! File may not exist or be invalid');
        }
    }
    createWindow();
    electron_1.app.on('activate', () => {
        // On macOS, re-create window when dock icon is clicked
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
        else if (mainWindow) {
            mainWindow.show();
        }
    });
});
// Prevent app from quitting when all windows are closed (keep in tray)
electron_1.app.on('window-all-closed', () => {
    // Don't quit on macOS - keep in tray
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// Handle before-quit to actually quit
electron_1.app.on('before-quit', () => {
    electron_1.app.isQuitting = true;
});
//# sourceMappingURL=main.js.map