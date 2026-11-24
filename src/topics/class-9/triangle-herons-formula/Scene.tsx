import type { Params, SceneProps } from '@/topics/contract';
import { LATTICE } from '@/topics/shared/tri/lattice';
import { TriOverlay, TriScene, triHome } from '@/topics/shared/tri/TriScene';
import type { TriConfig } from '@/topics/shared/tri/triState';
import { ticksFor } from '@/topics/shared/tri/words';
import { HERON_TRIS } from './questions';

const cfg = (p: Params): TriConfig => {
  const tri = LATTICE[HERON_TRIS[p.i!]!];
  return { tri, ticks: ticksFor(tri) };
};

export default function Scene(props: SceneProps) {
  return <TriScene {...props} cfg={cfg(props.params)} />;
}
export function Overlay(props: SceneProps) {
  return <TriOverlay {...props} cfg={cfg(props.params)} />;
}
export const home = (p: Params) => triHome(cfg(p).tri, 1.5);
