interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onToggle: () => void;
  onNext: () => void;
  onPrevious: () => void;
  disabled?: boolean;
}

export const PlaybackControls = ({
  isPlaying,
  onToggle,
  onNext,
  onPrevious,
  disabled = false,
}: PlaybackControlsProps) => {
  return (
    <div className="playback-controls">
      <button
        className="control-button"
        onClick={onPrevious}
        disabled={disabled}
        title="上一曲"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" fill="currentColor" />
        </svg>
      </button>
      <button
        className="control-button play"
        onClick={onToggle}
        disabled={disabled}
        title={isPlaying ? '暂停' : '播放'}
      >
        {isPlaying ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="4" width="4" height="16" fill="currentColor" rx="1" />
            <rect x="14" y="4" width="4" height="16" fill="currentColor" rx="1" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M8 5v14l11-7z" fill="currentColor" />
          </svg>
        )}
      </button>
      <button
        className="control-button"
        onClick={onNext}
        disabled={disabled}
        title="下一曲"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
};
