/**
 * A cuboid (or cube) made of six hinged faces that can fold up into the solid
 * (unfold = 0) or open flat into its cross-shaped net (unfold = 1).
 *
 * Coordinates match build mode: the bottom face spans (0,0,0)–(l,0,b), height h.
 * Face indices: 0 bottom, 1 front (z = b), 2 back (z = 0), 3 left (x = 0), 4 right (x = l), 5 top.
 * Net layout when open: top – back – bottom – front down the middle, left and right as arms.
 */
import type { ReactNode } from 'react';
import { Rect } from './Rect';

export const CUBOID_FACES = ['bottom', 'front', 'back', 'left', 'right', 'top'] as const;
export type CuboidFace = (typeof CUBOID_FACES)[number];

export interface FaceStyle {
  color: string;
  opacity?: number;
  /** draw the 1 cm grid on this face */
  grid?: boolean;
}

const HALF_PI = Math.PI / 2;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

export function NetUnfolder({
  l,
  b,
  h,
  unfold,
  styleFor,
  outline,
  grid = false,
  hidden = [],
  labels,
}: {
  l: number;
  b: number;
  h: number;
  /** 0 = closed solid, 1 = flat net */
  unfold: number;
  styleFor: (face: CuboidFace, index: number) => FaceStyle;
  outline: string;
  grid?: boolean;
  /** faces to leave out (e.g. the lid of an open box) */
  hidden?: CuboidFace[];
  /** optional extra content per face, placed in face-local coordinates */
  labels?: Partial<Record<CuboidFace, ReactNode>>;
}) {
  // sides open first, the lid follows a little later
  const sides = smooth(unfold / 0.75) * HALF_PI;
  const lid = smooth((unfold - 0.3) / 0.7) * HALF_PI;

  const face = (name: CuboidFace, u: [number, number, number], v: [number, number, number]) => {
    if (hidden.includes(name)) return null;
    const i = CUBOID_FACES.indexOf(name);
    const s = styleFor(name, i);
    return (
      <>
        <Rect u={u} v={v} color={s.color} opacity={s.opacity ?? 0.28} outline={outline} grid={grid || s.grid} />
        {labels?.[name]}
      </>
    );
  };

  return (
    <group>
      {face('bottom', [l, 0, 0], [0, 0, b])}
      <group position={[0, 0, b]} rotation-x={sides}>
        {face('front', [l, 0, 0], [0, h, 0])}
      </group>
      <group position={[0, 0, 0]} rotation-x={-sides}>
        {face('back', [l, 0, 0], [0, h, 0])}
        <group position={[0, h, 0]} rotation-x={-lid}>
          {face('top', [l, 0, 0], [0, 0, b])}
        </group>
      </group>
      <group position={[0, 0, 0]} rotation-z={sides}>
        {face('left', [0, 0, b], [0, h, 0])}
      </group>
      <group position={[l, 0, 0]} rotation-z={-sides}>
        {face('right', [0, 0, b], [0, h, 0])}
      </group>
    </group>
  );
}
