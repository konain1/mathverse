import type { Params, SceneProps } from '@/topics/contract';
import { TriOverlay, TriScene, triHome } from '@/topics/shared/tri/TriScene';
import type { TriConfig } from '@/topics/shared/tri/triState';
import { triOf } from './questions';

const cfg = (p: Params, id: string): TriConfig => ({ tri: triOf(id, p) });

export default function Scene(props: SceneProps) {
  return <TriScene {...props} cfg={cfg(props.params, props.questionId)} />;
}
export function Overlay(props: SceneProps) {
  return <TriOverlay {...props} cfg={cfg(props.params, props.questionId)} />;
}
export const home = (p: Params, id: string) => {
  const [A, B, C] = cfg(p, id).tri;
  // room for the rotated copy (parallelogram) to the right
  return triHome([A, B, C, [A[0] + C[0], 0, A[2]]], 1.3);
};
