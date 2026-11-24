import { nestedPlan, quadPlan } from '@/features/guided/flatRecipes';
import type { BuildPlan, Params } from '@/topics/contract';

export function outerSize(id: string, p: Params): number {
  if (id === 'frame') return Math.max(p.l! + 2 * p.w!, p.b! + 2 * p.w!);
  if (id === 'inner-path') return Math.max(p.L!, p.B!);
  if (id === 'tiles') return Math.max(p.t! * p.i!, p.t! * p.j!);
  return Math.max(p.l!, p.b!);
}

export function buildPlan(id: string, p: Params): BuildPlan {
  switch (id) {
    case 'frame':
      return nestedPlan({ L: p.l! + 2 * p.w!, B: p.b! + 2 * p.w!, w: p.w!, mode: 'outside' });
    case 'inner-path':
      return nestedPlan({ L: p.L!, B: p.B!, w: p.w!, mode: 'inside' });
    case 'tiles':
      return quadPlan({ l: p.t! * p.i!, b: p.t! * p.j! });
    default:
      return quadPlan({ l: p.l!, b: p.b! });
  }
}
