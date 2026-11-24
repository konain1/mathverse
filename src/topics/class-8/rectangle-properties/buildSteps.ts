import { quadPlan } from '@/features/guided/flatRecipes';
import type { BuildPlan, Params } from '@/topics/contract';

const DIAGONALS: Record<string, 0 | 1 | 2> = { 'opposite-sides': 0, 'diagonals-equal': 2, 'triangle-angles': 1, 'perimeter-diagonal': 1 };
export const buildPlan = (id: string, p: Params): BuildPlan => quadPlan({ l: p.l!, b: p.b!, diagonals: DIAGONALS[id] ?? 0 });
