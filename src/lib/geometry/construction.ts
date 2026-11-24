/**
 * The student's figure as plain data: points, edges and faces.
 * 1 unit = 1 cm. Every operation is pure: it returns a NEW construction
 * (or an error code), which makes undo/redo a simple list of snapshots.
 */
import { areCollinear, isPlanar, newellNormal } from './polygon';
import { EPS, add, distance, equals, length, posKey, sub, type Vec3 } from './vector';

export type FaceIntent = 'triangle' | 'square' | 'rectangle';

export interface CPoint {
  id: string;
  pos: Vec3;
}
export interface CEdge {
  id: string;
  a: string;
  b: string;
}
export interface CFace {
  id: string;
  /** Ordered loop of point ids (3 or 4). */
  points: readonly string[];
  /** What the student meant to draw (decides which validator runs). Undefined for auto-made faces. */
  intent?: FaceIntent;
}
export interface Construction {
  points: Readonly<Record<string, CPoint>>;
  edges: Readonly<Record<string, CEdge>>;
  faces: Readonly<Record<string, CFace>>;
  /** id counter (ids are never reused, so highlights stay correct across undo) */
  seq: number;
}

export type OpError =
  | 'same-point'
  | 'edge-exists'
  | 'point-exists'
  | 'point-occupied'
  | 'face-too-few'
  | 'face-collinear'
  | 'face-not-planar'
  | 'face-not-convex'
  | 'face-exists'
  | 'zero-extrude'
  | 'unknown-entity';

export type OpResult = { ok: true; c: Construction; created: string[] } | { ok: false; error: OpError };

export const emptyConstruction = (): Construction => ({ points: {}, edges: {}, faces: {}, seq: 0 });

const fail = (error: OpError): OpResult => ({ ok: false, error });

// ─── queries ─────────────────────────────────────────────────────────────
export function pointPos(c: Construction, id: string): Vec3 {
  const p = c.points[id];
  if (!p) throw new Error(`Unknown point ${id}`);
  return p.pos;
}

export function findPointAt(c: Construction, pos: Vec3): string | undefined {
  const key = posKey(pos);
  return Object.values(c.points).find((p) => posKey(p.pos) === key)?.id;
}

export function findEdge(c: Construction, a: string, b: string): string | undefined {
  return Object.values(c.edges).find((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a))?.id;
}

export function edgeLength(c: Construction, edgeId: string): number {
  const e = c.edges[edgeId];
  if (!e) throw new Error(`Unknown edge ${edgeId}`);
  return distance(pointPos(c, e.a), pointPos(c, e.b));
}

export function edgesAt(c: Construction, pointId: string): CEdge[] {
  return Object.values(c.edges).filter((e) => e.a === pointId || e.b === pointId);
}

export function neighbours(c: Construction, pointId: string): string[] {
  return edgesAt(c, pointId).map((e) => (e.a === pointId ? e.b : e.a));
}

export function faceVertices(c: Construction, faceId: string): Vec3[] {
  const f = c.faces[faceId];
  if (!f) throw new Error(`Unknown face ${faceId}`);
  return f.points.map((id) => pointPos(c, id));
}

export function counts(c: Construction) {
  return {
    V: Object.keys(c.points).length,
    E: Object.keys(c.edges).length,
    F: Object.keys(c.faces).length,
  };
}

/** Faces are equal if they use the same set of points. */
function faceKey(ids: readonly string[]) {
  return [...ids].sort().join('|');
}

/** Convex check for a planar polygon (all turns in the same direction). */
export function isConvexPolygon(pts: readonly Vec3[]): boolean {
  if (pts.length === 3) return !areCollinear(pts[0]!, pts[1]!, pts[2]!);
  const n = newellNormal(pts);
  if (length(n) < EPS) return false;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]!;
    const b = pts[(i + 1) % pts.length]!;
    const d = pts[(i + 2) % pts.length]!;
    const ab = sub(b, a);
    const bd = sub(d, b);
    const cr: Vec3 = [ab[1] * bd[2] - ab[2] * bd[1], ab[2] * bd[0] - ab[0] * bd[2], ab[0] * bd[1] - ab[1] * bd[0]];
    if (cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2] <= EPS) return false;
  }
  return true;
}

// ─── operations ──────────────────────────────────────────────────────────
function nextId(c: Construction, prefix: 'p' | 'e' | 'f'): [string, Construction] {
  const seq = c.seq + 1;
  return [`${prefix}${seq}`, { ...c, seq }];
}

/** Adds a point, or reuses the one already at `pos` (created = []). */
export function addPoint(c: Construction, pos: Vec3): OpResult & { id?: string } {
  const existing = findPointAt(c, pos);
  if (existing) return { ok: true, c, created: [], id: existing };
  const [id, c2] = nextId(c, 'p');
  return { ok: true, c: { ...c2, points: { ...c2.points, [id]: { id, pos: [pos[0] + 0, pos[1] + 0, pos[2] + 0] } } }, created: [id], id };
}

