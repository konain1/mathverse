import type { Params, SceneProps } from '@/topics/contract';
import { FlatOverlay, FlatScene, flatHome } from '@/topics/shared/flat/FlatScene';
import { axisQuad, type FlatConfig } from '@/topics/shared/flat/flatState';
import { sideOf } from './buildSteps';

const cfg = (p: Params, id: string): FlatConfig => {
  const n = sideOf(id, p);
  return {
    corners: axisQuad(n, n),
    kind: 'square',
    tiles: { nx: n, nz: n, size: 1, origin: [0, 0, 0] },
    extra: id === 'not-perfect' ? p.e : undefined,
  };
};

export default function Scene(props: SceneProps) {
  return <FlatScene {...props} cfg={cfg(props.params, props.questionId)} family="square" />;
}
export function Overlay(props: SceneProps) {
  return <FlatOverlay {...props} cfg={cfg(props.params, props.questionId)} />;
}
export const home = (p: Params, id: string) => flatHome(cfg(p, id).corners, id === 'not-perfect' ? 1.6 : 1.3);
