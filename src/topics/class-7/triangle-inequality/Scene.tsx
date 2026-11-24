import type { Params, SceneProps } from '@/topics/contract';
import { TriOverlay, TriScene, triHome } from '@/topics/shared/tri/TriScene';
import type { TriConfig } from '@/topics/shared/tri/triState';
import { TRIPLES } from './questions';
import { isValidTriangle } from '@/lib/geometry/formulas';

function cfg(p: Params, id: string): TriConfig {
  if (id === 'can-form') {
    const [a, b, c] = [...TRIPLES[p.t!]!].sort((x, y) => x - y) as [number, number, number];
    // if the asked sticks do close, still show a failing pair to explain the rule
    const rods = isValidTriangle(a, b, c) ? { c: a + b + 1, a, b } : { c, a, b };
    return { tri: [[0, 0, -b], [0, 0, 0], [a, 0, 0]], rods };
  }
  return { tri: [[0, 0, -p.b!], [0, 0, 0], [p.a!, 0, 0]], range: { a: p.a!, b: p.b! } };
}

export default function Scene(props: SceneProps) {
  return <TriScene {...props} cfg={cfg(props.params, props.questionId)} />;
}
export function Overlay(props: SceneProps) {
  return <TriOverlay {...props} cfg={cfg(props.params, props.questionId)} />;
}
export const home = (p: Params, id: string) => {
  const c = cfg(p, id);
  const span = c.rods ? c.rods.c : p.a! + p.b!;
  return triHome([[-(c.range?.b ?? 0), 0, 0], [span, 0, 0], [span / 2, 0, -Math.max(c.rods?.a ?? 0, c.range?.b ?? 0)]], 1.15);
};
