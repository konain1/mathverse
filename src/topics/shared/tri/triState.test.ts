import { describe, expect, it } from 'vitest';
import { exteriorTargets, interiorWedge, proofConfigs, proofTriPoints, tearTargets, triState, wedgesOf } from './triState';
import { LATTICE, triFromAngles } from './lattice';
import { distance } from '@/lib/geometry/vector';

const deg = (r: number) => (r * 180) / Math.PI;

describe('triangle scene state', () => {
  const tri = triFromAngles(50, 60);

  it('interior wedges are the triangle angles', () => {
    const w = wedgesOf(tri);
    expect(deg(w.B.sweep)).toBeCloseTo(50, 6);
    expect(deg(w.C.sweep)).toBeCloseTo(60, 6);
    expect(deg(w.A.sweep)).toBeCloseTo(70, 6);
    expect(deg(interiorWedge([0, 0, 0], [1, 0, 0], [0, 0, -1]).sweep)).toBeCloseTo(90, 9);
  });

  it('torn corners line up into exactly 180°', () => {
    const tg = tearTargets(tri);
    expect(deg(tg.C.start + tg.C.sweep)).toBeCloseTo(180, 6);
    expect(triState('line-up', 1, { tri }).counter).toEqual({ kind: 'angle', value: 180 });
  });

  it('A and B fill the exterior angle at C exactly', () => {
    const ex = exteriorTargets(tri);
    expect(deg(ex.exterior.sweep)).toBeCloseTo(120, 6);
    expect(ex.A.start + ex.A.sweep).toBeCloseTo(ex.exterior.start + ex.exterior.sweep, 9);
    expect(triState('fill-exterior', 1, { tri }).counter?.value).toBeCloseTo(120, 6);
  });

  it('Pythagoras rearrangement: both layouts are made of the same right triangles inside the (a+b) square', () => {
    const a = 3;
    const b = 4;
    const { s, one, two } = proofConfigs(a, b);
    for (const layout of [one, two])
      for (const p of layout) {
        const pts = proofTriPoints(p, a, b, [0, 0, 0]);
        const sides = [distance(pts[0]!, pts[1]!), distance(pts[0]!, pts[2]!), distance(pts[1]!, pts[2]!)].sort();
        expect(sides).toEqual([3, 4, 5]);
        for (const q of pts) {
          expect(q[0]).toBeGreaterThanOrEqual(-1e-9);
          expect(q[0]).toBeLessThanOrEqual(s + 1e-9);
          expect(-q[2]).toBeGreaterThanOrEqual(-1e-9);
          expect(-q[2]).toBeLessThanOrEqual(s + 1e-9);
        }
      }
    // layout 2 only translates each triangle (same quarter turns)
    expect(two.map((p) => p.k)).toEqual(one.map((p) => p.k));
  });

  it('perimeter walk and semi-perimeter', () => {
    expect(triState('perimeter', 1, { tri: LATTICE.iso566 }).counter?.value).toBeCloseTo(16, 9);
    expect(triState('semi', 1, { tri: LATTICE.iso566 }).counter?.value).toBeCloseTo(8, 9);
  });

  it('inequality range sweeps from |a − b| towards a + b', () => {
    const r = { tri, range: { a: 5, b: 8 } };
    expect(triState('range', 0, r).counter!.value).toBeGreaterThan(3);
    expect(triState('range', 0, r).counter!.value).toBeLessThan(3.5);
    expect(triState('range', 1, r).counter!.value).toBeLessThan(13);
    expect(triState('range', 1, r).counter!.value).toBeGreaterThan(12.9);
  });
});
