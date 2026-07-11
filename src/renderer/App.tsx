import { useEffect, useRef } from 'react';
import { TitleBar } from './components/TitleBar';
import { AlbumArt } from './components/AlbumArt';
import { TrackInfo } from './components/TrackInfo';
import { PlaybackControls } from './components/PlaybackControls';
import { LyricsDisplay } from './components/LyricsDisplay';
import { IdleState } from './components/IdleState';
import { ParticleBackground } from './components/ParticleBackground';
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
    lastError,
    playbackStatus,
    toggle,
    next,
    previous,
  } = useMediaSession();

  const { lyrics, isLoading, currentLineIndex, lyricsError, searchLyrics, updateCurrentLine } = useLyrics();
  const prevTrackRef = useRef('');
  const prevArtistRef = useRef('');
  const accentHue = computeHue(currentTrack, currentArtist);
  const elapsedRef = useRef(0);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (currentTrack !== prevTrackRef.current || currentArtist !== prevArtistRef.current) {
      prevTrackRef.current = currentTrack;
      prevArtistRef.current = currentArtist;
      elapsedRef.current = 0;
      searchLyrics(currentTrack, currentArtist);
    }
  }, [currentTrack, currentArtist, searchLyrics]);

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = Date.now();
      const interval = setInterval(() => {
        const elapsed = elapsedRef.current + (Date.now() - startTimeRef.current) / 1000;
        updateCurrentLine(elapsed);
      }, 100);
      return () => {
        clearInterval(interval);
        elapsedRef.current += (Date.now() - startTimeRef.current) / 1000;
      };
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
          <TitleBar playbackStatus={playbackStatus} error={lastError} />
          
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
                isLoading={isLoading}
                error={lyricsError}
                accentHue={accentHue}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="app-background" />
      <ParticleBackground accentHue={accentHue} isPlaying={isPlaying} dense={isIdle} />
    </div>
  );
}

export default App;
