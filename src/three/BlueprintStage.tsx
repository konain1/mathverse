import { Grid, OrbitControls } from '@react-three/drei';
import type { ReactNode } from 'react';
import { usePalette } from '@/design/palette';
import { useCoarsePointer, useReducedMotionPref } from '@/hooks/useMediaQuery';

/**
 * Shared stage for showcase scenes: blueprint floor grid (1 small cell = 1 cm
 * when 1 unit = 2 cm) plus gentle orbit controls. Zoom/pan are off so the page
 * still scrolls; on touch screens rotation is off too so swipes scroll the page.
 */
export function BlueprintStage({
  children,
  target = [0, 0.6, 0],
  autoRotate = true,
}: {
  children: ReactNode;
  target?: [number, number, number];
  autoRotate?: boolean;
}) {
  const { scene } = usePalette();
  const reduced = useReducedMotionPref();
  const coarse = useCoarsePointer();
  return (
    <>
      {children}
      <Grid
        position={[0, -0.001, 0]}
        infiniteGrid
        cellSize={0.5}
        sectionSize={1}
        cellThickness={0.6}
        sectionThickness={1}
        cellColor={scene.grid}
        sectionColor={scene.section}
        fadeDistance={13}
        fadeStrength={1.6}
      />
      <OrbitControls
        makeDefault
        target={target}
        enableZoom={false}
        enablePan={false}
        enableRotate={!coarse}
        autoRotate={autoRotate && !reduced}
        autoRotateSpeed={0.6}
        minPolarAngle={0.35}
        maxPolarAngle={1.38}
        enableDamping
      />
    </>
  );
}
