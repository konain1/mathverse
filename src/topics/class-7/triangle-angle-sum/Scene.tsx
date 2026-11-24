import type { Params, SceneProps } from '@/topics/contract';
import { triFromAngles } from '@/topics/shared/tri/lattice';
import { TriOverlay, TriScene, triHome } from '@/topics/shared/tri/TriScene';
import { tearTargets, type TriConfig } from '@/topics/shared/tri/triState';
import { anglesOf } from './solutionSteps';

function cfg(p: Params, id: string, cue = ''): TriConfig {
  const [A, B, C] = anglesOf(id, p);
  const tri = triFromAngles(B, C, 6);
  // the unknown angle(s) stay "?" until the last step
  const hidden = cue !== 'solved';
  const known = (k: 'A' | 'B' | 'C', v: number) => {
    const unknown = id === 'ratio' || (id === 'isosceles-base' ? k !== 'A' : k === 'A');
    return unknown && hidden ? '?' : `${Math.round(v * 10) / 10}°`;
  };
  return { tri, angleLabels: [known('A', A), known('B', B), known('C', C)] };
}

export default function Scene(props: SceneProps) {
  return <TriScene {...props} cfg={cfg(props.params, props.questionId, props.cue)} />;
}
export function Overlay(props: SceneProps) {
  return <TriOverlay {...props} cfg={cfg(props.params, props.questionId, props.cue)} />;
}
export const home = (p: Params, id: string) => {
  const c = cfg(p, id);
  const P = tearTargets(c.tri).P;
  return triHome([...c.tri, [P[0] - 2.6, 0, P[2] + 0.8], [P[0] + 2.6, 0, P[2]]]);
};
