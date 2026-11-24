/**
 * Pure animation state for flat figures (squares and rectangles): a function of
 * (cue, t, config) only, so the step player can scrub freely. FlatScene draws it.
 */
import { easeInOut } from '@/features/solve/timeline';
import { add, distance, midpoint, scale, sub, type Vec3 } from '@/lib/geometry/vector';

export type Quad = [Vec3, Vec3, Vec3, Vec3];

export interface FlatConfig {
  /** A, B, C, D in order around the figure */
  corners: Quad;
  kind: 'square' | 'rectangle';
  /** unit tiles covering the figure (axis-aligned figures only) */
  tiles?: { nx: number; nz: number; size: number; origin: Vec3 };
  /** leftover unit squares shown in a row below (non-perfect squares) */
  extra?: number;
  /** frame / path: the other rectangle (outer when corners is the photo, inner when corners is the lawn) */
  ring?: { outer: Quad; inner: Quad };
}

/** Every cue FlatScene understands (tests check solution scripts against this). */
export const FLAT_CUES = [
  'intro', 'sides', 'opposite', 'angles', 'perimeter', 'tile-row', 'tile-all', 'area', 'grid', 'grid-extra',
  'diagonal', 'right-triangle', 'pythag', 'split', 'flip', 'diagonals', 'four-triangles', 'diag-square',
  'frame', 'frame-subtract', 'final-area',
] as const;

export type CounterKind = 'length' | 'area' | 'squares' | 'tiles';

export interface FlatState {
  /** sides drawn brighter (0 = AB, 1 = BC, 2 = CD, 3 = DA); empty = all normal */
  sides: number[];
  ticks: boolean;
  /** right-angle markers at these corners (0 = A … 3 = D) */
  angles: number[];
  walk: number; // 0–1 of the perimeter walked
  tiles: number;
  extra: number;
  diagonal: number; // AC drawn 0–1
  diagonal2: number; // BD drawn 0–1
  centre: boolean;
  triangle: boolean;
  pythag: number;
  split: number;
  flip: number;
  four: number;
  diagSquare: number;
  ringFill: number; // strips method 0–1
  ringSubtract: number; // subtraction method 0–1
  lettersOn: boolean;
  counter?: { kind: CounterKind; value: number };
}

const base = (): FlatState => ({
  sides: [],
  ticks: false,
  angles: [],
  walk: 0,
  tiles: 0,
  extra: 0,
  diagonal: 0,
  diagonal2: 0,
  centre: false,
  triangle: false,
  pythag: 0,
  split: 0,
  flip: 0,
  four: 0,
  diagSquare: 0,
  ringFill: 0,
  ringSubtract: 0,
  lettersOn: true,
});

export function perimeterOf(q: Quad): number {
  return q.reduce((s, p, i) => s + distance(p, q[(i + 1) % 4]!), 0);
}

/** Where the walker is after travelling `s` along A→B→C→D→A, and the corners passed. */
export function walkPath(q: Quad, s: number): Vec3[] {
  const pts: Vec3[] = [q[0]];
  let left = s;
  for (let i = 0; i < 4; i++) {
    const a = q[i]!;
    const b = q[(i + 1) % 4]!;
    const len = distance(a, b);
    if (left >= len) {
      pts.push(b);
      left -= len;
    } else {
      pts.push(add(a, scale(sub(b, a), left / len)));
      break;
    }
  }
  return pts;
}

const area = (q: Quad) => distance(q[0], q[1]) * distance(q[1], q[2]);

/** Strip areas for the frame/path: top, bottom, left, right. */
export function ringStrips(outer: Quad, inner: Quad): number[] {
  const L = distance(outer[0], outer[1]);
  const B = distance(outer[1], outer[2]);
  const w = Math.abs(inner[0][0] - outer[0][0]);
  return [L * w, L * w, w * (B - 2 * w), w * (B - 2 * w)];
}

