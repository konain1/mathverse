import type { TriangleByAngles, TriangleBySides } from '@/lib/geometry/formulas';
import { tx } from '@/topics/contract';
import type { LocalizedText } from '@/topics/types';
import type { Tri } from './lattice';
import { sidesOf } from './lattice';

export const SIDE_KINDS: TriangleBySides[] = ['equilateral', 'isosceles', 'scalene'];
export const ANGLE_KINDS: TriangleByAngles[] = ['acute', 'right', 'obtuse'];

export const SIDE_OPTIONS: LocalizedText[] = [
  tx('Equilateral', 'Equilateral', 'समबाहु'),
  tx('Isosceles', 'Isosceles', 'समद्विबाहु'),
  tx('Scalene', 'Scalene', 'विषमबाहु'),
];
export const ANGLE_OPTIONS: LocalizedText[] = [
  tx('Acute', 'Acute', 'न्यूनकोण'),
  tx('Right', 'Right', 'समकोण'),
  tx('Obtuse', 'Obtuse', 'अधिककोण'),
];
export const YES_NO: LocalizedText[] = [tx('Haan', 'Yes', 'हाँ'), tx('Nahi', 'No', 'नहीं')];
export const RULES = ['SSS', 'SAS', 'ASA', 'RHS'] as const;
export const RULE_OPTIONS: LocalizedText[] = RULES.map((r) => tx(r, r, r));

/** Tick marks for equal sides (BC, CA, AB): equal sides share a count, unequal sides get none. */
export function ticksFor(tri: Tri): [number, number, number] {
  const [a, b, c] = sidesOf(tri);
  const eq = (x: number, y: number) => Math.abs(x - y) < 1e-6;
  if (eq(a, b) && eq(b, c)) return [1, 1, 1];
  if (eq(a, b)) return [1, 1, 0];
  if (eq(b, c)) return [0, 1, 1];
  if (eq(a, c)) return [1, 0, 1];
  return [0, 0, 0];
}
