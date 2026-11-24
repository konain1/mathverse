import { exactTrianglePlan } from '@/features/guided/triRecipes';
import type { BuildPlan, Params } from '@/topics/contract';
import { LATTICE } from '@/topics/shared/tri/lattice';
import { CHECK_TRIS, legsOf, rightTri } from './questions';

export function buildPlan(id: string, p: Params): BuildPlan {
  const legs = legsOf(id, p);
  return exactTrianglePlan(legs ? rightTri(legs[0], legs[1]) : LATTICE[CHECK_TRIS[p.i!]!]);
}
