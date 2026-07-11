import { useMemo } from 'react';

export const IdleState = () => {
  const ringParticles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        key: i,
        angle: (i / 8) * 360,
        delay: `${i * 0.8}s`,
      })),
    [],
  );

  return (
    <div className="idle-state">
      <div className="idle-content">
        <div className="idle-ring-container">
          <div className="idle-ring" />
          {ringParticles.map((p) => (
            <div
              key={p.key}
              className="idle-ring-particle"
              style={{
                '--angle': `${p.angle}deg`,
                animationDelay: p.delay,
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="idle-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <h2 className="idle-title">Playbacker</h2>
        <p className="idle-subtitle">等候媒体播放...</p>
        <p className="idle-hint">启动 Apple Music 或其他媒体播放器以开始控制</p>
      </div>
    </div>
  );
};
