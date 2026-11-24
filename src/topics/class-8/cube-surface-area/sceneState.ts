/** Pure animation state for the surface-area scene: a function of (cue, t) only, so scrubbing works. */
import { easeInOut } from '@/features/solve/timeline';
import type { CuboidFace } from '@/three/blocks/NetUnfolder';

export const ORDER6: CuboidFace[] = ['front', 'right', 'top', 'back', 'left', 'bottom'];
export const WALLS: CuboidFace[] = ['front', 'right', 'back', 'left'];
export const FIVE: CuboidFace[] = ['front', 'right', 'back', 'left', 'bottom'];

export interface SAState {
  lit: CuboidFace[];
  /** second colour (top & bottom when explaining LSA vs TSA) */
  secondary: CuboidFace[];
  grid: CuboidFace[];
  unfold: number;
  hideTop: boolean;
  /** 0–1: the lid lifting away (open box) */
  lidLift: number;
  /** faces counted so far (drives the area counter) */
  counted: number;
  showEdges: boolean;
}

const count = (t: number, n: number) => Math.max(1, Math.min(n, Math.floor(t * n) + 1));

export function saState(cue: string, t: number, questionId: string): SAState {
  const openBox = questionId === 'open-box' && cue !== 'intro';
  const base: SAState = {
    lit: [],
    secondary: [],
    grid: [],
    unfold: 0,
    hideTop: openBox && cue !== 'lid-off',
    lidLift: 0,
    counted: 0,
    showEdges: false,
  };
  switch (cue) {
    case 'intro':
      return { ...base, showEdges: true };
    case 'one-face':
      return { ...base, lit: ['front'], grid: ['front'], counted: 1, showEdges: true };
    case 'count-faces': {
      const n = count(t, 6);
      return { ...base, lit: ORDER6.slice(0, n), counted: n };
    }
    case 'formula':
    case 'all-faces':
      return { ...base, lit: [...ORDER6], counted: 6 };
    case 'walls': {
      const n = count(t, 4);
      return { ...base, lit: WALLS.slice(0, n), counted: n };
    }
    case 'lids': {
      const n = count(t, 2);
      const extra = (['top', 'bottom'] as CuboidFace[]).slice(0, n);
      return { ...base, lit: [...WALLS], secondary: extra, counted: 4 + n };
    }
    case 'unfold':
      return { ...base, lit: [...ORDER6], unfold: easeInOut(t), counted: 6, grid: [...ORDER6] };
    case 'lid-off':
      return { ...base, hideTop: true, lidLift: easeInOut(t), counted: 0 };
    case 'count-five': {
      const n = count(t, 5);
      return { ...base, hideTop: true, lit: FIVE.slice(0, n), counted: n };
    }
    case 'unfold-open':
      return { ...base, hideTop: true, lit: [...FIVE], unfold: easeInOut(t), counted: 5, grid: [...FIVE] };
    default:
      return base;
  }
}
