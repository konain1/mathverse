import { quadPlan } from '@/features/guided/flatRecipes';
import { intSqrt, smallestMultiplierForSquare } from '@/lib/geometry/formulas';
import type { BuildPlan, Params } from '@/topics/contract';

/** The student builds the n × n square grid the question is about. */
export function sideOf(id: string, p: Params): number {
  if (id === 'smallest-multiplier') {
    const N = p.k! * p.m! * p.m!;
    return intSqrt(N * smallestMultiplierForSquare(N));
  }
  return p.n!;
}

export const buildPlan = (id: string, p: Params): BuildPlan => {
  const n = sideOf(id, p);
  return quadPlan({ l: n, b: n });
};
