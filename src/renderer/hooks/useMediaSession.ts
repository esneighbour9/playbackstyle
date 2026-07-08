import { useState, useEffect, useCallback } from 'react';

export interface MediaSession {
  appName: string;
  appId: string;
  title: string;
  artist: string;
  playbackStatus: 'Playing' | 'Paused' | 'Stopped';
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTrack: string;
  currentArtist: string;
  currentApp: string;
  isIdle: boolean;
  sessions: MediaSession[];
  lastError: string | null;
}

const DEFAULT_STATE: PlaybackState = {
  isPlaying: false,
  currentTrack: '',
  currentArtist: '',
  currentApp: '',
  isIdle: true,
  sessions: [],
  lastError: null,
};

export const useMediaSession = () => {
  const [state, setState] = useState<PlaybackState>(DEFAULT_STATE);

  const fetchSessions = useCallback(async () => {
    try {
      const sessions = await window.electronAPI.getMediaSessions();
      const validSessions = sessions.filter(
        (s: MediaSession) => Boolean(s.title)
      );
      
      const appleMusicSession = validSessions.find(
        (s: MediaSession) => 
          (s.appName || '').toLowerCase().includes('apple') || 
          (s.appName || '').toLowerCase().includes('music') ||
          (s.appId || '').toLowerCase().includes('apple') ||
          (s.appId || '').toLowerCase().includes('music')
      );
      
      const activeSession = appleMusicSession || validSessions[0];
      
      setState((prev) => ({
        ...prev,
        lastError: null,
        sessions: validSessions,
        isIdle: validSessions.length === 0,
        isPlaying: activeSession?.playbackStatus === 'Playing' || false,
        currentTrack: activeSession?.title || '',
        currentArtist: activeSession?.artist || '',
        currentApp: activeSession?.appName || activeSession?.appId || '',
      }));
    } catch (error) {
      console.error('Failed to fetch media sessions:', error);
      setState((prev) => ({
        ...prev,
        isIdle: true,
        lastError: '读取媒体会话失败',
      }));
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 2000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const play = useCallback(async () => {
    await window.electronAPI.mediaPlay();
    fetchSessions();
  }, [fetchSessions]);

  const pause = useCallback(async () => {
    await window.electronAPI.mediaPause();
    fetchSessions();
  }, [fetchSessions]);

  const toggle = useCallback(async () => {
    await window.electronAPI.mediaToggle();
    fetchSessions();
  }, [fetchSessions]);

  const next = useCallback(async () => {
    await window.electronAPI.mediaNext();
    fetchSessions();
  }, [fetchSessions]);

  const previous = useCallback(async () => {
    await window.electronAPI.mediaPrevious();
    fetchSessions();
  }, [fetchSessions]);

  return {
    ...state,
    play,
    pause,
    toggle,
    next,
    previous,
    refresh: fetchSessions,
  };
};
