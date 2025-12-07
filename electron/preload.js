"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Badge management
    setBadge: (count) => electron_1.ipcRenderer.invoke('set-badge', count),
    clearBadge: () => electron_1.ipcRenderer.invoke('clear-badge'),
    getBadge: () => electron_1.ipcRenderer.invoke('get-badge'),
    // Native notifications
    showNotification: (title, body, data) => electron_1.ipcRenderer.invoke('show-notification', title, body, data),
    // Google Auth (opens in system browser for passkey support)
    startGoogleAuth: () => electron_1.ipcRenderer.invoke('start-google-auth'),
    // Auth callback listener (receives custom token from custom protocol)
    onAuthCallback: (callback) => {
        electron_1.ipcRenderer.on('auth-callback', (_event, data) => callback(data));
    },
    // Navigation events (from main process)
    onNavigate: (callback) => {
        electron_1.ipcRenderer.on('navigate', (_event, url) => callback(url));
    },
    // Platform info
    platform: process.platform,
    isElectron: true,
});
//# sourceMappingURL=preload.js.map