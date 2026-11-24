import { describe, expect, it } from 'vitest';
import { addFaceAt, addSegment, emptyConstruction, extrudeFace, findPointAt, movePoint, type Construction, type OpResult } from './construction';
import {
  analyzeConstruction,
  checkCube,
  checkCuboid,
  checkFaceIntent,
  checkRectangle,
  checkSquare,
  checkTriangle,
  cuboidDimensions,
  describeTriangle,
  faceAreaCm2,
} from './validators';
import type { Vec3 } from './vector';

const ok = (r: OpResult): Construction => {
  if (!r.ok) throw new Error(r.error);
  return r.c;
};
const face = (pts: Vec3[], intent?: 'square' | 'rectangle' | 'triangle') => {
  const c = ok(addFaceAt(emptyConstruction(), pts, intent));
  const f = Object.values(c.faces)[0]!;
  return { c, ids: f.points, faceId: f.id };
};
const rect = (l: number, b: number): Vec3[] => [[0, 0, 0], [l, 0, 0], [l, 0, b], [0, 0, b]];

function box(l: number, b: number, h: number): Construction {
  const { c, faceId } = face(rect(l, b));
  return ok(extrudeFace(c, faceId, [0, h, 0]));
}

describe('checkSquare', () => {
  it('accepts a 4 cm square, also with a target side', () => {
    const { c, ids } = face(rect(4, 4));
    expect(checkSquare(c, ids).ok).toBe(true);
    expect(checkSquare(c, ids, { side: 4 }).ok).toBe(true);
  });
  it('the odd side out: "this side is 3 cm, the others 4 cm"', () => {
    // 4-4-?-? quadrilateral: move one corner so exactly one side is 3 cm is impossible
    // with right angles, so build a kite-free example: points with sides 4,4,4,3 are not
    // all right angles; use a 4×3 rectangle → two sides of 3.
    const { c, ids } = face(rect(4, 3));
    const r = checkSquare(c, ids);
    expect(r.ok).toBe(false);
    const mismatches = r.issues.filter((i) => i.code === 'side-mismatch');
    expect(mismatches).toHaveLength(2);
    expect(mismatches[0]!.values).toMatchObject({ actual: 3, expected: 4, shape: 'square' });
    expect(mismatches[0]!.entities).toHaveLength(1); // the edge id to glow red
  });
  it('with a target side, a 3 cm square is reported as the wrong size (not as mismatched sides)', () => {
    const { c, ids } = face(rect(3, 3));
    const r = checkSquare(c, ids, { side: 4 });
    expect(r.issues.map((i) => i.code)).toEqual(['side-wrong-length']);
    expect(r.issues[0]!.values).toMatchObject({ actual: 3, expected: 4 });
  });
  it('a rhombus has equal sides but no right angles', () => {
    const { c, ids } = face([[0, 0, 0], [5, 0, 0], [8, 0, 4], [3, 0, 4]]);
    const r = checkSquare(c, ids);
    expect(r.issues.some((i) => i.code === 'side-mismatch')).toBe(false);
    expect(r.issues.filter((i) => i.code === 'angle-not-right')).toHaveLength(4);
  });
  it('reports a missing side when the loop is open', () => {
    let c = emptyConstruction();
    const p = rect(4, 4);
    for (let i = 0; i < 3; i++) c = ok(addSegment(c, p[i]!, p[i + 1]!));
    const ids = p.map((x) => findPointAt(c, x)!);
    const r = checkSquare(c, ids);
    expect(r.issues.filter((i) => i.code === 'loop-open')).toHaveLength(1);
  });
});

describe('checkRectangle', () => {
  it('accepts 7 × 4 in any orientation and checks dimensions', () => {
    const { c, ids } = face(rect(7, 4));
    expect(checkRectangle(c, ids).ok).toBe(true);
    expect(checkRectangle(c, ids, { length: 7, breadth: 4 }).ok).toBe(true);
    expect(checkRectangle(c, ids, { length: 4, breadth: 7 }).ok).toBe(true);
    const r = checkRectangle(c, ids, { length: 8, breadth: 4 });
    expect(r.issues[0]).toMatchObject({ code: 'dimensions-mismatch', values: { actualL: 7, expectedL: 8 } });
  });
  it('a parallelogram fails on angles; a trapezium also on opposite sides', () => {
    const para = face([[0, 0, 0], [6, 0, 0], [8, 0, 3], [2, 0, 3]]);
    expect(checkRectangle(para.c, para.ids).issues.every((i) => i.code === 'angle-not-right')).toBe(true);
    const trap = face([[0, 0, 0], [8, 0, 0], [6, 0, 3], [2, 0, 3]]);
    expect(checkRectangle(trap.c, trap.ids).issues.some((i) => i.code === 'opposite-sides-unequal')).toBe(true);
  });
  it('a square is a rectangle', () => {
    const { c, ids } = face(rect(5, 5));
    expect(checkRectangle(c, ids).ok).toBe(true);
  });
});

