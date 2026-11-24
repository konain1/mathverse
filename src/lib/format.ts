import { simplifySqrt } from './geometry/formulas';
import { roundTo } from './geometry/vector';

/**
 * Exact text for √n in simplest form: 50 → "5√2", 49 → "7", 2 → "√2".
 * Used for lengths on the grid, whose squares are always whole numbers.
 */
export function surd(n: number): { text: string; tex: string; exact: boolean } {
  const { outside, inside } = simplifySqrt(Math.round(n));
  if (inside === 1) return { text: String(outside), tex: String(outside), exact: true };
  const o = outside === 1 ? '' : String(outside);
  return { text: `${o}√${inside}`, tex: `${o}\\sqrt{${inside}}`, exact: false };
}

/** "4 cm", "5√2 cm" for a length whose square is a whole number, else "5.66 cm". */
export function lengthText(len: number, unit = 'cm'): string {
  const sq = len * len;
  if (Math.abs(sq - Math.round(sq)) < 1e-6) return `${surd(sq).text} ${unit}`;
  return `${roundTo(len, 2)} ${unit}`;
}

/** Number for display: whole numbers stay whole, others get up to 2 decimals. */
export const fmt = (x: number) => String(roundTo(x, 2));
