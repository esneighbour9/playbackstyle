import { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

let mediaControl: {
  listSessions: () => Promise<any[]>;
  play: () => Promise<any>;
  pause: () => Promise<any>;
  next: () => Promise<any>;
  previous: () => Promise<any>;
  togglePlayPause: () => Promise<any>;
} | null = null;

try {
  mediaControl = require('win-media-control');
} catch {
  console.warn('win-media-control not available, running in development mode');
  mediaControl = null;
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 500,
    frame: false,
    transparent: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../build/icon.ico'),
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  }

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });
};

const createTray = () => {
  tray = new Tray(path.join(__dirname, '../build/icon.ico'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主界面',
      click: () => mainWindow?.show(),
    },
    {
      label: '播放/暂停',
      click: async () => {
        await mediaControl?.togglePlayPause();
      },
    },
    {
      label: '上一曲',
      click: async () => {
        await mediaControl?.previous();
      },
    },
    {
      label: '下一曲',
      click: async () => {
        await mediaControl?.next();
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip('Playbacker');
};

ipcMain.handle('get-media-sessions', async () => {
  try {
    return await mediaControl?.listSessions() || [];
  } catch {
    return [];
  }
});

ipcMain.handle('media-play', async () => {
  try {
    await mediaControl?.play();
    return { success: true };
  } catch {
    return { success: false };
  }
});

ipcMain.handle('media-pause', async () => {
  try {
    await mediaControl?.pause();
    return { success: true };
  } catch {
    return { success: false };
  }
});

ipcMain.handle('media-toggle', async () => {
  try {
    await mediaControl?.togglePlayPause();
    return { success: true };
  } catch {
    return { success: false };
  }
});

ipcMain.handle('media-next', async () => {
  try {
    await mediaControl?.next();
    return { success: true };
  } catch {
    return { success: false };
  }
});

ipcMain.handle('media-previous', async () => {
  try {
    await mediaControl?.previous();
    return { success: true };
  } catch {
    return { success: false };
  }
});

ipcMain.on('minimize', () => mainWindow?.minimize());
ipcMain.on('maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('close', () => mainWindow?.close());

app.whenReady().then(() => {
  createWindow();
  createTray();

  globalShortcut.register('MediaPlayPause', () => {
    mediaControl?.togglePlayPause();
  });

  globalShortcut.register('MediaNextTrack', () => {
    mediaControl?.next();
  });

  globalShortcut.register('MediaPreviousTrack', () => {
    mediaControl?.previous();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
