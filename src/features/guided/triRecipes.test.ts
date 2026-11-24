import { describe, expect, it } from 'vitest';
import { addFaceAt, addPoint, addSegment, emptyConstruction, type Construction, type OpResult } from '@/lib/geometry/construction';
import { describeTriangle } from '@/lib/geometry/validators';
import type { Vec3 } from '@/lib/geometry/vector';
import { LATTICE, LATTICE_KEYS, sidesOf, triFromAngles } from '@/topics/shared/tri/lattice';
import { currentStepIndex } from './recipes';
import { anyTrianglePlan, congruentCopyPlan, exactTrianglePlan } from './triRecipes';

const ok = (r: OpResult): Construction => {
  if (!r.ok) throw new Error(r.error);
  return r.c;
};

describe('lattice triangles', () => {
  it('have the advertised types', () => {
    const kinds = Object.fromEntries(
      LATTICE_KEYS.map((k) => {
        const c = ok(addFaceAt(emptyConstruction(), [...LATTICE[k]]));
        const d = describeTriangle(c, Object.values(c.faces)[0]!.points)!;
        return [k, `${d.bySides} ${d.byAngles}`];
      }),
    );
    expect(kinds).toEqual({
      iso566: 'isosceles acute',
      iso558: 'isosceles obtuse',
      right345: 'scalene right',
      right6810: 'scalene right',
      rightIso: 'isosceles right',
      scaleneAcute: 'scalene acute',
      scaleneObtuse: 'scalene obtuse',
    });
    expect(sidesOf(LATTICE.iso566)).toEqual([6, 5, 5]);
  });
  it('triFromAngles gives the asked angles', () => {
    const [A, B, C] = triFromAngles(50, 60);
    const c = ok(addFaceAt(emptyConstruction(), [A, B, C]));
    const d = describeTriangle(c, Object.values(c.faces)[0]!.points)!;
    expect(d.angles[0]).toBeCloseTo(70, 6); // at A
    expect(d.angles[1]).toBeCloseTo(50, 6); // at B
  });
});

describe('exactTrianglePlan', () => {
  it('5-5-6 with a median from A, built shifted (anywhere works)', () => {
    const plan = exactTrianglePlan(LATTICE.iso566, { median: 'A' });
    const sh = (p: Vec3): Vec3 => [p[0] - 2, 0, p[2] + 1];
    let c = ok(addPoint(emptyConstruction(), sh([0, 0, 0])));
    c = ok(addSegment(c, sh([0, 0, 0]), sh([6, 0, 0])));
    expect(currentStepIndex(plan, c)).toBe(2);
    c = ok(addFaceAt(c, [sh([3, 0, -4]), sh([0, 0, 0]), sh([6, 0, 0])], 'triangle'));
    expect(currentStepIndex(plan, c)).toBe(3);
    expect(plan.steps[3]!.guide!(c)!.points).toEqual([sh([3, 0, 0])]);
    c = ok(addSegment(c, sh([3, 0, -4]), sh([3, 0, 0])));
    expect(plan.check(c).ok).toBe(true);
  });
  it('wrong apex is reported with both sets of sides', () => {
    const plan = exactTrianglePlan(LATTICE.iso566);
    let c = ok(addSegment(emptyConstruction(), [0, 0, 0], [6, 0, 0]));
    c = ok(addFaceAt(c, [[3, 0, -3], [0, 0, 0], [6, 0, 0]], 'triangle'));
    expect(plan.steps[2]!.evaluate(c).issues[0]!.code).toBe('triangle-sides-mismatch');
  });
  it('altitude and extension', () => {
    const plan = exactTrianglePlan(LATTICE.scaleneAcute, { altitude: true, extend: 3 });
    let c = ok(addFaceAt(emptyConstruction(), [...LATTICE.scaleneAcute], 'triangle'));
    c = ok(addSegment(c, [2, 0, -4], [2, 0, 0]));
    expect(currentStepIndex(plan, c)).toBe(4);
    c = ok(addSegment(c, [6, 0, 0], [8, 0, 0])); // any length beyond C counts
    expect(plan.check(c).ok).toBe(true);
  });
});

describe('anyTrianglePlan', () => {
  it('accepts any obtuse triangle and explains a wrong type', () => {
    const plan = anyTrianglePlan({ byAngles: 'obtuse', example: LATTICE.scaleneObtuse });
    const acute = ok(addFaceAt(emptyConstruction(), [...LATTICE.iso566], 'triangle'));
    expect(plan.check(acute).ok).toBe(false);
    expect(plan.check(acute).issues[0]).toMatchObject({ code: 'triangle-type-mismatch', values: { actualType: 'acute', expectedType: 'obtuse' } });
    const obtuse = ok(addFaceAt(emptyConstruction(), [[-3, 0, -2], [0, 0, 0], [5, 0, 0]] as Vec3[], 'triangle'));
    expect(plan.check(obtuse).ok).toBe(true);
  });
});

describe('congruentCopyPlan', () => {
  it('starts with ABC and accepts a translated copy', () => {
    const plan = congruentCopyPlan(LATTICE.right345, [0, 0, 5]);
    expect(Object.keys(plan.initial!.faces)).toHaveLength(1);
    expect(plan.check(plan.initial!).ok).toBe(false);
    const c = ok(addFaceAt(plan.initial!, LATTICE.right345.map((p) => [p[0], 0, p[2] + 5] as Vec3), 'triangle'));
    expect(plan.check(c).ok).toBe(true);
  });
});
