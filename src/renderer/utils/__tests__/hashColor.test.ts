import { describe, it, expect } from 'vitest';
import { computeHue } from '../hashColor';

describe('computeHue', () => {
  it('returns a number 0-359 for non-empty input', () => {
    const result = computeHue('Song', 'Artist');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(360);
  });

  it('returns the same hue for the same title and artist', () => {
    expect(computeHue('A', 'B')).toBe(computeHue('A', 'B'));
  });

  it('returns 0 for empty input', () => {
    expect(computeHue('', '')).toBe(0);
  });

  it('returns different values for different inputs', () => {
    expect(computeHue('A', 'B')).not.toBe(computeHue('X', 'Y'));
  });
});
