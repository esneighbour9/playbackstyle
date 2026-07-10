export interface WindowState {
  isMaximized: boolean;
  isFullScreen: boolean;
}

export interface ElectronAPI {
  getMediaSessions: () => Promise<any[]>;
  mediaPlay: () => Promise<any>;
  mediaPause: () => Promise<any>;
  mediaToggle: () => Promise<any>;
  mediaNext: () => Promise<any>;
  mediaPrevious: () => Promise<any>;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  getWindowState: () => Promise<WindowState>;
  onWindowStateChanged: (callback: (state: WindowState) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
