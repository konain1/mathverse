import type { Params, SceneProps } from '@/topics/contract';
import { triFromAngles } from '@/topics/shared/tri/lattice';
import { TriOverlay, TriScene, triHome } from '@/topics/shared/tri/TriScene';
import type { TriConfig } from '@/topics/shared/tri/triState';
import { anglesOf } from './solutionSteps';

const cfg = (p: Params, id: string): TriConfig => {
  const [, B, C] = anglesOf(id, p);
  return { tri: triFromAngles(B, C, 6), extend: 4 };
};

export default function Scene(props: SceneProps) {
  return <TriScene {...props} cfg={cfg(props.params, props.questionId)} />;
}
export function Overlay(props: SceneProps) {
  return <TriOverlay {...props} cfg={cfg(props.params, props.questionId)} />;
}
export const home = (p: Params, id: string) => {
  const c = cfg(p, id);
  return triHome([...c.tri, [11, 0, 0], [8, 0, -3]]);
};
