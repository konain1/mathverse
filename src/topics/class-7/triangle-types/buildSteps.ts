import { anyTrianglePlan, exactTrianglePlan } from '@/features/guided/triRecipes';
import { isoscelesBaseAngle } from '@/lib/geometry/formulas';
import type { BuildPlan, Params } from '@/topics/contract';
import { LATTICE } from '@/topics/shared/tri/lattice';
import { ANGLE_SETS, kindFromAngles, latticeTri } from './questions';

const EXAMPLE = { acute: LATTICE.iso566, right: LATTICE.rightIso, obtuse: LATTICE.iso558 } as const;

export function buildPlan(id: string, p: Params): BuildPlan {
  if (id === 'by-angles') {
    const kind = kindFromAngles(ANGLE_SETS[p.j!]!);
    return anyTrianglePlan({ byAngles: kind, example: EXAMPLE[kind] });
  }
  if (id === 'isosceles-apex') {
    const b = isoscelesBaseAngle(p.a!);
    const kind = kindFromAngles([p.a!, b, b]);
    return anyTrianglePlan({ bySides: 'isosceles', byAngles: kind, example: EXAMPLE[kind] });
  }
  return exactTrianglePlan(latticeTri(p.i!));
}
