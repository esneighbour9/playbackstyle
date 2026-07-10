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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
