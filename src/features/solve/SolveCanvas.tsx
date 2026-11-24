import { Grid, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Crosshair } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { CameraHome } from '@/features/build/scene/CameraRig';
import { useSceneColors } from '@/features/build/scene/useSceneColors';
import { useT } from '@/i18n';
import type { ShapeFamily } from '@/topics/types';

function Controls({ home, resetRef }: { home: CameraHome; resetRef: React.MutableRefObject<(() => void) | null> }) {
  const ref = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    // narrow / portrait canvases see less sideways: back the camera off so the scene fits
    const aspect = size.width / Math.max(1, size.height);
    const k = aspect < 1.3 ? Math.min(1.9, (1.3 / aspect) ** 0.85) : 1;
    const [tx, ty, tz] = home.target;
    const [px, py, pz] = home.position;
    camera.position.set(tx + (px - tx) * k, ty + (py - ty) * k, tz + (pz - tz) * k);
    c.update();
    c.saveState(); // remember the starting view for "Reset camera"
    resetRef.current = () => c.reset();
    // only on mount: later resizes keep whatever view the student chose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetRef]);
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      target={home.target as [number, number, number]}
      enableDamping
      minDistance={3}
      maxDistance={60}
      maxPolarAngle={Math.PI / 2 + 0.3}
    />
  );
}

/** Canvas for animated solutions: students can orbit, zoom and pan while it plays. */
export function SolveCanvas({ family, home, label, children }: { family: ShapeFamily; home: CameraHome; label: string; children: ReactNode }) {
  const t = useT();
  const colors = useSceneColors(family);
  const reset = useRef<(() => void) | null>(null);
  return (
    <>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: home.position as [number, number, number], fov: 40, near: 0.1, far: 300 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        aria-label={label}
        role="img"
        className="touch-none"
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[6, 12, 8]} intensity={1.1} />
        <Grid
          position={[0, -0.003, 0]}
          infiniteGrid
          cellSize={1}
          sectionSize={5}
          cellColor={colors.grid}
          sectionColor={colors.section}
          fadeDistance={45}
          fadeStrength={1.5}
        />
        {children}
        <Controls home={home} resetRef={reset} />
      </Canvas>
      <button
        type="button"
        onClick={() => reset.current?.()}
        className="glass absolute right-3 top-3 z-10 flex min-h-[44px] items-center gap-2 rounded-control px-3 text-sm font-semibold"
      >
        <Crosshair className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">{t('build.actions.resetCamera')}</span>
        <span className="sr-only sm:hidden">{t('build.actions.resetCamera')}</span>
      </button>
    </>
  );
}
