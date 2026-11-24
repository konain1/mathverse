/**
 * Geometry validators. They never just say "wrong": every Issue names the
 * entities to highlight (edge / point / face ids) and the numbers to show,
 * e.g. { code: 'side-mismatch', entities: ['e3'], values: { actual: 3, expected: 4 } }
 * → "Ye side 3 cm hai, baaki 4 cm…" with edge e3 glowing red.
 */
import {
  counts,
  edgeLength,
  faceVertices,
  findEdge,
  pointPos,
  type Construction,
  type FaceIntent,
} from './construction';
import { classifyByAngles, classifyBySides, type TriangleByAngles, type TriangleBySides } from './formulas';
import { areCollinear, isPlanar } from './polygon';
import { angleAtDeg, distance, isRightAngle, normalize, roundTo, sub, type Vec3 } from './vector';

export type ShapeName = 'triangle' | 'square' | 'rectangle' | 'quadrilateral' | 'cube' | 'cuboid';

export type IssueCode =
  | 'loop-open' // a side of the loop hasn't been drawn
  | 'not-planar'
  | 'wrong-vertex-count'
  | 'collinear'
  | 'side-mismatch' // one side differs from the others (square / cube)
  | 'side-wrong-length' // all sides equal but not the length the question asks for
  | 'opposite-sides-unequal'
  | 'angle-not-right'
  | 'dimensions-mismatch' // rectangle: l × b
  | 'solid-dimensions-mismatch' // cuboid: l × b × h
  | 'triangle-sides-mismatch'
  | 'count-mismatch'
  | 'parallel-edges-unequal'
  | 'line-wrong-length' // guided step: "draw a 4 cm line" but it's 3 cm
  | 'not-bisected' // two diagonals that don't cut each other in half
  | 'border-uneven' // frame/path rectangle not the same distance away on every side
  | 'triangle-type-mismatch'; // "build an obtuse triangle" but it's acute

export const ISSUE_CODES: readonly IssueCode[] = [
  'loop-open', 'not-planar', 'wrong-vertex-count', 'collinear', 'side-mismatch', 'side-wrong-length',
  'opposite-sides-unequal', 'angle-not-right', 'dimensions-mismatch', 'solid-dimensions-mismatch',
  'triangle-sides-mismatch', 'count-mismatch', 'parallel-edges-unequal', 'line-wrong-length',
  'not-bisected', 'border-uneven', 'triangle-type-mismatch',
];

export interface Issue {
  code: IssueCode;
  /** Entity ids to highlight. */
  entities: string[];
  values?: Record<string, string | number>;
}

export interface CheckResult {
  ok: boolean;
  issues: Issue[];
}

const LEN_TOL = 1e-6;
const sameLen = (a: number, b: number) => Math.abs(a - b) <= LEN_TOL;
const cm = (x: number) => roundTo(x, 2);
const result = (issues: Issue[]): CheckResult => ({ ok: issues.length === 0, issues });

// ─── polygon measurements ────────────────────────────────────────────────
export interface PolygonSide {
  from: string;
  to: string;
  /** undefined if the student hasn't drawn this side */
  edgeId?: string;
  length: number;
}
export interface PolygonMeasure {
  pointIds: string[];
  sides: PolygonSide[];
  /** interior angle at each vertex, degrees */
  angles: number[];
  closed: boolean;
  planar: boolean;
}

export function measurePolygon(c: Construction, pointIds: readonly string[]): PolygonMeasure {
  const pts = pointIds.map((id) => pointPos(c, id));
  const n = pointIds.length;
  const sides = pointIds.map((from, i) => {
    const to = pointIds[(i + 1) % n]!;
    return { from, to, edgeId: findEdge(c, from, to), length: distance(pts[i]!, pts[(i + 1) % n]!) };
  });
  const angles = pts.map((p, i) => angleAtDeg(p, pts[(i + n - 1) % n]!, pts[(i + 1) % n]!));
  return {
    pointIds: [...pointIds],
    sides,
    angles,
    closed: sides.every((s) => s.edgeId !== undefined),
    planar: isPlanar(pts),
  };
}

const sideEntity = (s: PolygonSide) => (s.edgeId ? [s.edgeId] : [s.from, s.to]);

/** The value most sides share (the student's "intended" length); ties → the first side's length. */
function majorityLength(lengths: number[]): number {
  let best = lengths[0] ?? 0;
  let bestCount = 0;
  for (const l of lengths) {
    const n = lengths.filter((m) => sameLen(l, m)).length;
    if (n > bestCount) {
      best = l;
      bestCount = n;
    }
  }
  return best;
}

