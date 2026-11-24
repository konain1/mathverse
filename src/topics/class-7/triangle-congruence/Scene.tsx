import type { Params, SceneProps } from '@/topics/contract';
import { TriOverlay, TriScene, triHome } from '@/topics/shared/tri/TriScene';
import type { TriConfig } from '@/topics/shared/tri/triState';
import { ruleOf, triOf } from './questions';

const LOOK = {
  SSS: { rotate: Math.PI, mirror: false, ticks: [1, 2, 3], angles: undefined },
  SAS: { rotate: Math.PI / 2, mirror: false, ticks: [1, 0, 2], angles: ['', '90°', ''] },
  ASA: { rotate: 0, mirror: true, ticks: [1, 0, 0], angles: ['', '45°', '45°'] },
  RHS: { rotate: Math.PI / 2, mirror: true, ticks: [1, 2, 0], angles: ['', '90°', ''] },
} as const;

function cfg(p: Params, id: string): TriConfig {
  const tri = triOf(id, p);
  const rule = ruleOf(id);
  const look = LOOK[rule];
  const w = Math.max(...tri.map((v) => v[0])) - Math.min(...tri.map((v) => v[0]));
  return {
    tri,
    ticks: [...look.ticks] as [number, number, number],
    angleLabels: look.angles ? ([...look.angles] as [string, string, string]) : undefined,
    copy: { offset: [w + 4, 0, 2], rotate: look.rotate, mirror: look.mirror, rule },
  };
}

export default function Scene(props: SceneProps) {
  return <TriScene {...props} cfg={cfg(props.params, props.questionId)} />;
}
export function Overlay(props: SceneProps) {
  return <TriOverlay {...props} cfg={cfg(props.params, props.questionId)} />;
}
export const home = (p: Params, id: string) => {
  const c = cfg(p, id);
  const off = c.copy!.offset;
  const r = Math.max(...c.tri.map((v) => Math.hypot(v[0], v[2])));
  return triHome([...c.tri, [off[0] + r, 0, off[2] + r], [off[0] + r, 0, off[2] - r]], 1.1);
};
