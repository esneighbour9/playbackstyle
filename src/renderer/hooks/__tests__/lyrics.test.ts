import { describe, it, expect } from 'vitest';
import { parseLRC } from '../useLyrics';

describe('parseLRC', () => {
  it('parses standard LRC lines', () => {
    const raw = '[00:12.34]First line\n[00:45.67]Second line';
    const result = parseLRC(raw);
    expect(result).toEqual([
      { time: 12.34, text: 'First line' },
      { time: 45.67, text: 'Second line' },
    ]);
  });

  it('handles three-digit milliseconds', () => {
    const raw = '[01:02.003]Test';
    const result = parseLRC(raw);
    expect(result).toEqual([{ time: 62.003, text: 'Test' }]);
  });

  it('filters out lines without timestamps', () => {
    const raw = '[ti:Title]\n[00:10.00]Real line\n[offset:0]';
    const result = parseLRC(raw);
    expect(result).toEqual([{ time: 10, text: 'Real line' }]);
  });

  it('filters out empty text lines', () => {
    const raw = '[00:10.00]\n[00:20.00]Valid';
    const result = parseLRC(raw);
    expect(result).toEqual([{ time: 20, text: 'Valid' }]);
  });

  it('returns empty array for invalid input', () => {
    expect(parseLRC('')).toEqual([]);
    expect(parseLRC('not lrc at all')).toEqual([]);
  });
});
