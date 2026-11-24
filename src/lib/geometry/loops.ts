/**
 * Finds closed loops of edges (triangles and convex quadrilaterals) that don't
 * have a face yet — so a student who drew 4 lines can tap inside to fill the face.
 */
import { isConvexPolygon, neighbours, pointPos, type Construction } from './construction';
import { isPlanar, pointInPolygon, polygonArea, polygonNormal } from './polygon';
import { dot, sub, type Vec3 } from './vector';

export function findOpenLoops(c: Construction): string[][] {
  const existing = new Set(Object.values(c.faces).map((f) => [...f.points].sort().join('|')));
  const found = new Map<string, string[]>();
  const adj = new Map<string, string[]>();
  for (const id of Object.keys(c.points)) adj.set(id, neighbours(c, id));
  const consider = (loop: string[]) => {
    const key = [...loop].sort().join('|');
    if (found.has(key) || existing.has(key)) return;
    const pts = loop.map((id) => pointPos(c, id));
    if (!isPlanar(pts) || !isConvexPolygon(pts)) return;
    found.set(key, loop);
  };
  for (const a of adj.keys()) {
    for (const b of adj.get(a)!) {
      for (const d of adj.get(b)!) {
        if (d === a) continue;
        if (adj.get(d)!.includes(a)) consider([a, b, d]);
        for (const e of adj.get(d)!) {
          if (e === a || e === b) continue;
          if (adj.get(e)!.includes(a)) consider([a, b, d, e]);
        }
      }
    }
  }
  return [...found.values()];
}

/** The smallest open loop whose interior contains `pos` (e.g. where the student tapped). */
export function loopAt(c: Construction, pos: Vec3): string[] | undefined {
  let best: { loop: string[]; area: number } | undefined;
  for (const loop of findOpenLoops(c)) {
    const pts = loop.map((id) => pointPos(c, id));
    // must lie in the loop's plane, then inside it
    if (Math.abs(dot(sub(pos, pts[0]!), polygonNormal(pts))) > 1e-6) continue;
    if (!pointInPolygon(pos, pts)) continue;
    const area = polygonArea(pts);
    if (!best || area < best.area) best = { loop, area };
  }
  return best?.loop;
}
