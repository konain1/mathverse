import { diamondPlan, quadPlan } from '@/features/guided/flatRecipes';
import type { BuildPlan, Params } from '@/topics/contract';

/** Diagonal questions with a whole-number diagonal are built "diagonals first" (a tilted square). */
export function buildPlan(id: string, p: Params): BuildPlan {
  if (id === 'area-from-diagonal' || id === 'diagonal-from-area') return diamondPlan(p.k!);
  return quadPlan({ l: p.a!, b: p.a!, diagonals: 1 });
}
