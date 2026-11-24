/**
 * Pure animation state for triangle scenes: a function of (cue, t, config) only.
 * Angles in the XZ plane use φ with direction(φ) = (cos φ, 0, −sin φ), so φ grows
 * anticlockwise as seen from above (and "up" on screen is −z).
 */
import { easeInOut, phase } from '@/features/solve/timeline';
import { add, distance, midpoint, scale, sub, type Vec3 } from '@/lib/geometry/vector';
import type { Tri } from './lattice';

export type CongruenceRule = 'SSS' | 'SAS' | 'ASA' | 'RHS';

export interface TriConfig {
  tri: Tri; // A, B, C
  sideLabels?: [string, string, string]; // BC, CA, AB
  angleLabels?: [string, string, string]; // at A, B, C
  extend?: number;
  /** inequality: lengths that can NOT close (base c, rod a from B, rod b from C) */
  rods?: { c: number; a: number; b: number };
  /** inequality: two fixed sides from B whose angle sweeps */
  range?: { a: number; b: number };
  /** right triangle legs for the Pythagoras proof (right angle at B) */
  pythag?: { a: number; b: number };
  /** congruence: DEF = ABC moved by this (and mirrored) */
  copy?: { offset: Vec3; rotate: number; mirror: boolean; rule: CongruenceRule };
  /** equal-side tick counts for BC, CA, AB */
  ticks?: [number, number, number];
}

export const TRI_CUES = [
  'intro', 'sides', 'angles', 'tear', 'line-up', 'extend', 'exterior', 'fill-exterior',
  'median', 'medians', 'altitude', 'squares', 'proof-1', 'proof-2', 'perimeter', 'semi',
  'copy', 'rectangle', 'rods', 'range', 'match', 'superpose', 'solved',
] as const;

export const phiOf = (d: Vec3) => Math.atan2(-d[2], d[0]);
export const dirOf = (phi: number): Vec3 => [Math.cos(phi), 0, -Math.sin(phi)];
const TAU = Math.PI * 2;
const norm = (x: number) => ((x % TAU) + TAU) % TAU;

export interface WedgeSpec {
  center: Vec3;
  start: number;
  sweep: number;
}

/** Interior angle at V (between rays to U and W) as a wedge. */
export function interiorWedge(V: Vec3, U: Vec3, W: Vec3): WedgeSpec {
  const pu = phiOf(sub(U, V));
  const pw = phiOf(sub(W, V));
  const sweep = norm(pw - pu);
  return sweep <= Math.PI ? { center: V, start: pu, sweep } : { center: V, start: pw, sweep: TAU - sweep };
}

/** Shortest-path angle interpolation. */
export function lerpAngle(a: number, b: number, t: number) {
  let d = norm(b - a);
  if (d > Math.PI) d -= TAU;
  return a + d * t;
}
const lerpV = (a: Vec3, b: Vec3, t: number): Vec3 => add(a, scale(sub(b, a), t));

export function wedgesOf([A, B, C]: Tri): { A: WedgeSpec; B: WedgeSpec; C: WedgeSpec } {
  return { A: interiorWedge(A, B, C), B: interiorWedge(B, C, A), C: interiorWedge(C, A, B) };
}

/** Where the torn corners go: side by side on a straight line below the triangle (B, A, C order). */
export function tearTargets(tri: Tri) {
  const w = wedgesOf(tri);
  const P: Vec3 = [(tri[1][0] + tri[2][0]) / 2, 0, Math.max(tri[1][2], tri[2][2]) + 3.4];
  return {
    P,
    B: { center: P, start: 0, sweep: w.B.sweep },
    A: { center: P, start: w.B.sweep, sweep: w.A.sweep },
    C: { center: P, start: w.B.sweep + w.A.sweep, sweep: w.C.sweep },
  };
}

/** Exterior angle at C: the B and A corners land inside it. */
export function exteriorTargets(tri: Tri) {
  const w = wedgesOf(tri);
  const [, B, C] = tri;
  const base = phiOf(sub(C, B));
  return {
    exterior: { center: C, start: base, sweep: Math.PI - w.C.sweep },
    B: { center: C, start: base, sweep: w.B.sweep },
    A: { center: C, start: base + w.B.sweep, sweep: w.A.sweep },
  };
}

const moveWedge = (from: WedgeSpec, to: WedgeSpec, t: number): WedgeSpec => ({
  center: lerpV(from.center, to.center, t),
  start: lerpAngle(from.start, to.start, t),
  sweep: from.sweep,
});

// ─── Pythagoras rearrangement ────────────────────────────────────────────
/** One of the 4 copies of the right triangle: right-angle corner R (math coords x, up) and quarter turns k. */
export interface ProofTri {
  R: [number, number];
  k: number;
}
export function proofConfigs(a: number, b: number) {
  const s = a + b;
  const one: ProofTri[] = [
    { R: [0, 0], k: 0 },
    { R: [s, 0], k: 1 },
    { R: [s, s], k: 2 },
    { R: [0, s], k: 3 },
  ];
  const two: ProofTri[] = [
    { R: [0, a], k: 0 },
    { R: [s, 0], k: 1 },
    { R: [a, s], k: 2 },
    { R: [a, a], k: 3 },
  ];
  return { s, one, two };
}
/** Corners of a proof triangle in scene coordinates (math y → −z). */
export function proofTriPoints(p: ProofTri, a: number, b: number, origin: Vec3): Vec3[] {
  const rot = ([x, y]: [number, number]): [number, number] => {
    let v: [number, number] = [x, y];
    for (let i = 0; i < p.k; i++) v = [-v[1], v[0]];
    return v;
  };
  return ([[0, 0], [a, 0], [0, b]] as [number, number][]).map((q) => {
    const [x, y] = rot(q);
    return [origin[0] + p.R[0] + x, 0, origin[2] - (p.R[1] + y)] as Vec3;
  });
}

