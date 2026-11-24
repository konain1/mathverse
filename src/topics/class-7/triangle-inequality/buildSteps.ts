import { exactTrianglePlan } from '@/features/guided/triRecipes';
import type { BuildPlan, Params } from '@/topics/contract';
import { sidesForBuild } from './questions';

/** Build a triangle from the two given sides (joined at 90°, which always closes). */
export function buildPlan(id: string, p: Params): BuildPlan {
  const [a, b] = sidesForBuild(id, p);
  return exactTrianglePlan([[0, 0, -b], [0, 0, 0], [a, 0, 0]]);
}
