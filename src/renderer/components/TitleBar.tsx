interface TitleBarProps {
  title?: string;
}

export const TitleBar = ({ title = 'Playbacker' }: TitleBarProps) => {
  return (
    <div className="title-bar">
      <div className="title-bar-title">{title}</div>
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
