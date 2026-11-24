import { diamondPlan, quadPlan } from '@/features/guided/flatRecipes';
import type { BuildPlan, Params } from '@/topics/contract';

export function buildPlan(id: string, p: Params): BuildPlan {
  if (id === 'diagonals-bisect') return diamondPlan(p.k!);
  return quadPlan({ l: p.a!, b: p.a!, diagonals: id === 'sides-angles' ? 0 : 2 });
}
