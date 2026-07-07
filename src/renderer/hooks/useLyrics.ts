import { useState, useCallback } from 'react';

export interface LyricLine {
  time: number;
  text: string;
}

export const useLyrics = () => {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);

  const searchLyrics = useCallback(async (title: string, artist: string) => {
    if (!title || !artist) {
      setLyrics([]);
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://api.music.163.com/api/search/get?type=1&s=${encodeURIComponent(title + ' ' + artist)}&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.result && data.result.songs && data.result.songs.length > 0) {
        const songId = data.result.songs[0].id;
        const lyricUrl = `https://music.163.com/api/song/lyric?id=${songId}&lv=-1&kv=-1&tv=-1`;
        const lyricResponse = await fetch(lyricUrl);
        const lyricData = await lyricResponse.json();
        
        if (lyricData.lrc && lyricData.lrc.lyric) {
          const lines = lyricData.lrc.lyric.split('\n').map((line: string) => {
            const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
            if (match) {
              const minutes = parseInt(match[1]);
              const seconds = parseInt(match[2]);
              const milliseconds = parseInt(match[3].padEnd(3, '0'));
              return {
                time: minutes * 60 + seconds + milliseconds / 1000,
                text: match[4].trim(),
              };
            }
            return null;
          }).filter((line: LyricLine | null) => line !== null && line.text);
          
          setLyrics(lines);
        } else {
          setLyrics([]);
        }
      } else {
        setLyrics([]);
      }
    } catch {
      setLyrics([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCurrentLine = useCallback((currentTime: number) => {
    if (lyrics.length === 0) {
      setCurrentLineIndex(-1);
      return;
    }

    let index = lyrics.length - 1;
    for (let i = 0; i < lyrics.length - 1; i++) {
      if (currentTime >= lyrics[i].time && currentTime < lyrics[i + 1].time) {
        index = i;
        break;
      }
    }
    setCurrentLineIndex(index);
  }, [lyrics]);

  return {
    lyrics,
    isLoading,
    currentLineIndex,
    searchLyrics,
    updateCurrentLine,
  };
};
