import { exactTrianglePlan } from '@/features/guided/triRecipes';
import type { BuildPlan, Params } from '@/topics/contract';
import { LATTICE } from '@/topics/shared/tri/lattice';
import { HERON_TRIS } from './questions';

export const buildPlan = (id: string, p: Params): BuildPlan =>
  exactTrianglePlan(LATTICE[HERON_TRIS[p.i!]!], { altitude: id === 'check-height' });
