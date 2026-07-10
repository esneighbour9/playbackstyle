import { useEffect, useRef } from 'react';
import { TitleBar } from './components/TitleBar';
import { AlbumArt } from './components/AlbumArt';
import { TrackInfo } from './components/TrackInfo';
import { PlaybackControls } from './components/PlaybackControls';
import { LyricsDisplay } from './components/LyricsDisplay';
import { IdleState } from './components/IdleState';
import { useMediaSession } from './hooks/useMediaSession';
import { useLyrics } from './hooks/useLyrics';
import { computeHue } from './utils/hashColor';

function App() {
  const {
    isPlaying,
    currentTrack,
    currentArtist,
    currentApp,
    isIdle,
    playbackStatus,
    toggle,
    next,
    previous,
  } = useMediaSession();

  const { lyrics, currentLineIndex, searchLyrics, updateCurrentLine } = useLyrics();
  const prevTrackRef = useRef('');
  const prevArtistRef = useRef('');
  const accentHue = computeHue(currentTrack, currentArtist);

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
    <div
      className="app-container"
      style={{
        '--accent-hue': accentHue,
        '--accent-hue-2': (accentHue + 60) % 360,
        '--accent-hue-3': (accentHue + 180) % 360,
      } as React.CSSProperties}
    >
      <div className="app-glass">
        <div className="app-content">
          <TitleBar playbackStatus={playbackStatus} />
          
          {isIdle ? (
            <IdleState />
          ) : (
            <div className="player-content">
              <div className="player-main">
                <AlbumArt isPlaying={isPlaying} accentHue={accentHue} />
                <TrackInfo title={currentTrack} artist={currentArtist} appName={currentApp} />
              </div>

              <PlaybackControls
                isPlaying={isPlaying}
                accentHue={accentHue}
                onToggle={toggle}
                onNext={next}
                onPrevious={previous}
                disabled={isIdle}
              />

              <LyricsDisplay
                lyrics={lyrics}
                currentLineIndex={currentLineIndex}
                isPlaying={isPlaying}
                accentHue={accentHue}
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