export function flatState(cue: string, t: number, cfg: FlatConfig): FlatState {
  const s = base();
  const e = easeInOut(t);
  const tl = cfg.tiles;
  const nTiles = tl ? tl.nx * tl.nz : 0;
  const tileArea = tl ? tl.size * tl.size : 1;
  switch (cue) {
    case 'intro':
      return s;
    case 'sides':
      return { ...s, sides: [0, 1, 2, 3].slice(0, Math.min(4, Math.floor(t * 4) + 1)), ticks: true };
    case 'opposite':
      return { ...s, sides: t < 0.5 ? [0, 2] : [1, 3], ticks: true };
    case 'angles':
      return { ...s, angles: [0, 1, 2, 3].slice(0, Math.min(4, Math.floor(t * 4) + 1)) };
    case 'perimeter': {
      const P = perimeterOf(cfg.corners);
      return { ...s, walk: e, counter: { kind: 'length', value: e * P } };
    }
    case 'tile-row': {
      const c = e * (tl?.nx ?? 0);
      return { ...s, tiles: c, counter: { kind: 'squares', value: Math.floor(c + 1e-9) } };
    }
    case 'tile-all': {
      const c = (tl?.nx ?? 0) + e * (nTiles - (tl?.nx ?? 0));
      return { ...s, tiles: c, counter: { kind: tileArea === 1 ? 'squares' : 'tiles', value: Math.floor(c + 1e-9) } };
    }
    case 'area':
      return { ...s, tiles: nTiles, counter: tl ? { kind: 'area', value: nTiles * tileArea } : { kind: 'area', value: area(cfg.corners) } };
    case 'grid-extra': {
      const x = e * (cfg.extra ?? 0);
      return { ...s, tiles: nTiles, extra: x, counter: { kind: 'squares', value: nTiles + Math.floor(x + 1e-9) } };
    }
    case 'diagonal':
      return { ...s, diagonal: e };
    case 'right-triangle':
      return { ...s, diagonal: 1, triangle: true, angles: [1] };
    case 'pythag':
      return { ...s, diagonal: 1, triangle: true, angles: [1], pythag: e };
    case 'split':
      return { ...s, diagonal: 1, split: e };
    case 'flip':
      return { ...s, diagonal: 1, flip: e };
    case 'diagonals':
      return { ...s, diagonal: 1, diagonal2: e, centre: t > 0.6 };
    case 'four-triangles':
      return { ...s, diagonal: 1, diagonal2: 1, centre: true, four: e, counter: { kind: 'area', value: area(cfg.corners) / 4 } };
    case 'diag-square':
      return { ...s, diagonal: 1, diagonal2: 1, centre: true, diagSquare: e };
    case 'frame': {
      const strips = cfg.ring ? ringStrips(cfg.ring.outer, cfg.ring.inner) : [];
      const n = e * 4;
      const value = strips.reduce((acc, a, i) => acc + a * Math.max(0, Math.min(1, n - i)), 0);
      return { ...s, ringFill: e, counter: { kind: 'area', value } };
    }
    case 'frame-subtract': {
      const o = cfg.ring ? area(cfg.ring.outer) : 0;
      const i = cfg.ring ? area(cfg.ring.inner) : 0;
      return { ...s, ringSubtract: e, counter: { kind: 'area', value: o - e * i } };
    }
    case 'grid':
      return { ...s, tiles: nTiles, counter: { kind: 'squares', value: nTiles } };
    case 'final-area':
      return { ...s, tiles: nTiles };
    default:
      return s;
  }
}

/** Axis-aligned l × b figure at the origin (matches how it's built). */
export function axisQuad(l: number, b: number, x0 = 0, z0 = 0): Quad {
  return [
    [x0, 0, z0],
    [x0 + l, 0, z0],
    [x0 + l, 0, z0 + b],
    [x0, 0, z0 + b],
  ];
}

/** Square with diagonals 2k along the axes (built "diagonals first"). */
export function diamondQuad(k: number): Quad {
  return [
    [0, 0, k],
    [k, 0, 0],
    [2 * k, 0, k],
    [k, 0, 2 * k],
  ];
}

export const centreOf = (q: Quad): Vec3 => midpoint(q[0], q[2]);
