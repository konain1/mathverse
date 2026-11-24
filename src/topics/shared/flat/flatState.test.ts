import { describe, expect, it } from 'vitest';
import { axisQuad, diamondQuad, flatState, perimeterOf, ringStrips, walkPath } from './flatState';

describe('flatState', () => {
  const rect = { corners: axisQuad(7, 4), kind: 'rectangle' as const, tiles: { nx: 7, nz: 4, size: 1, origin: [0, 0, 0] as [number, number, number] } };

  it('perimeter walk ends exactly at 2(l + b)', () => {
    expect(perimeterOf(rect.corners)).toBe(22);
    expect(flatState('perimeter', 1, rect).counter).toEqual({ kind: 'length', value: 22 });
    expect(walkPath(rect.corners, 9)).toEqual([[0, 0, 0], [7, 0, 0], [7, 0, 2]]);
  });

  it('tiling counts a row, then all l × b', () => {
    expect(flatState('tile-row', 1, rect).counter?.value).toBe(7);
    expect(flatState('tile-all', 1, rect).counter?.value).toBe(28);
    expect(flatState('area', 0, rect).counter).toEqual({ kind: 'area', value: 28 });
  });

  it('big tiles report area = tiles × tile area', () => {
    const tray = { ...rect, tiles: { nx: 3, nz: 2, size: 2, origin: [0, 0, 0] as [number, number, number] } };
    expect(flatState('area', 0, tray).counter?.value).toBe(24);
    expect(flatState('tile-all', 1, tray).counter).toEqual({ kind: 'tiles', value: 6 });
  });

  it('four triangles from the diagonals are each a quarter of the square', () => {
    const sq = { corners: axisQuad(6, 6), kind: 'square' as const };
    expect(flatState('four-triangles', 0.5, sq).counter?.value).toBe(9);
  });

  it('frame strips add up to outer − inner (strip method = subtraction method)', () => {
    const ring = { outer: axisQuad(8, 6), inner: axisQuad(6, 4, 1, 1) };
    expect(ringStrips(ring.outer, ring.inner)).toEqual([8, 8, 4, 4]);
    const cfg = { corners: ring.inner, kind: 'rectangle' as const, ring };
    expect(flatState('frame', 1, cfg).counter?.value).toBe(24);
    expect(flatState('frame-subtract', 1, cfg).counter?.value).toBe(48 - 24);
  });

  it('diamond square has diagonals 2k and side k√2', () => {
    const q = diamondQuad(3);
    expect(perimeterOf(q)).toBeCloseTo(4 * 3 * Math.SQRT2, 9);
  });
});
