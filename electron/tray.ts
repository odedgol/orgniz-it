import { app, Tray, Menu, nativeImage, BrowserWindow } from 'electron';
import * as path from 'path';

let tray: Tray | null = null;

export function createTray(mainWindow: BrowserWindow | null): void {
  // Create tray icon
  const iconPath = path.join(__dirname, '../public/icons/icon-72x72.png');

  // For macOS, we need a template image (16x16 or 22x22)
  // We'll use the existing icon and resize it
  let trayIcon = nativeImage.createFromPath(iconPath);

  // Resize for tray (macOS expects small icons)
  trayIcon = trayIcon.resize({ width: 18, height: 18 });

  // Mark as template for macOS (auto dark/light mode)
  if (process.platform === 'darwin') {
    trayIcon.setTemplateImage(true);
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('Orgniz-it');

  // Build context menu
  const contextMenu = buildContextMenu(mainWindow);
  tray.setContextMenu(contextMenu);

  // Click handler - show/hide window
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
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

function buildContextMenu(mainWindow: BrowserWindow | null): Menu {
  const isVisible = mainWindow?.isVisible() ?? false;

  return Menu.buildFromTemplate([
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
          } else {
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
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);
}

export function updateTrayMenu(mainWindow: BrowserWindow | null): void {
  if (tray) {
    const contextMenu = buildContextMenu(mainWindow);
    tray.setContextMenu(contextMenu);
  }
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
