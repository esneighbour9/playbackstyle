interface AlbumArtProps {
  title: string;
  artist: string;
  isPlaying: boolean;
}

export const AlbumArt = ({ title, artist, isPlaying }: AlbumArtProps) => {
  const getGradient = () => {
    const hash = `${title}${artist}`.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `linear-gradient(135deg, hsl(${hue}, 70%, 25%), hsl(${(hue + 60) % 360}, 70%, 15%), hsl(${(hue + 120) % 360}, 60%, 10%))`;
  };

  return (
    <div className="album-art-container">
      <div className={`album-art ${isPlaying ? 'playing' : ''}`} style={{ background: getGradient() }}>
        <div className="album-art-inner">
          <div className="album-art-placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
        </div>
        {isPlaying && (
          <div className="album-art-glow" />
        )}
      </div>
    </div>
  );
};
