import { isoscelesBaseAngle } from '@/lib/geometry/formulas';
import type { Params, SceneProps } from '@/topics/contract';
import { triFromAngles } from '@/topics/shared/tri/lattice';
import { TriOverlay, TriScene, triHome } from '@/topics/shared/tri/TriScene';
import type { TriConfig } from '@/topics/shared/tri/triState';
import { ticksFor } from '@/topics/shared/tri/words';
import { ANGLE_SETS, latticeTri } from './questions';

function cfg(p: Params, id: string): TriConfig {
  if (id === 'by-angles') {
    const [, B, C] = ANGLE_SETS[p.j!]!;
    const tri = triFromAngles(B, C, 6);
    return { tri, ticks: ticksFor(tri) };
  }
  if (id === 'isosceles-apex') {
    const b = isoscelesBaseAngle(p.a!);
    const tri = triFromAngles(b, b, 6);
    return { tri, ticks: ticksFor(tri) };
  }
  const tri = latticeTri(p.i!);
  return { tri, ticks: ticksFor(tri) };
}

export default function Scene(props: SceneProps) {
  return <TriScene {...props} cfg={cfg(props.params, props.questionId)} />;
}
export function Overlay(props: SceneProps) {
  return <TriOverlay {...props} cfg={cfg(props.params, props.questionId)} />;
}
export const home = (p: Params, id: string) => triHome(cfg(p, id).tri, 1.5);
