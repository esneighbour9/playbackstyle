interface TrackInfoProps {
  title: string;
  artist: string;
  appName: string;
}

export const TrackInfo = ({ title, artist, appName }: TrackInfoProps) => {
  return (
    <div className="track-info">
      <h3 className="track-title">{title || '未知曲目'}</h3>
      <p className="track-artist">{artist || '未知艺术家'}</p>
      <span className="track-source">{appName || '未知来源'}</span>
    </div>
  );
};
