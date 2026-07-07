export const IdleState = () => {
  return (
    <div className="idle-state">
      <div className="idle-content">
        <div className="idle-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <h2 className="idle-title">Playbacker</h2>
        <p className="idle-subtitle">等待媒体播放...</p>
        <p className="idle-hint">启动 Apple Music 或其他媒体播放器以开始控制</p>
      </div>
      <div className="idle-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              size: `${2 + Math.random() * 4}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
