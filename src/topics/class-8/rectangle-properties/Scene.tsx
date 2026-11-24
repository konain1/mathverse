import type { Params, SceneProps } from '@/topics/contract';
import { FlatOverlay, FlatScene, flatHome, pythagPoints } from '@/topics/shared/flat/FlatScene';
import { axisQuad, type FlatConfig } from '@/topics/shared/flat/flatState';

const cfg = (p: Params): FlatConfig => ({ corners: axisQuad(p.l!, p.b!), kind: 'rectangle', tiles: { nx: p.l!, nz: p.b!, size: 1, origin: [0, 0, 0] } });

export default function Scene(props: SceneProps) {
  const { l, b } = props.params as { l: number; b: number };
  return <FlatScene {...props} cfg={cfg(props.params)} family="rectangle" labels={{ squares: [`${l * l} cm²`, `${b * b} cm²`, `${l * l + b * b} cm²`] }} />;
}
export function Overlay(props: SceneProps) {
  return <FlatOverlay {...props} cfg={cfg(props.params)} />;
}
export const home = (p: Params, id: string) =>
  id === 'perimeter-diagonal' ? flatHome(pythagPoints(cfg(p).corners), 1.05) : flatHome(cfg(p).corners, 1.3);
