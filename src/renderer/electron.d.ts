import type { MediaSession } from '../shared/types';

export interface ElectronAPI {
  getMediaSessions: () => Promise<MediaSession[]>;
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