export interface TriState {
  ticks: boolean;
  angles: boolean;
  wedges?: { A: WedgeSpec; B: WedgeSpec; C: WedgeSpec; labels: boolean };
  straightLine: number; // 0–1 opacity of the 180° line
  extend: number;
  exterior: number;
  median: number; // A's median 0–1
  medians: number;
  altitude: number;
  squares: number;
  proof?: { tris: ProofTri[]; holes: 'c' | 'ab' | 'none'; fade: number };
  walk: number; // 0–1 of the perimeter
  copy: number;
  rectangle: number;
  rods: number;
  range: number;
  match: boolean;
  superpose: number;
  hideMain: boolean;
  counter?: { kind: 'length' | 'angle' | 'area'; value: number };
}

const base = (): TriState => ({
  ticks: false,
  angles: false,
  straightLine: 0,
  extend: 0,
  exterior: 0,
  median: 0,
  medians: 0,
  altitude: 0,
  squares: 0,
  walk: 0,
  copy: 0,
  rectangle: 0,
  rods: 0,
  range: 0,
  match: false,
  superpose: 0,
  hideMain: false,
});

export const perimeterOfTri = ([A, B, C]: Tri) => distance(A, B) + distance(B, C) + distance(C, A);

export function triState(cue: string, t: number, cfg: TriConfig): TriState {
  const s = base();
  const e = easeInOut(t);
  const w = wedgesOf(cfg.tri);
  const deg = (r: number) => (r * 180) / Math.PI;
  switch (cue) {
    case 'intro':
      return s;
    case 'sides':
      return { ...s, ticks: true };
    case 'angles':
      return { ...s, angles: true, counter: { kind: 'angle', value: deg(w.A.sweep + w.B.sweep + w.C.sweep) } };
    case 'solved':
      return { ...s, angles: true };
    case 'tear': {
      const tg = tearTargets(cfg.tri);
      const m = easeInOut(phase(t, 0.15, 1));
      return {
        ...s,
        wedges: { A: moveWedge(w.A, tg.A, m), B: moveWedge(w.B, tg.B, m), C: moveWedge(w.C, tg.C, m), labels: true },
      };
    }
    case 'line-up': {
      const tg = tearTargets(cfg.tri);
      return { ...s, wedges: { A: tg.A, B: tg.B, C: tg.C, labels: true }, straightLine: e, counter: { kind: 'angle', value: 180 } };
    }
    case 'extend':
      return { ...s, extend: e };
    case 'exterior':
      return { ...s, extend: 1, exterior: e, angles: true };
    case 'fill-exterior': {
      const tg = exteriorTargets(cfg.tri);
      const m = easeInOut(phase(t, 0.1, 0.9));
      const sumDeg = deg(w.A.sweep + w.B.sweep);
      return {
        ...s,
        extend: 1,
        exterior: 1,
        wedges: { A: moveWedge(w.A, tg.A, m), B: moveWedge(w.B, tg.B, m), C: { ...w.C, sweep: 0 }, labels: true },
        counter: { kind: 'angle', value: sumDeg },
      };
    }
    case 'median':
      return { ...s, median: e, ticks: false };
    case 'medians':
      return { ...s, median: 1, medians: e };
    case 'altitude':
      return { ...s, altitude: e };
    case 'squares':
      return { ...s, squares: e, angles: false };
    case 'proof-1': {
      if (!cfg.pythag) return s;
      return { ...s, hideMain: true, proof: { tris: proofConfigs(cfg.pythag.a, cfg.pythag.b).one, holes: t > 0.4 ? 'c' : 'none', fade: easeInOut(phase(t, 0, 0.4)) } };
    }
    case 'proof-2': {
      if (!cfg.pythag) return s;
      const { one, two } = proofConfigs(cfg.pythag.a, cfg.pythag.b);
      const m = easeInOut(phase(t, 0.1, 0.8));
      const tris = one.map((p, i) => ({ k: p.k, R: [p.R[0] + (two[i]!.R[0] - p.R[0]) * m, p.R[1] + (two[i]!.R[1] - p.R[1]) * m] as [number, number] }));
      return { ...s, hideMain: true, proof: { tris, holes: t > 0.85 ? 'ab' : 'none', fade: 1 } };
    }
    case 'perimeter': {
      const P = perimeterOfTri(cfg.tri);
      return { ...s, walk: e, counter: { kind: 'length', value: e * P } };
    }
    case 'semi': {
      const P = perimeterOfTri(cfg.tri);
      return { ...s, walk: e * 0.5, counter: { kind: 'length', value: e * P * 0.5 } };
    }
    case 'copy':
      return { ...s, copy: e, altitude: 1 };
    case 'rectangle':
      // the main triangle is redrawn without the piece that slides away
      return { ...s, copy: 1, rectangle: e, altitude: 1, hideMain: true };
    case 'rods':
      return { ...s, hideMain: true, rods: e };
    case 'range': {
      const r = cfg.range;
      const theta = ((5 + e * 170) * Math.PI) / 180;
      const third = r ? Math.sqrt(r.a * r.a + r.b * r.b - 2 * r.a * r.b * Math.cos(theta)) : 0;
      return { ...s, hideMain: true, range: e, counter: { kind: 'length', value: third } };
    }
    case 'match':
      return { ...s, match: true };
    case 'superpose':
      return { ...s, match: true, superpose: e };
    default:
      return s;
  }
}

export const centroidOf = ([A, B, C]: Tri): Vec3 => scale(add(add(A, B), C), 1 / 3);
export const midOf = midpoint;
