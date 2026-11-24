import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { Vec3 } from '@/lib/geometry/vector';

/** Translucent fill for a convex polygon (fan-triangulated). */
export function PolyFill({ pts, color, opacity = 0.3 }: { pts: readonly Vec3[]; color: string; opacity?: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos: number[] = [];
    for (let i = 1; i < pts.length - 1; i++) pos.push(...pts[0]!, ...pts[i]!, ...pts[i + 1]!);
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, [pts]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}
