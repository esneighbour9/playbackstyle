import { useEffect, useState } from 'react';

interface TitleBarProps {
  title?: string;
  playbackStatus?: 'Playing' | 'Paused' | 'Stopped';
  error?: string | null;
}

export const TitleBar = ({ title = 'Playbacker', playbackStatus = 'Stopped', error }: TitleBarProps) => {
  const [visibleError, setVisibleError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      setVisibleError(error);
      const timer = setTimeout(() => setVisibleError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="title-bar">
      <div className="title-bar-left">
        <span className={`status-dot ${playbackStatus.toLowerCase()}`} />
        <div className="title-bar-title">{title}</div>
        {visibleError && <span className="title-bar-error">{visibleError}</span>}
      </div>
      <div className="title-bar-controls no-drag">
        <button className="title-bar-button" onClick={() => window.electronAPI.minimize()}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 5H9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </button>
        <button className="title-bar-button" onClick={() => window.electronAPI.maximize()}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect x="1" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        <button className="title-bar-button close" onClick={() => window.electronAPI.close()}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};
