import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getMediaSessions: () => ipcRenderer.invoke('get-media-sessions'),
  mediaPlay: () => ipcRenderer.invoke('media-play'),
  mediaPause: () => ipcRenderer.invoke('media-pause'),
  mediaToggle: () => ipcRenderer.invoke('media-toggle'),
  mediaNext: () => ipcRenderer.invoke('media-next'),
  mediaPrevious: () => ipcRenderer.invoke('media-previous'),
  minimize: () => ipcRenderer.send('minimize'),
  maximize: () => ipcRenderer.send('maximize'),
  close: () => ipcRenderer.send('close'),

  getWindowState: () => ipcRenderer.invoke('get-window-state'),

  onWindowStateChanged: (callback: (state: { isMaximized: boolean; isFullScreen: boolean }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: { isMaximized: boolean; isFullScreen: boolean }) => {
      callback(state);
    };
    ipcRenderer.on('window-state-changed', handler);
    return () => {
      ipcRenderer.removeListener('window-state-changed', handler);
    };
  },
});

export type MediaSession = {
  appName: string;
  appId: string;
  title: string;
  artist: string;
  playbackStatus: 'Playing' | 'Paused' | 'Stopped';
};
