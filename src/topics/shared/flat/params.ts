import { pick, randInt } from '@/lib/random';
import type { Rng } from '@/topics/contract';

/** A non-square rectangle l × b (l > b) that fits the 10 cm grid. */
export function randRect(rng: Rng, maxL = 10, minB = 2): { l: number; b: number } {
  const l = randInt(rng, minB + 1, maxL);
  return { l, b: randInt(rng, minB, l - 1) };
}

/** Rectangles whose diagonal is a whole number and that fit the grid (Pythagorean triples). */
export const TRIPLE_RECTS: readonly { l: number; b: number; d: number }[] = [
  { l: 4, b: 3, d: 5 },
  { l: 8, b: 6, d: 10 },
];
export const randTriple = (rng: Rng) => ({ ...pick(rng, TRIPLE_RECTS) });
