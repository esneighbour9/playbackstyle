import { useEffect, useRef, useState } from 'react';
import { TitleBar } from './components/TitleBar';
import { AlbumArt } from './components/AlbumArt';
import { TrackInfo } from './components/TrackInfo';
import { PlaybackControls } from './components/PlaybackControls';
import { LyricsDisplay } from './components/LyricsDisplay';
import { IdleState } from './components/IdleState';
import { useMediaSession } from './hooks/useMediaSession';
import { useLyrics } from './hooks/useLyrics';

function App() {
  const {
    isPlaying,
    currentTrack,
    currentArtist,
    currentApp,
    isIdle,
    toggle,
    next,
    previous,
  } = useMediaSession();

  const { lyrics, currentLineIndex, searchLyrics, updateCurrentLine } = useLyrics();
  const prevTrackRef = useRef('');
  const prevArtistRef = useRef('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    window.electronAPI.getWindowState().then((state) => {
      setIsExpanded(state.isMaximized || state.isFullScreen);
    });

    const cleanup = window.electronAPI.onWindowStateChanged((state) => {
      setIsExpanded(state.isMaximized || state.isFullScreen);
    });
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (currentTrack !== prevTrackRef.current || currentArtist !== prevArtistRef.current) {
      prevTrackRef.current = currentTrack;
      prevArtistRef.current = currentArtist;
      searchLyrics(currentTrack, currentArtist);
    }
  }, [currentTrack, currentArtist, searchLyrics]);

  useEffect(() => {
    if (isPlaying) {
      let startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        updateCurrentLine(elapsed);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, updateCurrentLine]);

  return (
    <div className="app-container">
      <div className="app-glass">
        <div className="app-content">
          <TitleBar />
          
          {isIdle ? (
            <IdleState />
          ) : (
            <div className={'player-content' + (isExpanded ? ' expanded' : '')}>
              <div className="player-main">
                <AlbumArt title={currentTrack} artist={currentArtist} isPlaying={isPlaying} />
                <TrackInfo title={currentTrack} artist={currentArtist} appName={currentApp} />
              </div>
              
              <PlaybackControls
                isPlaying={isPlaying}
                onPlay={() => {}}
                onPause={() => {}}
                onToggle={toggle}
                onNext={next}
                onPrevious={previous}
                disabled={isIdle}
              />
              
              <LyricsDisplay
                lyrics={lyrics}
                currentLineIndex={currentLineIndex}
                isPlaying={isPlaying}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="app-background" />
    </div>
  );
}

export default App;
