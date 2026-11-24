import { describe, expect, it } from 'vitest';
import { addFaceAt, addPoint, addSegment, emptyConstruction, extrudeFace, type Construction, type OpResult } from '@/lib/geometry/construction';
import { cubePlan, currentStepIndex, findSquare } from './recipes';

const ok = (r: OpResult): Construction => {
  if (!r.ok) throw new Error(r.error);
  return r.c;
};

describe('cubePlan(4)', () => {
  const plan = cubePlan(4);

  it('walks through the four guided steps', () => {
    let c = emptyConstruction();
    expect(currentStepIndex(plan, c)).toBe(0);
    expect(plan.steps[0]!.guide!(c)).toEqual({ points: [[0, 0, 0]] });

    c = ok(addPoint(c, [0, 0, 0]));
    expect(currentStepIndex(plan, c)).toBe(1);
    expect(plan.steps[1]!.guide!(c)!.points).toEqual([[4, 0, 0]]);

    c = ok(addSegment(c, [0, 0, 0], [4, 0, 0]));
    expect(currentStepIndex(plan, c)).toBe(2);
    const g = plan.steps[2]!.guide!(c)!;
    expect(g.points).toEqual([[4, 0, 4], [0, 0, 4]]);

    c = ok(addFaceAt(c, [[0, 0, 0], [4, 0, 0], [4, 0, 4], [0, 0, 4]], 'square'));
    expect(currentStepIndex(plan, c)).toBe(3);
    c = ok(extrudeFace(c, findSquare(c, 4)!.id, [0, 4, 0]));
    expect(currentStepIndex(plan, c)).toBe(4);
    expect(plan.check(c).ok).toBe(true);
  });

  it('a 3 cm line is called out with the numbers', () => {
    const c = ok(addSegment(emptyConstruction(), [0, 0, 0], [3, 0, 0]));
    expect(currentStepIndex(plan, c)).toBe(1);
    const ev = plan.steps[1]!.evaluate(c);
    expect(ev.issues[0]).toMatchObject({ code: 'line-wrong-length', values: { actual: 3, expected: 4 } });
  });

  it('a 4 × 3 face is not the square: the 3 cm sides are flagged', () => {
    let c = ok(addSegment(emptyConstruction(), [0, 0, 0], [4, 0, 0]));
    c = ok(addFaceAt(c, [[0, 0, 0], [4, 0, 0], [4, 0, 3], [0, 0, 3]], 'square'));
    expect(currentStepIndex(plan, c)).toBe(2);
    const codes = plan.steps[2]!.evaluate(c).issues.map((i) => i.code);
    expect(codes).toContain('side-mismatch');
  });

  it('pulling up 3 cm instead of 4: the 4 vertical edges are flagged as "3 cm, others 4 cm"', () => {
    let c = ok(addFaceAt(emptyConstruction(), [[0, 0, 0], [4, 0, 0], [4, 0, 4], [0, 0, 4]], 'square'));
    c = ok(extrudeFace(c, findSquare(c, 4)!.id, [0, 3, 0]));
    expect(currentStepIndex(plan, c)).toBe(3);
    const issues = plan.steps[3]!.evaluate(c).issues;
    expect(issues).toHaveLength(4);
    expect(issues[0]).toMatchObject({ code: 'side-mismatch', values: { actual: 3, expected: 4, shape: 'cube' } });
  });

  it('near the grid edge the guide flips direction so the cube still fits', () => {
    const c = ok(addPoint(emptyConstruction(), [8, 0, 8]));
    expect(plan.steps[1]!.guide!(c)!.points).toEqual([[4, 0, 8]]);
  });

  it('the target ghost has 12 edges', () => {
    expect(plan.target.segments).toHaveLength(12);
  });
});
