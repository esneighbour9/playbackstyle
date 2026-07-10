import { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
const gotTheLock = app.requestSingleInstanceLock();

type MediaControl = {
  listSessions: () => Promise<any[]>;
  play: () => Promise<any>;
  pause: () => Promise<any>;
  next: () => Promise<any>;
  previous: () => Promise<any>;
  togglePlayPause: () => Promise<any>;
};

let mediaControl: MediaControl | null = null;

const getErrorMessage = (error: unknown) => (
  error instanceof Error ? error.message : String(error)
);

const getMediaControl = () => {
  if (!mediaControl) {
    throw new Error('win-media-control is not available');
  }
  return mediaControl;
};

const loadMediaControl = async () => {
  try {
    const dynamicImport = new Function('specifier', 'return import(specifier)') as (
      specifier: string
    ) => Promise<{ default?: MediaControl } & Partial<MediaControl>>;
    const mod = await dynamicImport('win-media-control');
    mediaControl = mod.default || (mod as MediaControl);
    console.log('win-media-control loaded successfully');
  } catch (error) {
    mediaControl = null;
    console.error('win-media-control load failed:', getErrorMessage(error));
  }
};

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
  if (tray) {
    return;
  }

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
    return await getMediaControl().listSessions();
  } catch (error) {
    console.error('get-media-sessions failed:', getErrorMessage(error));
    throw error;
  }
});

ipcMain.handle('media-play', async () => {
  try {
    await getMediaControl().play();
    return { success: true };
  } catch (error) {
    console.error('media-play failed:', getErrorMessage(error));
    throw error;
  }
});

ipcMain.handle('media-pause', async () => {
  try {
    await getMediaControl().pause();
    return { success: true };
  } catch (error) {
    console.error('media-pause failed:', getErrorMessage(error));
    throw error;
  }
});

ipcMain.handle('media-toggle', async () => {
  try {
    await getMediaControl().togglePlayPause();
    return { success: true };
  } catch (error) {
    console.error('media-toggle failed:', getErrorMessage(error));
    throw error;
  }
});

ipcMain.handle('media-next', async () => {
  try {
    await getMediaControl().next();
    return { success: true };
  } catch (error) {
    console.error('media-next failed:', getErrorMessage(error));
    throw error;
  }
});

ipcMain.handle('media-previous', async () => {
  try {
    await getMediaControl().previous();
    return { success: true };
  } catch (error) {
    console.error('media-previous failed:', getErrorMessage(error));
    throw error;
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

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
      return;
    }
    createWindow();
  });

  app.whenReady().then(async () => {
    await loadMediaControl();
    createWindow();
    createTray();

    globalShortcut.register('MediaPlayPause', () => {
      void mediaControl?.togglePlayPause();
    });

    globalShortcut.register('MediaNextTrack', () => {
      void mediaControl?.next();
    });

    globalShortcut.register('MediaPreviousTrack', () => {
      void mediaControl?.previous();
    });
  });

  app.on('before-quit', () => {
    isQuitting = true;
    globalShortcut.unregisterAll();
    tray?.destroy();
    tray = null;
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
}
