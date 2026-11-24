import { anyTrianglePlan } from '@/features/guided/triRecipes';
import type { BuildPlan } from '@/topics/contract';
import { LATTICE } from '@/topics/shared/tri/lattice';

/** Angle questions can't be built exactly on a 1 cm grid, so the student builds a triangle of the right kind. */
export function buildPlan(id: string): BuildPlan {
  if (id === 'right-triangle') return anyTrianglePlan({ byAngles: 'right', example: LATTICE.right345 });
  if (id === 'isosceles-base') return anyTrianglePlan({ bySides: 'isosceles', example: LATTICE.iso566 });
  return anyTrianglePlan({ example: LATTICE.scaleneAcute });
}
