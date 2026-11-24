/** Pure animation state for the volume scene: a function of (cue, t, question) only. */
import { easeInOut } from '@/features/solve/timeline';
import type { Params } from '@/topics/contract';

export interface Fill {
  origin: [number, number, number];
  n: number;
  size: number;
  count: number;
  octants?: boolean;
}
export interface Frame {
  origin: [number, number, number];
  side: number;
  opacity: number;
}
export interface VState {
  frames: Frame[];
  fills: Fill[];
  /** cubes counted in the main fill (drives the counter) */
  counted: number;
  /** completed layers of the main fill */
  layers: number;
  n: number;
  showEdges: boolean;
}

/** Cube side in cm, cube size in cm, cubes per edge. */
export function volumeGeometry(questionId: string, p: Params) {
  if (questionId === 'small-cubes') return { A: p.s! * p.k!, size: p.s!, n: p.k! };
  return { A: p.a!, size: 1, n: p.a! };
}

/** Where the doubled cube sits: behind and to the right of the original, so neither hides the other. */
export const bigOrigin = (a: number): [number, number, number] => [0, 0, -(2 * a + 2)];

export function vState(cue: string, t: number, questionId: string, p: Params): VState {
  const { A, size, n } = volumeGeometry(questionId, p);
  const e = easeInOut(t);
  const main = (count: number): VState => ({
    frames: [{ origin: [0, 0, 0], side: A, opacity: 1 }],
    fills: [{ origin: [0, 0, 0], n, size, count }],
    counted: Math.floor(count + 1e-9),
    layers: Math.floor(count / (n * n) + 1e-9),
    n,
    showEdges: false,
  });

  if (questionId === 'double-side') {
    const a = p.a!;
    const m = 2 * a;
    const small: Fill = { origin: [0, 0, 0], n: a, size: 1, count: a ** 3 };
    const smallFrame: Frame = { origin: [0, 0, 0], side: a, opacity: 1 };
    const big = (count: number, octants = false): Fill => ({ origin: bigOrigin(a), n: m, size: 1, count, octants });
    switch (cue) {
      case 'small':
        return { frames: [smallFrame], fills: [{ ...small, count: Math.min(1, t * 1.6) * a ** 3 }], counted: Math.floor(Math.min(1, t * 1.6) * a ** 3), layers: 0, n: a, showEdges: true };
      case 'big-frame':
        return { frames: [smallFrame, { origin: bigOrigin(a), side: m, opacity: e }], fills: [small], counted: a ** 3, layers: 0, n: a, showEdges: false };
      case 'big-fill': {
        const c = e * m ** 3;
        return { frames: [smallFrame, { origin: bigOrigin(a), side: m, opacity: 1 }], fills: [small, big(c)], counted: Math.floor(c + 1e-9), layers: Math.floor(c / (m * m) + 1e-9), n: m, showEdges: false };
      }
      case 'octants':
        return { frames: [smallFrame, { origin: bigOrigin(a), side: m, opacity: 1 }], fills: [small, big(m ** 3, t > 0.15)], counted: m ** 3, layers: m, n: m, showEdges: false };
      default:
        return { frames: [smallFrame], fills: [], counted: 0, layers: 0, n: a, showEdges: true };
    }
  }

  switch (cue) {
    case 'intro':
      return { ...main(0), showEdges: true };
    case 'base-row':
      return main(e * n);
    case 'base-layer':
      return main(n + e * (n * n - n));
    case 'layers':
      return main(n * n + e * (n ** 3 - n * n));
    case 'formula':
    default:
      return main(n ** 3);
  }
}