function baseIssues(m: PolygonMeasure, expectedVertices: number): Issue[] {
  const issues: Issue[] = [];
  if (m.pointIds.length !== expectedVertices)
    issues.push({ code: 'wrong-vertex-count', entities: m.pointIds, values: { actual: m.pointIds.length, expected: expectedVertices } });
  for (const s of m.sides) if (!s.edgeId) issues.push({ code: 'loop-open', entities: [s.from, s.to] });
  if (!m.planar) issues.push({ code: 'not-planar', entities: m.pointIds });
  return issues;
}

function rightAngleIssues(m: PolygonMeasure, shape: ShapeName): Issue[] {
  return m.angles.flatMap((a, i) =>
    isRightAngle(a) ? [] : [{ code: 'angle-not-right' as const, entities: [m.pointIds[i]!], values: { actual: roundTo(a, 1), shape } }],
  );
}

// ─── 2D shape checks ─────────────────────────────────────────────────────
export function checkSquare(c: Construction, pointIds: readonly string[], opts: { side?: number } = {}): CheckResult {
  const m = measurePolygon(c, pointIds);
  const issues = baseIssues(m, 4);
  if (issues.some((i) => i.code === 'wrong-vertex-count')) return result(issues);
  const lengths = m.sides.map((s) => s.length);
  const ref = opts.side ?? majorityLength(lengths);
  const allEqual = lengths.every((l) => sameLen(l, lengths[0]!));
  if (allEqual && opts.side !== undefined && !sameLen(lengths[0]!, opts.side)) {
    issues.push({ code: 'side-wrong-length', entities: m.sides.flatMap(sideEntity), values: { actual: cm(lengths[0]!), expected: cm(opts.side), shape: 'square' } });
  } else {
    for (const s of m.sides)
      if (!sameLen(s.length, ref))
        issues.push({ code: 'side-mismatch', entities: sideEntity(s), values: { actual: cm(s.length), expected: cm(ref), shape: 'square' } });
  }
  issues.push(...rightAngleIssues(m, 'square'));
  return result(issues);
}

export function checkRectangle(
  c: Construction,
  pointIds: readonly string[],
  opts: { length?: number; breadth?: number } = {},
): CheckResult {
  const m = measurePolygon(c, pointIds);
  const issues = baseIssues(m, 4);
  if (issues.some((i) => i.code === 'wrong-vertex-count')) return result(issues);
  for (const [i, j] of [[0, 2], [1, 3]] as const) {
    const a = m.sides[i]!;
    const b = m.sides[j]!;
    if (!sameLen(a.length, b.length))
      issues.push({ code: 'opposite-sides-unequal', entities: [...sideEntity(a), ...sideEntity(b)], values: { a: cm(a.length), b: cm(b.length) } });
  }
  issues.push(...rightAngleIssues(m, 'rectangle'));
  if (issues.length === 0 && opts.length !== undefined && opts.breadth !== undefined) {
    const got = [m.sides[0]!.length, m.sides[1]!.length].sort((x, y) => y - x);
    const want = [opts.length, opts.breadth].sort((x, y) => y - x);
    if (!sameLen(got[0]!, want[0]!) || !sameLen(got[1]!, want[1]!))
      issues.push({
        code: 'dimensions-mismatch',
        entities: m.sides.flatMap(sideEntity),
        values: { actualL: cm(got[0]!), actualB: cm(got[1]!), expectedL: cm(want[0]!), expectedB: cm(want[1]!) },
      });
  }
  return result(issues);
}

export interface TriangleInfo {
  sides: [number, number, number];
  bySides: TriangleBySides;
  byAngles: TriangleByAngles;
  angles: [number, number, number];
}

export function describeTriangle(c: Construction, pointIds: readonly string[]): TriangleInfo | undefined {
  if (pointIds.length !== 3) return undefined;
  const [a, b, d] = pointIds.map((id) => pointPos(c, id)) as [Vec3, Vec3, Vec3];
  if (areCollinear(a, b, d)) return undefined;
  const m = measurePolygon(c, pointIds);
  const s = m.sides.map((x) => x.length) as [number, number, number];
  return {
    sides: s,
    bySides: classifyBySides(...s, 1e-6),
    byAngles: classifyByAngles(...s, 1e-6),
    angles: m.angles as [number, number, number],
  };
}

