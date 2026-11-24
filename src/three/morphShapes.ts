/**
 * Data for the landing-page morph: every shape is expressed with the same
 * topology (an 8-vertex box), so any shape can tween into any other.
 * Vertices 0–3 = bottom ring, 4–7 = top ring, in the order
 * back-left, back-right, front-right, front-left. A flat shape has height 0
 * (its top ring sits on its bottom ring); the triangle merges both back corners
 * into one apex. Lengths are in scene units; 1 unit = CM_PER_UNIT cm.
 */
import { distance, roundTo, type Vec3 } from '@/lib/geometry';

export type MorphShapeKey = 'cube' | 'triangle' | 'square' | 'rectangle';
export const MORPH_SEQUENCE: readonly MorphShapeKey[] = ['cube', 'triangle', 'square', 'rectangle'];
export const CM_PER_UNIT = 2;

interface Footprint {
  /** [x, z] for back-left, back-right, front-right, front-left */
  ring: readonly [readonly [number, number], readonly [number, number], readonly [number, number], readonly [number, number]];
  height: number;
}

const FOOTPRINTS: Record<MorphShapeKey, Footprint> = {
  // 4 cm cube
  cube: { ring: [[-1, -1], [1, -1], [1, 1], [-1, 1]], height: 2 },
  // base 5 cm, apex 4.5 cm behind the base (isosceles)
  triangle: { ring: [[0, -1.25], [0, -1.25], [1.25, 1], [-1.25, 1]], height: 0 },
  // 4 cm square = the cube's base once the top is pushed down
  square: { ring: [[-1, -1], [1, -1], [1, 1], [-1, 1]], height: 0 },
  // 7 cm × 4 cm
  rectangle: { ring: [[-1.75, -1], [1.75, -1], [1.75, 1], [-1.75, 1]], height: 0 },
};

export const EDGES: readonly (readonly [number, number])[] = [
  [0, 1], [1, 2], [2, 3], [3, 0], // bottom ring
  [4, 5], [5, 6], [6, 7], [7, 4], // top ring
  [0, 4], [1, 5], [2, 6], [3, 7], // verticals
];

/** 12 triangles: bottom, top, back, right, front, left */
export const FACE_INDEX: readonly number[] = [
  0, 1, 2, 0, 2, 3,
  4, 6, 5, 4, 7, 6,
  0, 1, 5, 0, 5, 4,
  1, 2, 6, 1, 6, 5,
  2, 3, 7, 2, 7, 6,
  3, 0, 4, 3, 4, 7,
];

/** Named edges that get live length labels. */
export const LABELLED_EDGES = {
  front: [3, 2],
  side: [2, 1],
  height: [3, 7],
} as const satisfies Record<string, readonly [number, number]>;

export function shapeVertices(key: MorphShapeKey): Vec3[] {
  const { ring, height } = FOOTPRINTS[key];
  const bottom = ring.map(([x, z]) => [x, 0, z] as Vec3);
  const top = ring.map(([x, z]) => [x, height, z] as Vec3);
  return [...bottom, ...top];
}

/** Flattened xyz array (length 24) for tweening. */
export function shapePositions(key: MorphShapeKey): Float32Array {
  return Float32Array.from(shapeVertices(key).flat());
}

export function edgeLengthCm(key: MorphShapeKey, edge: readonly [number, number]): number {
  const v = shapeVertices(key);
  return roundTo(distance(v[edge[0]]!, v[edge[1]]!) * CM_PER_UNIT, 1);
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}
