import { exactTrianglePlan } from '@/features/guided/triRecipes';
import type { BuildPlan, Params } from '@/topics/contract';
import { triOf } from './questions';

export function buildPlan(id: string, p: Params): BuildPlan {
  const tri = triOf(id, p);
  if (id === 'altitude-from-area') return exactTrianglePlan(tri, { altitude: true });
  if (id === 'counts') return exactTrianglePlan(tri, { median: 'all' });
  return exactTrianglePlan(tri, { median: 'A' });
}
