import { exactTrianglePlan } from '@/features/guided/triRecipes';
import type { BuildPlan } from '@/topics/contract';
import { LATTICE } from '@/topics/shared/tri/lattice';

/** Build a triangle and extend BC beyond C (angles on a 1 cm grid can't match every question exactly). */
export const buildPlan = (): BuildPlan => exactTrianglePlan(LATTICE.scaleneAcute, { extend: 3 });
