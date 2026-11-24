import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useReducedMotionPref } from '@/hooks/useMediaQuery';
import type { Vec3 } from '@/lib/geometry/vector';
import { useBuild } from '../BuildProvider';

export interface CameraHome {
  position: Vec3;
  target: Vec3;
}

/**
 * Camera controls for build mode.
 * - Rotate tool: left mouse / one finger orbits.
 * - Any tool: right mouse orbits, wheel zooms, two fingers pinch-zoom + rotate.
 * - One finger / left mouse is left free for building.
 * - "Reset camera" eases back to `home`.
 */
export function CameraRig({ home }: { home: CameraHome }) {
  const tool = useBuild((s) => s.tool);
  const dragging = useBuild((s) => s.dragging);
  const resetTick = useBuild((s) => s.cameraResetTick);
  const reduced = useReducedMotionPref();
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  // Portrait screens (phones) see less sideways, so pull the camera back.
  const aspect = size.width / Math.max(1, size.height);
  const fitted = useMemo(() => {
    const k = aspect < 1 ? Math.min(1.9, aspect ** -0.7) : 1;
    const [tx, ty, tz] = home.target;
    const [px, py, pz] = home.position;
    return new THREE.Vector3(tx + (px - tx) * k, ty + (py - ty) * k, tz + (pz - tz) * k);
  }, [aspect, home]);
  const placed = useRef(false);
  useLayoutEffect(() => {
    if (placed.current || size.width === 0) return;
    placed.current = true;
    camera.position.copy(fitted);
  }, [camera, fitted, size.width]);
  const flight = useRef<{ t: number; fromPos: THREE.Vector3; fromTarget: THREE.Vector3 } | null>(null);
  const rotate = tool === 'rotate';

  useEffect(() => {
    if (resetTick === 0 || !controls.current) return;
    flight.current = { t: reduced ? 1 : 0, fromPos: camera.position.clone(), fromTarget: controls.current.target.clone() };
  }, [resetTick, camera, reduced]);

  useFrame((_, dt) => {
    const f = flight.current;
    const ctl = controls.current;
    if (!f || !ctl) return;
    f.t = Math.min(1, f.t + dt / 0.6);
    const k = 1 - (1 - f.t) ** 3;
    camera.position.lerpVectors(f.fromPos, fitted, k);
    ctl.target.lerpVectors(f.fromTarget, new THREE.Vector3(...home.target), k);
    ctl.update();
    if (f.t >= 1) flight.current = null;
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={!dragging}
      target={home.target as [number, number, number]}
      enableDamping
      dampingFactor={0.12}
      enablePan={false}
      minDistance={4}
      maxDistance={45}
      maxPolarAngle={Math.PI / 2 - 0.04}
      mouseButtons={{ LEFT: rotate ? THREE.MOUSE.ROTATE : undefined, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }}
      touches={{ ONE: rotate ? THREE.TOUCH.ROTATE : undefined, TWO: THREE.TOUCH.DOLLY_ROTATE }}
    />
  );
}
