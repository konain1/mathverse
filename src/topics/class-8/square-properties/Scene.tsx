import type { Params, SceneProps } from '@/topics/contract';
import { FlatOverlay, FlatScene, flatHome } from '@/topics/shared/flat/FlatScene';
import { axisQuad, diamondQuad, type FlatConfig } from '@/topics/shared/flat/flatState';

const cfg = (p: Params, id: string): FlatConfig =>
  id === 'diagonals-bisect' ? { corners: diamondQuad(p.k!), kind: 'square' } : { corners: axisQuad(p.a!, p.a!), kind: 'square' };

export default function Scene(props: SceneProps) {
  return <FlatScene {...props} cfg={cfg(props.params, props.questionId)} family="square" />;
}
export function Overlay(props: SceneProps) {
  return <FlatOverlay {...props} cfg={cfg(props.params, props.questionId)} />;
}
export const home = (p: Params, id: string) => flatHome(cfg(p, id).corners, 1.5);
