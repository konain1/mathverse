import { cubePlan } from '@/features/guided/recipes';
import type { BuildPlan, Params } from '@/topics/contract';

/** The cube the student builds: the big cube for "small cubes", otherwise the cube of side a. */
export function buildPlan(questionId: string, p: Params): BuildPlan {
  return cubePlan(questionId === 'small-cubes' ? p.s! * p.k! : p.a!);
}
