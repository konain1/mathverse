import { describe, expect, it } from 'vitest';
import { locate, phase, stepStart, totalDuration } from './timeline';

describe('timeline', () => {
  const d = [2, 4, 4];
  it('totals and starts', () => {
    expect(totalDuration(d)).toBe(10);
    expect(stepStart(d, 0)).toBe(0);
    expect(stepStart(d, 2)).toBe(6);
  });
  it('locates times', () => {
    expect(locate(d, 0)).toEqual({ index: 0, t: 0 });
    expect(locate(d, 1)).toEqual({ index: 0, t: 0.5 });
    expect(locate(d, 2)).toEqual({ index: 1, t: 0 });
    expect(locate(d, 8)).toEqual({ index: 2, t: 0.5 });
    expect(locate(d, 10)).toEqual({ index: 2, t: 1 });
    expect(locate(d, 99)).toEqual({ index: 2, t: 1 });
    expect(locate(d, -5)).toEqual({ index: 0, t: 0 });
  });
  it('sub-phases', () => {
    expect(phase(0.5, 0.25, 0.75)).toBe(0.5);
    expect(phase(0.1, 0.25, 0.75)).toBe(0);
    expect(phase(0.9, 0.25, 0.75)).toBe(1);
  });
});
