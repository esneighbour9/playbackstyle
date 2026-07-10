import { useEffect, useState } from 'react';

interface AlbumArtProps {
  isPlaying: boolean;
  accentHue: number;
}

export const AlbumArt = ({ isPlaying, accentHue }: AlbumArtProps) => {
  const [barHeights, setBarHeights] = useState([0.3, 0.6, 0.8, 0.5, 0.7, 0.4]);

  useEffect(() => {
    if (!isPlaying) {
      setBarHeights([0.15, 0.15, 0.15, 0.15, 0.15, 0.15]);
      return;
    }
    const interval = setInterval(() => {
      setBarHeights(Array.from({ length: 6 }, () => 0.15 + Math.random() * 0.85));
    }, 300);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="album-art-container">
      <div className={`album-art ${isPlaying ? 'playing' : ''}`}>
        {/* Layer 1: radial glow behind art */}
        <div
          className="album-art-glow-layer"
          style={{
            background: `radial-gradient(circle, hsl(${accentHue}, 70%, 50%, 0.5) 0%, transparent 60%)`,
            opacity: isPlaying ? 0.7 : 0.25,
          }}
        />

        {/* Layer 2: flowing gradient background */}
        <div
          className="album-art-bg"
          style={{
            background: `linear-gradient(135deg,
              hsl(${accentHue}, 70%, 25%),
              hsl(${(accentHue + 40) % 360}, 60%, 18%),
              hsl(${(accentHue + 80) % 360}, 50%, 12%),
              hsl(${(accentHue + 120) % 360}, 60%, 18%),
              hsl(${(accentHue + 160) % 360}, 70%, 25%))`,
            transition: 'background 0.8s ease',
          }}
        />

        {/* Layer 3: sound wave bars */}
        <div className="album-art-bars">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="album-art-bar"
              style={{
                height: `${h * 60}%`,
                background: `hsl(${accentHue}, 60%, ${55 + i * 5}%)`,
                transition: 'height 0.25s ease',
              }}
            />
          ))}
        </div>

        {/* Layer 4: center ring */}
        <div
          className={`album-art-ring ${isPlaying ? 'pulsing' : ''}`}
          style={{
            borderColor: `hsl(${accentHue}, 70%, 55%, 0.6)`,
            boxShadow: isPlaying ? `0 0 20px hsl(${accentHue}, 70%, 55%, 0.4)` : 'none',
          }}
        />

        {/* Music note placeholder — kept subtle in center */}
        <div className="album-art-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
      </div>
    </div>
  );
};
