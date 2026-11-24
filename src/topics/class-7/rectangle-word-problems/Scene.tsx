import type { Params, SceneProps } from '@/topics/contract';
import { FlatOverlay, FlatScene, flatHome } from '@/topics/shared/flat/FlatScene';
import { axisQuad, type FlatConfig } from '@/topics/shared/flat/flatState';

function cfg(p: Params, id: string): FlatConfig {
  switch (id) {
    case 'frame': {
      const { l, b, w } = p as { l: number; b: number; w: number };
      const inner = axisQuad(l, b, w, w);
      return { corners: inner, kind: 'rectangle', ring: { outer: axisQuad(l + 2 * w, b + 2 * w), inner } };
    }
    case 'inner-path': {
      const { L, B, w } = p as { L: number; B: number; w: number };
      const outer = axisQuad(L, B);
      return { corners: outer, kind: 'rectangle', ring: { outer, inner: axisQuad(L - 2 * w, B - 2 * w, w, w) } };
    }
    case 'tiles': {
      const { t, i, j } = p as { t: number; i: number; j: number };
      return { corners: axisQuad(t * i, t * j), kind: 'rectangle', tiles: { nx: i, nz: j, size: t, origin: [0, 0, 0] } };
    }
    default:
      return { corners: axisQuad(p.l!, p.b!), kind: 'rectangle' };
  }
}

export default function Scene(props: SceneProps) {
  return <FlatScene {...props} cfg={cfg(props.params, props.questionId)} family="rectangle" />;
}
export function Overlay(props: SceneProps) {
  return <FlatOverlay {...props} cfg={cfg(props.params, props.questionId)} />;
}
export const home = (p: Params, id: string) => {
  const c = cfg(p, id);
  return flatHome(c.ring?.outer ?? c.corners, 1.4);
};
