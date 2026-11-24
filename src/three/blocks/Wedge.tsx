import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { Vec3 } from '@/lib/geometry/vector';

/**
 * Filled angle sector on the ground. Angles use φ with direction (cos φ, 0, −sin φ),
 * which is exactly what a rotation of φ about +y does to +x.
 */
export function Wedge({ center, start, sweep, radius = 0.9, color, opacity = 0.6 }: { center: Vec3; start: number; sweep: number; radius?: number; color: string; opacity?: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = Math.max(2, Math.ceil((sweep / Math.PI) * 32));
    const pos: number[] = [];
    for (let i = 0; i < n; i++) {
      const a0 = (sweep * i) / n;
      const a1 = (sweep * (i + 1)) / n;
      pos.push(0, 0, 0, radius * Math.cos(a0), 0, -radius * Math.sin(a0), radius * Math.cos(a1), 0, -radius * Math.sin(a1));
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, [sweep, radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  if (sweep <= 0) return null;
  return (
    <group position={[center[0], center[1] + 0.03, center[2]]} rotation-y={start}>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}
