import { describe, expect, it } from 'vitest';
import { addFaceAt, emptyConstruction } from '@/lib/geometry/construction';
import { faceAt, faceHit, groundHit, snapToGrid, targetAtPosition } from './targeting';

const square = () => {
  const r = addFaceAt(emptyConstruction(), [[0, 0, 0], [4, 0, 0], [4, 0, 4], [0, 0, 4]]);
  if (!r.ok) throw new Error(r.error);
  return r.c;
};

describe('targeting', () => {
  it('snaps to the 1 cm grid and stays inside it', () => {
    expect(snapToGrid([1.4, 9, 2.6])).toEqual([1, 0, 3]);
    expect(snapToGrid([25, 0, -30])).toEqual([10, 0, -10]);
  });
  it('a ray from above lands on the snapped grid point', () => {
    expect(groundHit([2.3, 10, 3.8], [0, -1, 0])).toEqual([2, 0, 4]);
    expect(groundHit([0, 10, 0], [0, 1, 0])).toBeNull(); // looking at the sky
  });
  it('finds the face under a position or a ray', () => {
    const c = square();
    const fid = Object.keys(c.faces)[0]!;
    expect(faceAt(c, [2, 0, 2])).toBe(fid);
    expect(faceAt(c, [6, 0, 2])).toBeUndefined();
    expect(faceHit(c, [1, 5, 1], [0, -1, 0])).toBe(fid);
  });
  it('target at a corner carries the point id and the face id', () => {
    const t = targetAtPosition(square(), [4, 0, 4]);
    expect(t.pointId).toBeDefined();
    expect(t.faceId).toBeDefined();
  });
});
