import { useState, useCallback, useRef } from 'react';

export interface LyricLine {
  time: number;
  text: string;
}

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(url: string, maxRetries = 2): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchWithTimeout(url);
    } catch (error) {
      lastError = error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error; // don't retry timeouts — surface immediately
      }
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1000));
      }
    }
  }
  throw lastError;
}

/** Parse LRC-formatted lyric text into timestamped lines. Exported for testing. */
export const parseLRC = (raw: string): LyricLine[] => {
  return raw
    .split('\n')
    .map((line) => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (!match) return null;
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
      return {
        time: minutes * 60 + seconds + milliseconds / 1000,
        text: match[4].trim(),
      };
    })
    .filter((line): line is LyricLine => line !== null && line.text.length > 0);
};

export const useLyrics = () => {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [lyricsError, setLyricsError] = useState<string | null>(null);
  const seqRef = useRef(0);

  const searchLyrics = useCallback(async (title: string, artist: string) => {
    if (!title || !artist) {
      setLyrics([]);
      setLyricsError(null);
      return;
    }

    const seq = ++seqRef.current;
    setIsLoading(true);
    setLyricsError(null);

    try {
      const searchUrl = `https://api.music.163.com/api/search/get?type=1&s=${encodeURIComponent(title + ' ' + artist)}&limit=1`;
      const searchResponse = await fetchWithRetry(searchUrl);

      if (!searchResponse.ok) {
        throw new Error(`搜索请求失败 (${searchResponse.status})`);
      }

      const data = await searchResponse.json();

      if (!data.result?.songs?.length) {
        if (seq === seqRef.current) {
          setLyrics([]);
        }
        return;
      }

      const songId = data.result.songs[0].id;
      const lyricUrl = `https://music.163.com/api/song/lyric?id=${songId}&lv=-1&kv=-1&tv=-1`;
      const lyricResponse = await fetchWithRetry(lyricUrl);

      if (!lyricResponse.ok) {
        throw new Error(`歌词请求失败 (${lyricResponse.status})`);
      }

      const lyricData = await lyricResponse.json();

      if (seq !== seqRef.current) return; // newer search started, discard

      if (lyricData.lrc?.lyric) {
        setLyrics(parseLRC(lyricData.lrc.lyric));
      } else {
        setLyrics([]);
      }
    } catch (error) {
      if (seq !== seqRef.current) return;
      const message = error instanceof Error ? error.message : '歌词加载失败';
      setLyricsError(message);
      // preserve existing lyrics — don't clear
    } finally {
      if (seq === seqRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const clearLyricsError = useCallback(() => setLyricsError(null), []);

  const updateCurrentLine = useCallback(
    (currentTime: number) => {
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
    },
    [lyrics],
  );

  return {
    lyrics,
    isLoading,
    currentLineIndex,
    lyricsError,
    searchLyrics,
    updateCurrentLine,
    clearLyricsError,
  };
};
