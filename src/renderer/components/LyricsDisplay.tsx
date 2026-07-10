import { useEffect, useRef } from 'react';
import { LyricLine } from '../hooks/useLyrics';

interface LyricsDisplayProps {
  lyrics: LyricLine[];
  currentLineIndex: number;
  isPlaying: boolean;
  accentHue: number;
}

export const LyricsDisplay = ({ lyrics, currentLineIndex, isPlaying, accentHue }: LyricsDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const currentLine = currentLineRef.current;
      const containerRect = container.getBoundingClientRect();
      const lineRect = currentLine.getBoundingClientRect();
      
      const scrollTop = currentLine.offsetTop - containerRect.height / 2 + lineRect.height / 2;
      container.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }, [currentLineIndex]);

  if (lyrics.length === 0) {
    return (
      <div className="lyrics-display empty" style={{ '--accent-hue': accentHue } as React.CSSProperties}>
        <div className="lyrics-empty">
          <p>{isPlaying ? '正在搜索歌词...' : '暂无歌词'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lyrics-display" ref={containerRef} style={{ '--accent-hue': accentHue } as React.CSSProperties}>
      {lyrics.map((line, index) => (
        <div
          key={index}
          ref={index === currentLineIndex ? currentLineRef : null}
          className={`lyric-line ${index === currentLineIndex ? 'active' : ''}`}
        >
          {line.text}
        </div>
      ))}
    </div>
  );
};
