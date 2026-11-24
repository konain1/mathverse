import { quadPlan } from '@/features/guided/flatRecipes';
import type { BuildPlan, Params } from '@/topics/contract';

export const buildPlan = (_id: string, p: Params): BuildPlan => quadPlan({ l: p.a!, b: p.a! });
