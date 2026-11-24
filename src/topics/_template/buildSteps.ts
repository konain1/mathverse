import { cubePlan } from '@/features/guided/recipes';
import type { BuildPlan, Params } from '@/topics/contract';

/**
 * Reuse a recipe from src/features/guided/recipes.ts when one fits, or write
 * your own GuidedStep[] (instruction + tool + guide + evaluate) for new figures.
 */
export function buildPlan(_questionId: string, p: Params): BuildPlan {
  return cubePlan(p.a!);
}