export function addEdge(c: Construction, a: string, b: string): OpResult & { id?: string } {
  if (!c.points[a] || !c.points[b]) return fail('unknown-entity');
  if (a === b) return fail('same-point');
  const existing = findEdge(c, a, b);
  if (existing) return { ok: true, c, created: [], id: existing };
  const [id, c2] = nextId(c, 'e');
  return { ok: true, c: { ...c2, edges: { ...c2.edges, [id]: { id, a, b } } }, created: [id], id };
}

/** Line tool: a segment between two positions; creates any missing points. */
export function addSegment(c: Construction, from: Vec3, to: Vec3): OpResult {
  if (equals(from, to)) return fail('same-point');
  const p1 = addPoint(c, from);
  if (!p1.ok) return p1;
  const p2 = addPoint(p1.c, to);
  if (!p2.ok) return p2;
  if (findEdge(p2.c, p1.id!, p2.id!)) return fail('edge-exists');
  const e = addEdge(p2.c, p1.id!, p2.id!);
  if (!e.ok) return e;
  return { ok: true, c: e.c, created: [...p1.created, ...p2.created, ...e.created] };
}

/** Face from existing point ids (ordered loop). Missing boundary edges are created. */
export function addFace(c: Construction, pointIds: readonly string[], intent?: FaceIntent): OpResult & { id?: string } {
  const ids = [...pointIds];
  if (new Set(ids).size !== ids.length || ids.length < 3) return fail('face-too-few');
  if (ids.some((id) => !c.points[id])) return fail('unknown-entity');
  const pts = ids.map((id) => pointPos(c, id));
  if (ids.length === 3 && areCollinear(pts[0]!, pts[1]!, pts[2]!)) return fail('face-collinear');
  if (!isPlanar(pts)) return fail('face-not-planar');
  if (!isConvexPolygon(pts)) return fail(ids.length === 3 ? 'face-collinear' : 'face-not-convex');
  const key = faceKey(ids);
  if (Object.values(c.faces).some((f) => faceKey(f.points) === key)) return fail('face-exists');

  let cur = c;
  const created: string[] = [];
  for (let i = 0; i < ids.length; i++) {
    const r = addEdge(cur, ids[i]!, ids[(i + 1) % ids.length]!);
    if (!r.ok) return r;
    cur = r.c;
    created.push(...r.created);
  }
  const [id, c2] = nextId(cur, 'f');
  const face: CFace = intent ? { id, points: ids, intent } : { id, points: ids };
  return { ok: true, c: { ...c2, faces: { ...c2.faces, [id]: face } }, created: [...created, id], id };
}

/** Face tool by clicking positions; creates missing points and edges. */
export function addFaceAt(c: Construction, positions: readonly Vec3[], intent?: FaceIntent): OpResult & { id?: string } {
  let cur = c;
  const ids: string[] = [];
  const created: string[] = [];
  for (const pos of positions) {
    const r = addPoint(cur, pos);
    if (!r.ok) return r;
    cur = r.c;
    ids.push(r.id!);
    created.push(...r.created);
  }
  const f = addFace(cur, ids, intent);
  if (!f.ok) return f;
  return { ...f, created: [...created, ...f.created] };
}

/**
 * Push-pull: copies the face by `offset`, joins each corner with a new edge and
 * adds the side faces. A 4 × 4 square pushed up by 4 becomes a cube
 * (8 points, 12 edges, 6 faces).
 */
export function extrudeFace(c: Construction, faceId: string, offset: Vec3): OpResult & { topFaceId?: string } {
  const face = c.faces[faceId];
  if (!face) return fail('unknown-entity');
  if (length(offset) < EPS) return fail('zero-extrude');

  let cur = c;
  const created: string[] = [];
  const top: string[] = [];
  for (const pid of face.points) {
    const r = addPoint(cur, add(pointPos(cur, pid), offset));
    if (!r.ok) return r;
    cur = r.c;
    top.push(r.id!);
    created.push(...r.created);
  }
  for (let i = 0; i < face.points.length; i++) {
    const r = addEdge(cur, face.points[i]!, top[i]!);
    if (!r.ok) return r;
    cur = r.c;
    created.push(...r.created);
  }
  const n = face.points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const side = addFace(cur, [face.points[i]!, face.points[j]!, top[j]!, top[i]!]);
    if (side.ok) {
      cur = side.c;
      created.push(...side.created);
    } else if (side.error !== 'face-exists') return side;
  }
  const topFace = addFace(cur, top, face.intent);
  if (!topFace.ok && topFace.error !== 'face-exists') return topFace;
  if (topFace.ok) {
    cur = topFace.c;
    created.push(...topFace.created);
  }
  return { ok: true, c: cur, created, topFaceId: topFace.ok ? topFace.id : undefined };
}

/** Move tool: edges and faces follow the point. */
export function movePoint(c: Construction, id: string, pos: Vec3): OpResult {
  const p = c.points[id];
  if (!p) return fail('unknown-entity');
  if (equals(p.pos, pos)) return fail('same-point');
  const other = findPointAt(c, pos);
  if (other && other !== id) return fail('point-occupied');
  return { ok: true, c: { ...c, points: { ...c.points, [id]: { id, pos: [pos[0] + 0, pos[1] + 0, pos[2] + 0] } } }, created: [] };
}
