/** Pure helpers that turn a raw position/ray into a build Target. */
import { faceVertices, findPointAt, type Construction } from '@/lib/geometry/construction';
import { pointInPolygon, polygonNormal, rayPlane, rayPolygon } from '@/lib/geometry/polygon';
import { add, dot, scale, snap, sub, type Vec3 } from '@/lib/geometry/vector';
import { GRID_EXTENT, type Target } from './store';

const clamp = (n: number) => Math.max(-GRID_EXTENT, Math.min(GRID_EXTENT, n));

/** Snap to the 1 cm grid on a horizontal plane at height y, kept inside the grid. */
export function snapToGrid(p: Vec3, y = 0): Vec3 {
  return [clamp(snap(p[0])), y, clamp(snap(p[2]))];
}

/** Face (if any) containing a position, e.g. under the keyboard cursor. */
export function faceAt(c: Construction, pos: Vec3): string | undefined {
  for (const f of Object.values(c.faces)) {
    const pts = faceVertices(c, f.id);
    if (Math.abs(dot(sub(pos, pts[0]!), polygonNormal(pts))) > 1e-6) continue;
    if (pointInPolygon(pos, pts)) return f.id;
  }
  return undefined;
}

export function targetAtPosition(c: Construction, pos: Vec3): Target {
  const pointId = findPointAt(c, pos);
  const faceId = faceAt(c, pos);
  return { pos, ...(pointId && { pointId }), ...(faceId && { faceId }) };
}

/** Nearest face hit by a ray. */
export function faceHit(c: Construction, origin: Vec3, dir: Vec3): string | undefined {
  let best: { id: string; t: number } | undefined;
  for (const f of Object.values(c.faces)) {
    const t = rayPolygon(origin, dir, faceVertices(c, f.id));
    if (t !== null && (!best || t < best.t)) best = { id: f.id, t };
  }
  return best?.id;
}

/** Where a ray meets the horizontal plane y = planeY (snapped), or null. */
export function groundHit(origin: Vec3, dir: Vec3, planeY = 0): Vec3 | null {
  const t = rayPlane(origin, dir, [0, planeY, 0], [0, 1, 0]);
  if (t === null) return null;
  return snapToGrid(add(origin, scale(dir, t)), planeY);
}