export function checkTriangle(
  c: Construction,
  pointIds: readonly string[],
  opts: { sides?: [number, number, number]; byAngles?: TriangleByAngles; bySides?: TriangleBySides } = {},
): CheckResult {
  const m = measurePolygon(c, pointIds);
  const issues = baseIssues(m, 3);
  if (issues.some((i) => i.code === 'wrong-vertex-count')) return result(issues);
  const info = describeTriangle(c, pointIds);
  if (!info) return result([...issues, { code: 'collinear', entities: [...pointIds] }]);
  if (opts.sides) {
    const got = [...info.sides].sort((x, y) => x - y);
    const want = [...opts.sides].sort((x, y) => x - y);
    if (got.some((g, i) => !sameLen(g, want[i]!)))
      issues.push({
        code: 'triangle-sides-mismatch',
        entities: m.sides.flatMap(sideEntity),
        values: { actual: got.map(cm).join(', '), expected: want.map(cm).join(', ') },
      });
  }
  if (opts.byAngles === 'right' && info.byAngles !== 'right') {
    const biggest = info.angles.indexOf(Math.max(...info.angles));
    issues.push({ code: 'angle-not-right', entities: [pointIds[biggest]!], values: { actual: roundTo(info.angles[biggest]!, 1), shape: 'triangle' } });
  }
  return result(issues);
}

// ─── solids ──────────────────────────────────────────────────────────────
function solidCountIssues(c: Construction): Issue[] {
  const { V, E, F } = counts(c);
  const issues: Issue[] = [];
  const want = { vertices: [V, 8], edges: [E, 12], faces: [F, 6] } as const;
  for (const [what, [actual, expected]] of Object.entries(want))
    if (actual !== expected) issues.push({ code: 'count-mismatch', entities: [], values: { what, actual, expected } });
  return issues;
}

/** Every pair of edges meeting at a corner of a cube/cuboid must be at 90°. */
function cornerAngleIssues(c: Construction, shape: ShapeName): Issue[] {
  const issues: Issue[] = [];
  for (const p of Object.values(c.points)) {
    const dirs = Object.values(c.edges)
      .filter((e) => e.a === p.id || e.b === p.id)
      .map((e) => pointPos(c, e.a === p.id ? e.b : e.a));
    for (let i = 0; i < dirs.length; i++)
      for (let j = i + 1; j < dirs.length; j++) {
        const a = angleAtDeg(p.pos, dirs[i]!, dirs[j]!);
        if (!isRightAngle(a)) {
          issues.push({ code: 'angle-not-right', entities: [p.id], values: { actual: roundTo(a, 1), shape } });
          i = dirs.length; // one issue per corner is enough
          break;
        }
      }
  }
  return issues;
}

/** Edges grouped by direction (parallel groups). A cuboid has exactly 3 groups of 4. */
export function parallelEdgeGroups(c: Construction): string[][] {
  const groups: { dir: Vec3; ids: string[] }[] = [];
  for (const e of Object.values(c.edges)) {
    const d = normalize(sub(pointPos(c, e.b), pointPos(c, e.a)));
    const g = groups.find((x) => Math.abs(Math.abs(x.dir[0] * d[0] + x.dir[1] * d[1] + x.dir[2] * d[2]) - 1) < 1e-6);
    if (g) g.ids.push(e.id);
    else groups.push({ dir: d, ids: [e.id] });
  }
  return groups.map((g) => g.ids);
}

export function checkCube(c: Construction, opts: { side?: number } = {}): CheckResult {
  const issues = solidCountIssues(c);
  const edges = Object.keys(c.edges);
  if (edges.length === 0) return result(issues);
  const lengths = edges.map((id) => edgeLength(c, id));
  const allEqual = lengths.every((l) => sameLen(l, lengths[0]!));
  if (allEqual && opts.side !== undefined && !sameLen(lengths[0]!, opts.side)) {
    issues.push({ code: 'side-wrong-length', entities: edges, values: { actual: cm(lengths[0]!), expected: cm(opts.side), shape: 'cube' } });
  } else {
    const ref = opts.side ?? majorityLength(lengths);
    edges.forEach((id, i) => {
      if (!sameLen(lengths[i]!, ref))
        issues.push({ code: 'side-mismatch', entities: [id], values: { actual: cm(lengths[i]!), expected: cm(ref), shape: 'cube' } });
    });
  }
  issues.push(...cornerAngleIssues(c, 'cube'));
  return result(issues);
}

