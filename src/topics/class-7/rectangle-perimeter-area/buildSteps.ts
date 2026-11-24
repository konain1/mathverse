import { quadPlan } from '@/features/guided/flatRecipes';
import type { BuildPlan, Params } from '@/topics/contract';

export const dims = (id: string, p: Params) => (id === 'length-double' ? { l: 2 * p.b!, b: p.b! } : { l: p.l!, b: p.b! });
export const buildPlan = (id: string, p: Params): BuildPlan => quadPlan(dims(id, p));
