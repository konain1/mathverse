import type { Params, SceneProps } from '@/topics/contract';
import { FlatOverlay, FlatScene, flatHome } from '@/topics/shared/flat/FlatScene';
import { axisQuad, type FlatConfig } from '@/topics/shared/flat/flatState';
import { dims } from './buildSteps';

const cfg = (p: Params, id: string): FlatConfig => {
  const { l, b } = dims(id, p);
  return { corners: axisQuad(l, b), kind: 'rectangle', tiles: { nx: l, nz: b, size: 1, origin: [0, 0, 0] } };
};

export default function Scene(props: SceneProps) {
  return <FlatScene {...props} cfg={cfg(props.params, props.questionId)} family="rectangle" />;
}
export function Overlay(props: SceneProps) {
  return <FlatOverlay {...props} cfg={cfg(props.params, props.questionId)} />;
}
export const home = (p: Params, id: string) => flatHome(cfg(p, id).corners);