export function checkCuboid(c: Construction, opts: { dims?: [number, number, number] } = {}): CheckResult {
  const issues = solidCountIssues(c);
  issues.push(...cornerAngleIssues(c, 'cuboid'));
  const groups = parallelEdgeGroups(c);
  for (const g of groups) {
    const lengths = g.map((id) => edgeLength(c, id));
    const ref = majorityLength(lengths);
    g.forEach((id, i) => {
      if (!sameLen(lengths[i]!, ref))
        issues.push({ code: 'parallel-edges-unequal', entities: [id], values: { actual: cm(lengths[i]!), expected: cm(ref) } });
    });
  }
  if (issues.length === 0 && opts.dims) {
    const got = groups.map((g) => edgeLength(c, g[0]!)).sort((a, b) => b - a);
    const want = [...opts.dims].sort((a, b) => b - a);
    if (got.length !== 3 || got.some((g, i) => !sameLen(g, want[i]!)))
      issues.push({
        code: 'solid-dimensions-mismatch',
        entities: Object.keys(c.edges),
        values: { actual: got.map(cm).join(' × '), expected: want.map(cm).join(' × ') },
      });
  }
  return result(issues);
}

/** Dimensions of a valid cuboid/cube, longest first. */
export function cuboidDimensions(c: Construction): [number, number, number] | undefined {
  if (!checkCuboid(c).ok) return undefined;
  const dims = parallelEdgeGroups(c).map((g) => cm(edgeLength(c, g[0]!)));
  if (dims.length !== 3) return undefined;
  return dims.sort((a, b) => b - a) as [number, number, number];
}

// ─── whole-figure analysis (free build "Check") ─────────────────────────
export interface FaceReport {
  faceId: string;
  shape: ShapeName;
  /** side lengths in cm (rounded) */
  sides: number[];
  triangle?: Pick<TriangleInfo, 'bySides' | 'byAngles'>;
  intent?: FaceIntent;
}

export interface Analysis {
  counts: { V: number; E: number; F: number };
  solid?: { shape: 'cube' | 'cuboid'; dims: [number, number, number] };
  faces: FaceReport[];
  issues: Issue[];
}

export function classifyFace(c: Construction, faceId: string): FaceReport {
  const f = c.faces[faceId]!;
  const m = measurePolygon(c, f.points);
  const sides = m.sides.map((s) => cm(s.length));
  if (f.points.length === 3) {
    const info = describeTriangle(c, f.points);
    return { faceId, shape: 'triangle', sides, intent: f.intent, triangle: info && { bySides: info.bySides, byAngles: info.byAngles } };
  }
  if (f.points.length === 4 && m.angles.every((a) => isRightAngle(a))) {
    const square = m.sides.every((s) => sameLen(s.length, m.sides[0]!.length));
    return { faceId, shape: square ? 'square' : 'rectangle', sides, intent: f.intent };
  }
  return { faceId, shape: 'quadrilateral', sides, intent: f.intent };
}

/** Runs the right validator for whatever the student meant to draw. */
export function checkFaceIntent(c: Construction, faceId: string): CheckResult {
  const f = c.faces[faceId];
  if (!f?.intent) return result([]);
  const check = { triangle: checkTriangle, square: checkSquare, rectangle: checkRectangle }[f.intent];
  const r = check(c, f.points);
  // attach the face id so the whole face can glow too
  return result(r.issues.map((i) => ({ ...i, entities: [...i.entities, faceId] })));
}

export function analyzeConstruction(c: Construction): Analysis {
  const faces = Object.keys(c.faces).map((id) => classifyFace(c, id));
  const issues = Object.keys(c.faces).flatMap((id) => checkFaceIntent(c, id).issues);
  const cnt = counts(c);
  let solid: Analysis['solid'];
  if (cnt.V === 8 && cnt.E === 12 && cnt.F === 6) {
    const dims = cuboidDimensions(c);
    if (dims) solid = { shape: dims[0] === dims[2] ? 'cube' : 'cuboid', dims };
    else issues.push(...checkCuboid(c).issues);
  }
  return { counts: cnt, solid, faces, issues };
}

/** Area of a face in cm² (for live readouts). */
export function faceAreaCm2(c: Construction, faceId: string): number {
  const pts = faceVertices(c, faceId);
  // fan triangulation is exact for convex faces
  let area = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const a = sub(pts[i]!, pts[0]!);
    const b = sub(pts[i + 1]!, pts[0]!);
    area += Math.hypot(a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]) / 2;
  }
  return cm(area);
}
