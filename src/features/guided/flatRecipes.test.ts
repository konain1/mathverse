import { describe, expect, it } from 'vitest';
import { addFaceAt, addPoint, addSegment, emptyConstruction, type Construction, type OpResult } from '@/lib/geometry/construction';
import type { Vec3 } from '@/lib/geometry/vector';
import { diamondPlan, nestedPlan, quadPlan } from './flatRecipes';
import { currentStepIndex } from './recipes';

const ok = (r: OpResult): Construction => {
  if (!r.ok) throw new Error(r.error);
  return r.c;
};
const rect = (x: number, z: number, l: number, b: number): Vec3[] => [[x, 0, z], [x + l, 0, z], [x + l, 0, z + b], [x, 0, z + b]];

describe('quadPlan', () => {
  it('rectangle 7 × 4 with one diagonal', () => {
    const plan = quadPlan({ l: 7, b: 4, diagonals: 1 });
    let c = ok(addPoint(emptyConstruction(), [0, 0, 0]));
    c = ok(addSegment(c, [0, 0, 0], [7, 0, 0]));
    expect(currentStepIndex(plan, c)).toBe(2);
    expect(plan.steps[2]!.guide!(c)!.points).toEqual([[7, 0, 4], [0, 0, 4]]);
    c = ok(addFaceAt(c, rect(0, 0, 7, 4), 'rectangle'));
    expect(currentStepIndex(plan, c)).toBe(3);
    expect(plan.check(c).ok).toBe(false); // diagonal still missing
    c = ok(addSegment(c, [0, 0, 0], [7, 0, 4]));
    expect(currentStepIndex(plan, c)).toBe(4);
    expect(plan.check(c).ok).toBe(true);
  });
  it('a 7 × 3 rectangle when 7 × 4 was asked is flagged', () => {
    const plan = quadPlan({ l: 7, b: 4 });
    let c = ok(addSegment(emptyConstruction(), [0, 0, 0], [7, 0, 0]));
    c = ok(addFaceAt(c, rect(0, 0, 7, 3), 'rectangle'));
    expect(plan.steps[2]!.evaluate(c).issues[0]).toMatchObject({ code: 'dimensions-mismatch', values: { actualB: 3, expectedB: 4 } });
  });
  it('square with both diagonals', () => {
    const plan = quadPlan({ l: 5, b: 5, diagonals: 2 });
    let c = ok(addFaceAt(emptyConstruction(), rect(0, 0, 5, 5), 'square'));
    c = ok(addSegment(c, [0, 0, 0], [5, 0, 5]));
    expect(plan.check(c).ok).toBe(false);
    c = ok(addSegment(c, [5, 0, 0], [0, 0, 5]));
    expect(plan.check(c).ok).toBe(true);
  });
});

describe('diamondPlan', () => {
  it('two equal diagonals bisecting at 90° make a square', () => {
    const plan = diamondPlan(3);
    let c = ok(addSegment(emptyConstruction(), [0, 0, 3], [6, 0, 3]));
    expect(currentStepIndex(plan, c)).toBe(1);
    expect(plan.steps[1]!.guide!(c)!.points).toEqual([[3, 0, 0], [3, 0, 6]]);
    // off-centre second diagonal is called out
    const bad = ok(addSegment(c, [2, 0, 0], [2, 0, 6]));
    expect(plan.steps[1]!.evaluate(bad).issues[0]!.code).toBe('not-bisected');
    c = ok(addSegment(c, [3, 0, 0], [3, 0, 6]));
    expect(currentStepIndex(plan, c)).toBe(2);
    c = ok(addFaceAt(c, [[0, 0, 3], [3, 0, 0], [6, 0, 3], [3, 0, 6]], 'square'));
    expect(plan.check(c).ok).toBe(true);
  });
});

describe('nestedPlan', () => {
  it('frame: photo 6 × 4, frame 1 cm all round (8 × 6)', () => {
    const plan = nestedPlan({ L: 8, B: 6, w: 1, mode: 'outside' });
    let c = ok(addFaceAt(emptyConstruction(), rect(1, 1, 6, 4), 'rectangle'));
    expect(currentStepIndex(plan, c)).toBe(1);
    // right size, wrong place
    const shifted = ok(addFaceAt(c, rect(0, 0.0, 8, 6).map((p) => [p[0] + 1, 0, p[2]] as Vec3), 'rectangle'));
    expect(plan.steps[1]!.evaluate(shifted).issues[0]).toMatchObject({ code: 'border-uneven', values: { w: 1 } });
    c = ok(addFaceAt(c, rect(0, 0, 8, 6), 'rectangle'));
    expect(plan.check(c).ok).toBe(true);
  });
  it('path inside a 10 × 8 lawn, 2 cm wide', () => {
    const plan = nestedPlan({ L: 10, B: 8, w: 2, mode: 'inside' });
    let c = ok(addFaceAt(emptyConstruction(), rect(0, 0, 10, 8), 'rectangle'));
    c = ok(addFaceAt(c, rect(2, 2, 6, 4), 'rectangle'));
    expect(plan.check(c).ok).toBe(true);
  });
});
