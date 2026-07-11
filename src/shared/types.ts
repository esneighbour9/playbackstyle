/** Canonical media session shape — single source of truth for both main and renderer. */
export interface MediaSession {
  appName: string;
  appId: string;
  title: string;
  artist: string;
  playbackStatus: 'Playing' | 'Paused' | 'Stopped';
}
