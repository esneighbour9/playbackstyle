"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
let mainWindow = null;
let tray = null;
let isQuitting = false;
// let mediaControl: {
//   listSessions: () => Promise<any[]>;
//   play: () => Promise<any>;
//   pause: () => Promise<any>;
//   next: () => Promise<any>;
//   previous: () => Promise<any>;
//   togglePlayPause: () => Promise<any>;
// } | null = null;
// // try {
// //   mediaControl = require('win-media-control');
// // } catch {
// //   console.warn('win-media-control not available, running in development mode');
// //   mediaControl = null;
// // }
// try {
//   mediaControl = require('win-media-control');
//   console.log('win-media-control loaded successfully');
// } catch (e: any) {
//   console.warn('win-media-control load failed:', e.message);
//   mediaControl = null;
// }
// let mediaControl: {
//   listSessions: () => Promise<any[]>;
//   play: () => Promise<any>;
//   pause: () => Promise<any>;
//   next: () => Promise<any>;
//   previous: () => Promise<any>;
//   togglePlayPause: () => Promise<any>;
// } | null = null;
// (async () => {
//   try {
//     const mod = await import('win-media-control');
//     mediaControl = mod.default || mod;
//     console.log('win-media-control loaded successfully');
//   } catch (e: any) {
//     console.warn('win-media-control load failed:', e.message);
//     mediaControl = null;
//   }
// })();
let mediaControl = null;
// (async () => {
//   try {
//     const dynamicImport = new Function('specifier', 'return import(specifier)');
//     const mod = await dynamicImport('win-media-control');
//     mediaControl = mod.default || mod;
//     console.log('win-media-control loaded successfully');
//   } catch (e: any) {
//     console.warn('win-media-control load failed:', e.message);
//     mediaControl = null;
//   }
// })();
(async () => {
    try {
        const dynamicImport = new Function('specifier', 'return import(specifier)');
        const mod = await dynamicImport('win-media-control');
        mediaControl = mod.default || mod;
        console.log('win-media-control loaded successfully');
    }
    catch (e) {
        console.warn('win-media-control load failed:', e.message);
        mediaControl = null;
    }
})();
const createWindow = () => {
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 600,
        minHeight: 500,
        frame: false,
        transparent: true,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        icon: path_1.default.join(__dirname, '../build/icon.ico'),
    });
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, 'renderer', 'index.html'));
    }
    mainWindow.on('close', (e) => {
        if (!isQuitting) {
            e.preventDefault();
            mainWindow?.hide();
        }
    });
};
const createTray = () => {
    tray = new electron_1.Tray(path_1.default.join(__dirname, '../build/icon.ico'));
    const contextMenu = electron_1.Menu.buildFromTemplate([
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
                electron_1.app.quit();
            },
        },
    ]);
    tray.setContextMenu(contextMenu);
    tray.setToolTip('Playbacker');
};
electron_1.ipcMain.handle('get-media-sessions', async () => {
    try {
        return await mediaControl?.listSessions() || [];
    }
    catch {
        return [];
    }
});
electron_1.ipcMain.handle('media-play', async () => {
    try {
        await mediaControl?.play();
        return { success: true };
    }
    catch {
        return { success: false };
    }
});
electron_1.ipcMain.handle('media-pause', async () => {
    try {
        await mediaControl?.pause();
        return { success: true };
    }
    catch {
        return { success: false };
    }
});
electron_1.ipcMain.handle('media-toggle', async () => {
    try {
        await mediaControl?.togglePlayPause();
        return { success: true };
    }
    catch {
        return { success: false };
    }
});
electron_1.ipcMain.handle('media-next', async () => {
    try {
        await mediaControl?.next();
        return { success: true };
    }
    catch {
        return { success: false };
    }
});
electron_1.ipcMain.handle('media-previous', async () => {
    try {
        await mediaControl?.previous();
        return { success: true };
    }
    catch {
        return { success: false };
    }
});
electron_1.ipcMain.on('minimize', () => mainWindow?.minimize());
electron_1.ipcMain.on('maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    }
    else {
        mainWindow?.maximize();
    }
});
electron_1.ipcMain.on('close', () => mainWindow?.close());
electron_1.app.whenReady().then(() => {
    createWindow();
    createTray();
    electron_1.globalShortcut.register('MediaPlayPause', () => {
        mediaControl?.togglePlayPause();
    });
    electron_1.globalShortcut.register('MediaNextTrack', () => {
        mediaControl?.next();
    });
    electron_1.globalShortcut.register('MediaPreviousTrack', () => {
        mediaControl?.previous();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