describe('triangles', () => {
  it('3-4-5 right triangle on the grid', () => {
    const { c, ids } = face([[0, 0, 0], [4, 0, 0], [0, 0, 3]]);
    const info = describeTriangle(c, ids)!;
    expect(info.bySides).toBe('scalene');
    expect(info.byAngles).toBe('right');
    expect([...info.sides].sort()).toEqual([3, 4, 5]);
    expect(info.angles.reduce((s, a) => s + a, 0)).toBeCloseTo(180, 9);
    expect(checkTriangle(c, ids, { sides: [5, 3, 4], byAngles: 'right' }).ok).toBe(true);
  });
  it('isosceles and obtuse', () => {
    const iso = face([[0, 0, 0], [6, 0, 0], [3, 0, 4]]);
    expect(describeTriangle(iso.c, iso.ids)).toMatchObject({ bySides: 'isosceles', byAngles: 'acute' });
    const obt = face([[0, 0, 0], [6, 0, 0], [7, 0, 1]]);
    expect(describeTriangle(obt.c, obt.ids)!.byAngles).toBe('obtuse');
  });
  it('wrong side lengths are reported with both sets of numbers', () => {
    const { c, ids } = face([[0, 0, 0], [4, 0, 0], [0, 0, 3]]);
    const r = checkTriangle(c, ids, { sides: [6, 8, 10] });
    expect(r.issues[0]).toMatchObject({ code: 'triangle-sides-mismatch', values: { actual: '3, 4, 5', expected: '6, 8, 10' } });
  });
});

describe('solids', () => {
  it('cube of side 4', () => {
    const c = box(4, 4, 4);
    expect(checkCube(c).ok).toBe(true);
    expect(checkCube(c, { side: 4 }).ok).toBe(true);
    expect(checkCube(c, { side: 5 }).issues[0]!.code).toBe('side-wrong-length');
    expect(cuboidDimensions(c)).toEqual([4, 4, 4]);
  });
  it('a 4 × 4 base pulled up 3 is not a cube: the 4 vertical edges are flagged', () => {
    const c = box(4, 4, 3);
    const r = checkCube(c);
    const flagged = r.issues.filter((i) => i.code === 'side-mismatch');
    expect(flagged).toHaveLength(4);
    expect(flagged[0]!.values).toMatchObject({ actual: 3, expected: 4, shape: 'cube' });
    expect(checkCuboid(c).ok).toBe(true);
  });
  it('cuboid 8 × 6 × 4 and its dimensions', () => {
    const c = box(8, 6, 4);
    expect(checkCuboid(c, { dims: [4, 8, 6] }).ok).toBe(true);
    expect(cuboidDimensions(c)).toEqual([8, 6, 4]);
    expect(checkCuboid(c, { dims: [8, 6, 5] }).issues[0]!.code).toBe('solid-dimensions-mismatch');
  });
  it('an unfinished cube reports the missing counts', () => {
    const { c } = face(rect(4, 4));
    const r = checkCube(c);
    expect(r.issues.filter((i) => i.code === 'count-mismatch').map((i) => i.values?.what)).toEqual(['vertices', 'edges', 'faces']);
  });
  it('a dragged corner breaks the right angles', () => {
    const c0 = box(4, 4, 4);
    const c = ok(movePoint(c0, findPointAt(c0, [4, 4, 4])!, [5, 4, 4]));
    expect(checkCuboid(c).issues.some((i) => i.code === 'angle-not-right')).toBe(true);
  });
});

describe('analysis', () => {
  it('describes a cube and its faces', () => {
    const a = analyzeConstruction(box(4, 4, 4));
    expect(a.counts).toEqual({ V: 8, E: 12, F: 6 });
    expect(a.solid).toEqual({ shape: 'cube', dims: [4, 4, 4] });
    expect(a.faces.every((f) => f.shape === 'square')).toBe(true);
    expect(a.issues).toEqual([]);
  });
  it('cuboid', () => {
    expect(analyzeConstruction(box(7, 4, 2)).solid).toEqual({ shape: 'cuboid', dims: [7, 4, 2] });
  });
  it('intent: a "square" face that is really a rectangle gets issues tagged with the face id', () => {
    const { c, faceId } = face(rect(4, 3), 'square');
    const r = checkFaceIntent(c, faceId);
    expect(r.ok).toBe(false);
    expect(r.issues[0]!.entities).toContain(faceId);
  });
  it('face areas', () => {
    expect(faceAreaCm2(face(rect(7, 4)).c, face(rect(7, 4)).faceId)).toBe(28);
    const t = face([[0, 0, 0], [6, 0, 0], [3, 0, 4]]);
    expect(faceAreaCm2(t.c, t.faceId)).toBe(12);
  });
});
