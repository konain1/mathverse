import type { Params, SceneProps } from '@/topics/contract';
import { LATTICE } from '@/topics/shared/tri/lattice';
import { TriOverlay, TriScene, triHome } from '@/topics/shared/tri/TriScene';
import type { TriConfig } from '@/topics/shared/tri/triState';
import { CHECK_TRIS, legsOf, rightTri } from './questions';

function cfg(p: Params, id: string): TriConfig {
  const legs = legsOf(id, p);
  if (!legs) return { tri: LATTICE[CHECK_TRIS[p.i!]!] };
  return { tri: rightTri(legs[0], legs[1]), pythag: { a: legs[0], b: legs[1] } };
}

export default function Scene(props: SceneProps) {
  return <TriScene {...props} cfg={cfg(props.params, props.questionId)} />;
}
export function Overlay(props: SceneProps) {
  return <TriOverlay {...props} cfg={cfg(props.params, props.questionId)} />;
}
export const home = (p: Params, id: string) => {
  const c = cfg(p, id);
  const [A, B, C] = c.tri;
  const s = (c.pythag?.a ?? 4) + (c.pythag?.b ?? 4);
  // frame the triangle, the squares on its sides, and the (a + b) proof square
  return triHome([A, B, C, [-Math.abs(A[2]), 0, 0], [C[0], 0, C[0]], [s, 0, -s], [C[0] - A[2], 0, A[2] - C[0]]], 1.05);
};
