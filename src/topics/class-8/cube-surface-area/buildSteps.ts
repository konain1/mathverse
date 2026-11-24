import { cubePlan } from '@/features/guided/recipes';
import { cubeTSA, squareSideFromArea } from '@/lib/geometry/formulas';
import type { BuildPlan, Params } from '@/topics/contract';

/** Every question here is about one cube; the student builds it with side a. */
export function buildPlan(questionId: string, p: Params): BuildPlan {
  // For "side from TSA" the side is derived (that's the point of the question), never typed in.
  const a = questionId === 'side-from-tsa' ? squareSideFromArea(cubeTSA(p.a!) / 6) : p.a!;
  return cubePlan(a);
}
