import { Line } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { add, length, scale, type Vec3 } from '@/lib/geometry/vector';

type P = [number, number, number];

/**
 * A parallelogram face spanned by u and v from its local origin, with an outline
 * and (optionally) a 1-unit grid so students can count unit squares.
 */
export function Rect({
  u,
  v,
  color,
  opacity = 0.25,
  outline,
  grid = false,
  gridColor,
  lineWidth = 2,
}: {
  u: Vec3;
  v: Vec3;
  color: string;
  opacity?: number;
  outline?: string;
  grid?: boolean;
  gridColor?: string;
  lineWidth?: number;
}) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const o: Vec3 = [0, 0, 0];
    const a = u;
    const b = add(u, v);
    const d = v;
    g.setAttribute('position', new THREE.Float32BufferAttribute([...o, ...a, ...b, ...o, ...b, ...d], 3));
    return g;
  }, [u, v]);

  const gridGeometry = useMemo(() => {
    if (!grid) return null;
    const segs: number[] = [];
    const nu = Math.round(length(u));
    const nv = Math.round(length(v));
    for (let i = 1; i < nu; i++) segs.push(...scale(u, i / nu), ...add(scale(u, i / nu), v));
    for (let j = 1; j < nv; j++) segs.push(...scale(v, j / nv), ...add(scale(v, j / nv), u));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
    return g;
  }, [grid, u, v]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {gridGeometry && (
        <lineSegments geometry={gridGeometry}>
          <lineBasicMaterial color={gridColor ?? outline ?? color} transparent opacity={0.45} />
        </lineSegments>
      )}
      {outline && (
        <Line points={[[0, 0, 0], u as P, add(u, v) as P, v as P, [0, 0, 0]]} color={outline} lineWidth={lineWidth} />
      )}
    </group>
  );
}
