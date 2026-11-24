import { describe, expect, it } from 'vitest';
import { fillOrder } from './UnitCubeFiller';

describe('fillOrder', () => {
  it('fills a 4 × 4 layer row by row before going up', () => {
    expect(fillOrder(4, 4, 0)).toEqual([0, 0, 0]);
    expect(fillOrder(4, 4, 3)).toEqual([3, 0, 0]);
    expect(fillOrder(4, 4, 4)).toEqual([0, 0, 1]);
    expect(fillOrder(4, 4, 15)).toEqual([3, 0, 3]);
    expect(fillOrder(4, 4, 16)).toEqual([0, 1, 0]);
    expect(fillOrder(4, 4, 63)).toEqual([3, 3, 3]);
  });
  it('visits every cell exactly once', () => {
    const seen = new Set<string>();
    for (let k = 0; k < 3 * 5 * 2; k++) seen.add(fillOrder(3, 2, k).join());
    expect(seen.size).toBe(30);
  });
});
