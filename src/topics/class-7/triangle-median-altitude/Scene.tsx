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
export const home = (p: Params, id: string) => triHome(cfg(p, id).tri, 1.5);
