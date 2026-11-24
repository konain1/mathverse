/** Polygon & ray helpers for planar faces (triangles, quadrilaterals). */
import { EPS, add, cross, dot, length, normalize, scale, sub, type Vec3 } from './vector';

/** Robust polygon normal (Newell's method). Not normalised; length = 2 × area. */
export function newellNormal(points: readonly Vec3[]): Vec3 {
  let x = 0;
  let y = 0;
  let z = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i]!;
    const b = points[(i + 1) % points.length]!;
    x += (a[1] - b[1]) * (a[2] + b[2]);
    y += (a[2] - b[2]) * (a[0] + b[0]);
    z += (a[0] - b[0]) * (a[1] + b[1]);
  }
  return [x, y, z];
}

export function polygonNormal(points: readonly Vec3[]): Vec3 {
  return normalize(newellNormal(points));
}

/** Area of a planar polygon (any orientation in 3D). */
export function polygonArea(points: readonly Vec3[]): number {
  return length(newellNormal(points)) / 2;
}

export function centroid(points: readonly Vec3[]): Vec3 {
  const s = points.reduce<Vec3>((acc, p) => add(acc, p), [0, 0, 0]);
  return scale(s, 1 / Math.max(1, points.length));
}

/**
 * True if all points lie in one plane. The plane comes from the first
 * non-collinear triple, so self-crossing loops (zero Newell area) still count as planar.
 */
export function isPlanar(points: readonly Vec3[], tol = 1e-4): boolean {
  if (points.length <= 3) return true;
  const p0 = points[0]!;
  const u = sub(points[1]!, p0);
  let n: Vec3 = [0, 0, 0];
  for (let k = 2; k < points.length && length(n) < EPS; k++) n = cross(u, sub(points[k]!, p0));
  if (length(n) < EPS) return true; // all collinear: trivially planar
  n = normalize(n);
  return points.every((p) => Math.abs(dot(sub(p, p0), n)) <= tol);
}

/** True if three points lie on one line (no triangle possible). */
export function areCollinear(a: Vec3, b: Vec3, c: Vec3, tol = 1e-9): boolean {
  return length(cross(sub(b, a), sub(c, a))) <= tol;
}

/** Intersection of a ray with a plane. Returns t ≥ 0 along the ray, or null. */
export function rayPlane(origin: Vec3, dir: Vec3, planePoint: Vec3, planeNormal: Vec3): number | null {
  const denom = dot(dir, planeNormal);
  if (Math.abs(denom) < EPS) return null;
  const t = dot(sub(planePoint, origin), planeNormal) / denom;
  return t >= 0 ? t : null;
}

/**
 * Point-in-polygon for a planar polygon in 3D: projects onto the plane's
 * dominant axis and runs the even-odd test. Boundary counts as inside.
 */
export function pointInPolygon(p: Vec3, polygon: readonly Vec3[]): boolean {
  const n = newellNormal(polygon);
  const ax = Math.abs(n[0]);
  const ay = Math.abs(n[1]);
  const az = Math.abs(n[2]);
  // drop the dominant axis
  const [i, j] = ax >= ay && ax >= az ? [1, 2] : ay >= az ? [0, 2] : [0, 1];
  const px = p[i]!;
  const py = p[j]!;
  let inside = false;
  for (let k = 0, l = polygon.length - 1; k < polygon.length; l = k++) {
    const xi = polygon[k]![i]!, yi = polygon[k]![j]!;
    const xj = polygon[l]![i]!, yj = polygon[l]![j]!;
    // on-edge check
    const cr = (px - xi) * (yj - yi) - (py - yi) * (xj - xi);
    if (Math.abs(cr) < 1e-9 && px >= Math.min(xi, xj) - 1e-9 && px <= Math.max(xi, xj) + 1e-9 && py >= Math.min(yi, yj) - 1e-9 && py <= Math.max(yi, yj) + 1e-9)
      return true;
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Ray vs planar polygon. Returns distance t along the ray, or null. */
export function rayPolygon(origin: Vec3, dir: Vec3, polygon: readonly Vec3[]): number | null {
  const n = polygonNormal(polygon);
  const t = rayPlane(origin, dir, polygon[0]!, n);
  if (t === null) return null;
  return pointInPolygon(add(origin, scale(dir, t)), polygon) ? t : null;
}

/**
 * Parameter s of the point on line L(s) = linePoint + s·lineDir that is closest
 * to the ray (origin, dir). Used for push-pull: how far along the face normal
 * the pointer is. Returns null if ray and line are parallel.
 */
export function closestLineParamToRay(linePoint: Vec3, lineDir: Vec3, origin: Vec3, dir: Vec3): number | null {
  const a = dot(lineDir, lineDir);
  const b = dot(lineDir, dir);
  const c = dot(dir, dir);
  const w = sub(linePoint, origin);
  const d = dot(lineDir, w);
  const e = dot(dir, w);
  const denom = a * c - b * b;
  if (Math.abs(denom) < EPS) return null;
  return (b * e - c * d) / denom;
}
