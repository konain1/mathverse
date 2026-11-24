import { describe, expect, it } from 'vitest';
import {
  addFace,
  addFaceAt,
  addPoint,
  addSegment,
  counts,
  emptyConstruction,
  extrudeFace,
  findPointAt,
  movePoint,
  type Construction,
  type OpResult,
} from './construction';
import { findOpenLoops, loopAt } from './loops';
import type { Vec3 } from './vector';

function ok(r: OpResult): Construction {
  if (!r.ok) throw new Error(`op failed: ${r.error}`);
  return r.c;
}

const SQ4: Vec3[] = [
  [0, 0, 0],
  [4, 0, 0],
  [4, 0, 4],
  [0, 0, 4],
];

function squareByLines(points = SQ4): Construction {
  let c = emptyConstruction();
  for (let i = 0; i < points.length; i++) c = ok(addSegment(c, points[i]!, points[(i + 1) % points.length]!));
  return c;
}

describe('construction ops', () => {
  it('points are de-duplicated by position', () => {
    let c = ok(addPoint(emptyConstruction(), [1, 0, 1]));
    const r = addPoint(c, [1, 0, 1]);
    expect(r.ok && r.created).toEqual([]);
    c = ok(r);
    expect(counts(c).V).toBe(1);
  });

  it('segments reuse endpoints; duplicates and zero-length are rejected', () => {
    const c = squareByLines();
    expect(counts(c)).toEqual({ V: 4, E: 4, F: 0 });
    expect(addSegment(c, [0, 0, 0], [4, 0, 0])).toEqual({ ok: false, error: 'edge-exists' });
    expect(addSegment(c, [1, 0, 1], [1, 0, 1])).toEqual({ ok: false, error: 'same-point' });
  });

  it('face from positions creates the missing points and edges', () => {
    const c = ok(addFaceAt(emptyConstruction(), SQ4, 'square'));
    expect(counts(c)).toEqual({ V: 4, E: 4, F: 1 });
    expect(Object.values(c.faces)[0]!.intent).toBe('square');
  });

  it('rejects degenerate faces', () => {
    const line: Vec3[] = [[0, 0, 0], [1, 0, 0], [2, 0, 0]];
    expect(addFaceAt(emptyConstruction(), line)).toMatchObject({ ok: false, error: 'face-collinear' });
    const bowtie: Vec3[] = [[0, 0, 0], [4, 0, 4], [4, 0, 0], [0, 0, 4]];
    expect(addFaceAt(emptyConstruction(), bowtie)).toMatchObject({ ok: false, error: 'face-not-convex' });
    const skew: Vec3[] = [[0, 0, 0], [4, 0, 0], [4, 2, 4], [0, 0, 4]];
    expect(addFaceAt(emptyConstruction(), skew)).toMatchObject({ ok: false, error: 'face-not-planar' });
    const c = ok(addFaceAt(emptyConstruction(), SQ4));
    const ids = Object.values(c.faces)[0]!.points;
    expect(addFace(c, [...ids].reverse())).toMatchObject({ ok: false, error: 'face-exists' });
  });

  it('push-pull a 4 cm square up 4 cm makes a cube: V 8, E 12, F 6', () => {
    const c0 = ok(addFaceAt(emptyConstruction(), SQ4, 'square'));
    const faceId = Object.keys(c0.faces)[0]!;
    const r = extrudeFace(c0, faceId, [0, 4, 0]);
    const c = ok(r);
    expect(counts(c)).toEqual({ V: 8, E: 12, F: 6 });
    expect(r.ok && r.topFaceId).toBeTruthy();
    expect(findPointAt(c, [4, 4, 4])).toBeDefined();
    expect(extrudeFace(c0, faceId, [0, 0, 0])).toMatchObject({ ok: false, error: 'zero-extrude' });
  });

  it('push-pull a triangle makes a triangular prism: V 6, E 9, F 5', () => {
    const c0 = ok(addFaceAt(emptyConstruction(), [[0, 0, 0], [4, 0, 0], [0, 0, 3]]));
    const c = ok(extrudeFace(c0, Object.keys(c0.faces)[0]!, [0, 5, 0]));
    expect(counts(c)).toEqual({ V: 6, E: 9, F: 5 });
  });

  it('move point keeps edges attached; cannot land on another point', () => {
    const c = squareByLines();
    const id = findPointAt(c, [4, 0, 4])!;
    const moved = ok(movePoint(c, id, [5, 0, 5]));
    expect(moved.points[id]!.pos).toEqual([5, 0, 5]);
    expect(counts(moved).E).toBe(4);
    expect(movePoint(c, id, [0, 0, 0])).toEqual({ ok: false, error: 'point-occupied' });
  });

  it('operations never mutate the input (undo relies on this)', () => {
    const c = squareByLines();
    const snapshot = JSON.stringify(c);
    addFaceAt(c, SQ4);
    movePoint(c, findPointAt(c, [0, 0, 0])!, [9, 0, 9]);
    expect(JSON.stringify(c)).toBe(snapshot);
  });
});

describe('loops', () => {
  it('finds the closed square drawn with four lines and locates a tap inside it', () => {
    const c = squareByLines();
    expect(findOpenLoops(c)).toHaveLength(1);
    expect(loopAt(c, [2, 0, 2])).toHaveLength(4);
    expect(loopAt(c, [6, 0, 2])).toBeUndefined();
  });
  it('a square with a diagonal: tapping picks the smaller triangle', () => {
    const c = ok(addSegment(squareByLines(), [0, 0, 0], [4, 0, 4]));
    expect(loopAt(c, [3, 0, 1])).toHaveLength(3);
  });
  it('an open path has no loops; a loop with a face is not offered again', () => {
    let c = emptyConstruction();
    c = ok(addSegment(c, [0, 0, 0], [4, 0, 0]));
    c = ok(addSegment(c, [4, 0, 0], [4, 0, 4]));
    expect(findOpenLoops(c)).toEqual([]);
    const filled = ok(addFaceAt(emptyConstruction(), SQ4));
    expect(findOpenLoops(filled)).toEqual([]);
  });
});
