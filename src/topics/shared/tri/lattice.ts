/**
 * Triangles whose corners sit on the 1 cm grid (so students can build them exactly).
 * Convention: B at the origin, C on +x, apex A towards −z (it appears "up" on screen).
 */
import type { Vec3 } from '@/lib/geometry/vector';
import { distance } from '@/lib/geometry/vector';

/** A, B, C */
export type Tri = [Vec3, Vec3, Vec3];

export const triFromBase = (a: number, x: number, h: number): Tri => [
  [x, 0, -h],
  [0, 0, 0],
  [a, 0, 0],
];

/** Side lengths: a = BC (opposite A), b = CA (opposite B), c = AB (opposite C). */
export function sidesOf([A, B, C]: Tri): [number, number, number] {
  return [distance(B, C), distance(C, A), distance(A, B)];
}

export const LATTICE = {
  iso566: triFromBase(6, 3, 4), // 5, 5, 6 (acute isosceles)
  iso558: triFromBase(8, 4, 3), // 5, 5, 8 (obtuse isosceles)
  right345: [[0, 0, -4], [0, 0, 0], [3, 0, 0]] as Tri, // right angle at B: 3, 4, 5
  right6810: [[0, 0, -6], [0, 0, 0], [8, 0, 0]] as Tri, // right angle at B: 6, 8, 10
  rightIso: triFromBase(6, 3, 3), // 45°, 45°, 90° at A: 3√2, 3√2, 6
  scaleneAcute: triFromBase(6, 2, 4), // √20, √32, 6
  scaleneObtuse: triFromBase(6, -2, 3), // √13, √73, 6 (obtuse at B)
} satisfies Record<string, Tri>;
export type LatticeKey = keyof typeof LATTICE;
export const LATTICE_KEYS = Object.keys(LATTICE) as LatticeKey[];

/** Triangle with the given base angles (degrees) on a base of `base` cm, for scenes (not built on the grid). */
export function triFromAngles(B: number, C: number, base = 6): Tri {
  const rb = (B * Math.PI) / 180;
  const rc = (C * Math.PI) / 180;
  const ab = (base * Math.sin(rc)) / Math.sin(rb + rc);
  return [[ab * Math.cos(rb), 0, -ab * Math.sin(rb)], [0, 0, 0], [base, 0, 0]];
}
