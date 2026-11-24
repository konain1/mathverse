import { describe, expect, it } from 'vitest';
import { distance, lerp, midpoint, roundTo } from './vector';

describe('vector', () => {
  it('distance uses all three axes', () => {
    expect(distance([0, 0, 0], [3, 4, 0])).toBe(5);
    expect(distance([1, 2, 3], [1, 2, 3])).toBe(0);
    expect(distance([0, 0, 0], [1, 2, 2])).toBe(3);
  });
  it('midpoint', () => {
    expect(midpoint([0, 0, 0], [2, 4, -6])).toEqual([1, 2, -3]);
  });
  it('lerp', () => {
    expect(lerp(2, 10, 0)).toBe(2);
    expect(lerp(2, 10, 0.5)).toBe(6);
    expect(lerp(2, 10, 1)).toBe(10);
  });
  it('roundTo avoids float noise', () => {
    expect(roundTo(0.1 + 0.2, 2)).toBe(0.3);
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(roundTo(-2.345, 1)).toBe(-2.3);
  });
});
