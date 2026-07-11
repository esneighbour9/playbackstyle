import { useEffect, useRef, useMemo } from 'react';
import { LyricLine } from '../hooks/useLyrics';

interface LyricsDisplayProps {
  lyrics: LyricLine[];
  currentLineIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  accentHue: number;
}

const WINDOW = 2;

/**
 * Line style computed from distance to the active line.
 * Distance 0 = current line (full opacity, enlarged, glow).
 * Distance 1/2 = faded and scaled down progressively.
 */
const lineStyle = (distance: number, accentHue: number): React.CSSProperties => {
  const abs = Math.abs(distance);
  const opacity = abs === 0 ? 1 : abs === 1 ? 0.5 : 0.25;
  const scale = abs === 0 ? 1.06 : abs === 1 ? 0.92 : 0.82;
  const blur = abs === 0 ? 6 : 0;
  return {
    opacity,
    transform: `scale(${scale})`,
    filter: blur ? `blur(${blur}px)` : undefined,
    '--line-accent': accentHue,
  } as React.CSSProperties;
};

export const LyricsDisplay = ({
  lyrics,
  currentLineIndex,
  isPlaying,
  isLoading,
  error,
  accentHue,
}: LyricsDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineHeightEstimate = 44; // px, used for spacer sizing

  const visibleLines = useMemo(() => {
    if (lyrics.length === 0) return [];
    const start = Math.max(0, currentLineIndex - WINDOW);
    const end = Math.min(lyrics.length - 1, currentLineIndex + WINDOW);
    const lines: { index: number; text: string; distance: number }[] = [];
    for (let i = start; i <= end; i++) {
      lines.push({ index: i, text: lyrics[i].text, distance: i - currentLineIndex });
    }
    return lines;
  }, [lyrics, currentLineIndex]);

  useEffect(() => {
    if (!containerRef.current || visibleLines.length === 0) return;
    const container = containerRef.current;
    // Find the active line DOM node
    const activeEl = container.querySelector('.lyric-line.active') as HTMLElement | null;
    if (!activeEl) return;
    const containerRect = container.getBoundingClientRect();
    const lineRect = activeEl.getBoundingClientRect();
    const scrollTarget = activeEl.offsetTop - containerRect.height / 2 + lineRect.height / 2;
    container.scrollTo({ top: scrollTarget, behavior: 'smooth' });
  }, [currentLineIndex, visibleLines]);

  if (lyrics.length === 0) {
    return (
      <div className="lyrics-display empty" style={{ '--accent-hue': accentHue } as React.CSSProperties}>
        <div className="lyrics-empty">
          {error ? (
            <p className="lyrics-error">{error}</p>
          ) : isLoading ? (
            <p>正在搜索歌词...</p>
          ) : isPlaying ? (
            <p>未找到歌词</p>
          ) : (
            <p>暂无歌词</p>
          )}
        </div>
      </div>
    );
  }

  const topSpacerHeight = Math.max(0, currentLineIndex - WINDOW) * lineHeightEstimate;
  const bottomSpacerHeight =
    Math.max(0, lyrics.length - 1 - currentLineIndex - WINDOW) * lineHeightEstimate;

  return (
    <div
      className="lyrics-display lyrics-stage"
      ref={containerRef}
      style={{ '--accent-hue': accentHue } as React.CSSProperties}
    >
      {/* Top spacer — keeps scroll height proportional to full lyrics */}
      {topSpacerHeight > 0 && <div style={{ height: topSpacerHeight, flexShrink: 0 }} />}

      {visibleLines.map(({ index, text, distance }) => (
        <div
          key={index}
          className={`lyric-line${distance === 0 ? ' active' : ''}`}
          style={lineStyle(distance, accentHue)}
        >
          {text}
        </div>
      ))}

      {/* Bottom spacer */}
      {bottomSpacerHeight > 0 && <div style={{ height: bottomSpacerHeight, flexShrink: 0 }} />}
    </div>
  );
};
