/**
 * Flat unit tiles laid row by row (along x, then rows along z) with ONE instanced mesh.
 * `count` may be fractional: the tile being placed drops in from above.
 */
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

export function TileFiller({
  nx,
  nz,
  size = 1,
  count,
  color,
  origin = [0, 0, 0],
  rowColor,
}: {
  nx: number;
  nz: number;
  size?: number;
  count: number;
  color: string;
  origin?: [number, number, number];
  /** alternate colour every other row, so rows can be counted */
  rowColor?: string;
}) {
  const total = Math.max(0, nx * nz);
  const ref = useRef<THREE.InstancedMesh>(null);
  const h = 0.06;
  const geometry = useMemo(() => new THREE.BoxGeometry(size * 0.92, h, size * 0.92), [size]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const shown = Math.max(0, Math.min(total, count));
    const whole = Math.floor(shown);
    const frac = shown - whole;
    for (let k = 0; k < total; k++) {
      const x = k % nx;
      const z = Math.floor(k / nx);
      let s = 0;
      let lift = 0;
      if (k < whole) s = 1;
      else if (k === whole && frac > 0) {
        s = 0.5 + 0.5 * frac;
        lift = (1 - frac) * 1.2;
      }
      tmp.position.set(origin[0] + (x + 0.5) * size, origin[1] + h / 2 + 0.01 + lift, origin[2] + (z + 0.5) * size);
      tmp.scale.setScalar(s || 1e-4);
      tmp.updateMatrix();
      mesh.setMatrixAt(k, tmp.matrix);
      mesh.setColorAt(k, col.set(rowColor && z % 2 ? rowColor : color));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, nx, nz, size, total, color, rowColor, origin, tmp, col]);

  if (total === 0) return null;
  return (
    <instancedMesh ref={ref} args={[geometry, undefined, total]} frustumCulled={false}>
      <meshStandardMaterial roughness={0.6} transparent opacity={0.85} />
    </instancedMesh>
  );
}
