/** Minimal 3D vector maths. Pure functions, no three.js dependency (easy to unit-test). */
export type Vec3 = readonly [number, number, number];

/** Geometric tolerance for "equal" lengths/positions (cm). Constructions snap to a 1 cm grid. */
export const EPS = 1e-6;
/** Angles within this many degrees count as equal (e.g. "is 90°"). */
export const ANGLE_TOL_DEG = 0.5;

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const length = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);

export function normalize(a: Vec3): Vec3 {
  const l = length(a);
  return l < EPS ? [0, 0, 0] : scale(a, 1 / l);
}

export function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export function midpoint(a: Vec3, b: Vec3): Vec3 {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
}

export function equals(a: Vec3, b: Vec3, eps = EPS): boolean {
  return Math.abs(a[0] - b[0]) < eps && Math.abs(a[1] - b[1]) < eps && Math.abs(a[2] - b[2]) < eps;
}

/** Stable string key for a position (used to de-duplicate points). */
export function posKey(a: Vec3): string {
  const r = (n: number) => (Math.round(n * 1e6) / 1e6 + 0).toString();
  return `${r(a[0])},${r(a[1])},${r(a[2])}`;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Angle between two direction vectors in degrees, 0–180. */
export function angleBetweenDeg(u: Vec3, v: Vec3): number {
  const lu = length(u);
  const lv = length(v);
  if (lu < EPS || lv < EPS) return 0;
  const c = Math.min(1, Math.max(-1, dot(u, v) / (lu * lv)));
  return (Math.acos(c) * 180) / Math.PI;
}

/** Angle ∠AVB at vertex V, in degrees. */
export function angleAtDeg(v: Vec3, a: Vec3, b: Vec3): number {
  return angleBetweenDeg(sub(a, v), sub(b, v));
}

export function isRightAngle(deg: number, tol = ANGLE_TOL_DEG): boolean {
  return Math.abs(deg - 90) <= tol;
}

export function nearlyEqual(a: number, b: number, eps = 1e-6): boolean {
  return Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b));
}

/** Round to `dp` decimal places without float noise (e.g. 1.005 → 1.01). */
export function roundTo(x: number, dp = 2): number {
  const f = 10 ** dp;
  return Math.round((x + Math.sign(x) * Number.EPSILON) * f) / f;
}

/** Snap a coordinate to the nearest multiple of `step`. */
export function snap(n: number, step = 1): number {
  return Math.round(n / step) * step + 0;
}

export function snapVec(a: Vec3, step = 1): Vec3 {
  return [snap(a[0], step), snap(a[1], step), snap(a[2], step)];
}
