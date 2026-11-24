import { describe, expect, it } from 'vitest';
import {
  areCollinear,
  centroid,
  closestLineParamToRay,
  isPlanar,
  pointInPolygon,
  polygonArea,
  polygonNormal,
  rayPolygon,
} from './polygon';
import { angleAtDeg, isRightAngle, posKey, snapVec, type Vec3 } from './vector';

const sq: Vec3[] = [
  [0, 0, 0],
  [4, 0, 0],
  [4, 0, 4],
  [0, 0, 4],
];

describe('polygon', () => {
  it('area and normal of a ground square', () => {
    expect(polygonArea(sq)).toBe(16);
    const n = polygonNormal(sq);
    expect(Math.abs(n[1])).toBeCloseTo(1, 9);
    expect(centroid(sq)).toEqual([2, 0, 2]);
  });
  it('area of a vertical triangle', () => {
    expect(polygonArea([[0, 0, 0], [6, 0, 0], [0, 8, 0]])).toBe(24);
  });
  it('planarity', () => {
    expect(isPlanar(sq)).toBe(true);
    expect(isPlanar([[0, 0, 0], [4, 0, 0], [4, 1, 4], [0, 0, 4]])).toBe(false);
  });
  it('collinear points', () => {
    expect(areCollinear([0, 0, 0], [1, 0, 0], [5, 0, 0])).toBe(true);
    expect(areCollinear([0, 0, 0], [1, 0, 0], [1, 0, 1])).toBe(false);
  });
  it('point in polygon incl. boundary', () => {
    expect(pointInPolygon([2, 0, 2], sq)).toBe(true);
    expect(pointInPolygon([4, 0, 2], sq)).toBe(true);
    expect(pointInPolygon([5, 0, 2], sq)).toBe(false);
  });
  it('ray hits a face from above', () => {
    expect(rayPolygon([2, 10, 2], [0, -1, 0], sq)).toBeCloseTo(10, 9);
    expect(rayPolygon([9, 10, 9], [0, -1, 0], sq)).toBeNull();
    expect(rayPolygon([2, 10, 2], [0, 1, 0], sq)).toBeNull(); // pointing away
  });
  it('push-pull: closest point on the vertical line to a horizontal ray', () => {
    // vertical line through (0,0,0); ray at height 3 crossing x=0 from the side
    const s = closestLineParamToRay([0, 0, 0], [0, 1, 0], [-10, 3, 0], [1, 0, 0]);
    expect(s).toBeCloseTo(3, 9);
    expect(closestLineParamToRay([0, 0, 0], [0, 1, 0], [5, 0, 0], [0, 1, 0])).toBeNull();
  });
});

describe('vector helpers', () => {
  it('angles', () => {
    expect(angleAtDeg([0, 0, 0], [4, 0, 0], [0, 0, 4])).toBeCloseTo(90, 9);
    expect(angleAtDeg([0, 0, 0], [4, 0, 0], [4, 0, 4])).toBeCloseTo(45, 9);
    expect(isRightAngle(90.3)).toBe(true);
    expect(isRightAngle(91)).toBe(false);
  });
  it('snapping and keys', () => {
    expect(snapVec([1.4, -0.6, 2.5])).toEqual([1, -1, 3]);
    expect(posKey([0, -0, 1.0000000001])).toBe(posKey([0, 0, 1]));
  });
});
