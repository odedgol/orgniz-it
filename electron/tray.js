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
exports.createTray = createTray;
exports.updateTrayMenu = updateTrayMenu;
exports.destroyTray = destroyTray;
const electron_1 = require("electron");
const path = __importStar(require("path"));
let tray = null;
function createTray(mainWindow) {
    // Create tray icon
    const iconPath = path.join(__dirname, '../public/icons/icon-72x72.png');
    // For macOS, we need a template image (16x16 or 22x22)
    // We'll use the existing icon and resize it
    let trayIcon = electron_1.nativeImage.createFromPath(iconPath);
    // Resize for tray (macOS expects small icons)
    trayIcon = trayIcon.resize({ width: 18, height: 18 });
    // Mark as template for macOS (auto dark/light mode)
    if (process.platform === 'darwin') {
        trayIcon.setTemplateImage(true);
    }
    tray = new electron_1.Tray(trayIcon);
    tray.setToolTip('Orgniz-it');
    // Build context menu
    const contextMenu = buildContextMenu(mainWindow);
    tray.setContextMenu(contextMenu);
    // Click handler - show/hide window
    tray.on('click', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            }
            else {
                mainWindow.show();
                mainWindow.focus();
            }
        }
    });
    // Double-click handler (Windows)
    tray.on('double-click', () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        }
    });
}
function buildContextMenu(mainWindow) {
    const isVisible = mainWindow?.isVisible() ?? false;
    return electron_1.Menu.buildFromTemplate([
        {
            label: 'Orgniz-it',
            enabled: false,
        },
        { type: 'separator' },
        {
            label: isVisible ? 'Hide Window' : 'Show Window',
            click: () => {
                if (mainWindow) {
                    if (isVisible) {
                        mainWindow.hide();
                    }
                    else {
                        mainWindow.show();
                        mainWindow.focus();
                    }
                }
            },
        },
        { type: 'separator' },
        {
            label: 'Jobs',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                    mainWindow.webContents.send('navigate', '/jobs');
                }
            },
        },
        {
            label: 'Dashboard',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                    mainWindow.webContents.send('navigate', '/');
                }
            },
        },
        {
            label: 'Settings',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                    mainWindow.webContents.send('navigate', '/settings');
                }
            },
        },
        { type: 'separator' },
        {
            label: 'Quit Orgniz-it',
            click: () => {
                electron_1.app.isQuitting = true;
                electron_1.app.quit();
            },
        },
    ]);
}
function updateTrayMenu(mainWindow) {
    if (tray) {
        const contextMenu = buildContextMenu(mainWindow);
        tray.setContextMenu(contextMenu);
    }
}
function destroyTray() {
    if (tray) {
        tray.destroy();
        tray = null;
    }
}
//# sourceMappingURL=tray.js.map