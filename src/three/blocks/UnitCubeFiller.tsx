/**
 * Fills an nx × ny × nz box with cubes of side `size` using ONE instanced mesh
 * (fast even for 512 cubes on phones). Cubes appear in counting order:
 * row by row along x, rows along z, then layer by layer up y.
 * `count` may be fractional: the cube being added drops in from above.
 */
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

export function fillOrder(nx: number, nz: number, k: number): [number, number, number] {
  const layer = Math.floor(k / (nx * nz));
  const inLayer = k % (nx * nz);
  return [inLayer % nx, layer, Math.floor(inLayer / nx)];
}

export function UnitCubeFiller({
  nx,
  ny,
  nz,
  size = 1,
  count,
  colors,
  colorOf,
  origin = [0, 0, 0],
}: {
  nx: number;
  ny: number;
  nz: number;
  size?: number;
  /** how many cubes are visible (fractional = one is dropping in) */
  count: number;
  /** colour per layer, cycled */
  colors: string[];
  /** optional per-cube colour (overrides `colors`), e.g. to show 8 small cubes inside a doubled one */
  colorOf?: (x: number, y: number, z: number) => string;
  origin?: [number, number, number];
}) {
  const total = nx * ny * nz;
  const ref = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(size * 0.9, size * 0.9, size * 0.9), [size]);
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
      const [x, y, z] = fillOrder(nx, nz, k);
      let s = 0;
      let drop = 0;
      if (k < whole) s = 1;
      else if (k === whole && frac > 0) {
        s = 0.4 + 0.6 * frac;
        drop = (1 - frac) * size * 1.5;
      }
      tmp.position.set(origin[0] + (x + 0.5) * size, origin[1] + (y + 0.5) * size + drop, origin[2] + (z + 0.5) * size);
      tmp.scale.setScalar(s || 1e-4);
      tmp.updateMatrix();
      mesh.setMatrixAt(k, tmp.matrix);
      mesh.setColorAt(k, col.set(colorOf ? colorOf(x, y, z) : colors[y % colors.length]!));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, nx, ny, nz, size, total, colors, colorOf, origin, tmp, col]);

  return (
    <instancedMesh ref={ref} args={[geometry, undefined, total]} frustumCulled={false}>
      <meshStandardMaterial roughness={0.55} metalness={0.05} />
    </instancedMesh>
  );
}
