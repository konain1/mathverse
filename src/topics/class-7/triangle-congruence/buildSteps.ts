import { congruentCopyPlan } from '@/features/guided/triRecipes';
import type { BuildPlan, Params } from '@/topics/contract';
import { triOf } from './questions';

/** ABC is on the grid; the student builds DEF just below it. */
export function buildPlan(id: string, p: Params): BuildPlan {
  const tri = triOf(id, p);
  const h = Math.max(...tri.map((v) => -v[2]));
  return congruentCopyPlan(tri, [0, 0, h + 2]);
}
