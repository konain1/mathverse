import { exactTrianglePlan } from '@/features/guided/triRecipes';
import type { BuildPlan, Params } from '@/topics/contract';
import { triOf } from './questions';

export const buildPlan = (id: string, p: Params): BuildPlan =>
  exactTrianglePlan(triOf(id, p), { altitude: id === 'area' || id === 'height-from-area' });
