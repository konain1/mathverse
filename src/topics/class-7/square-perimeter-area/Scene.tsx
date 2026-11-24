import type { Params, SceneProps } from '@/topics/contract';
import { FlatOverlay, FlatScene, flatHome } from '@/topics/shared/flat/FlatScene';
import { axisQuad, type FlatConfig } from '@/topics/shared/flat/flatState';

const cfg = (p: Params): FlatConfig => ({
  corners: axisQuad(p.a!, p.a!),
  kind: 'square',
  tiles: { nx: p.a!, nz: p.a!, size: 1, origin: [0, 0, 0] },
});

export default function Scene(props: SceneProps) {
  return <FlatScene {...props} cfg={cfg(props.params)} family="square" />;
}
export function Overlay(props: SceneProps) {
  return <FlatOverlay {...props} cfg={cfg(props.params)} />;
}
export const home = (p: Params) => flatHome(cfg(p).corners);
