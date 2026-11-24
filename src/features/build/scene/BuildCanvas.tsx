import { Canvas } from '@react-three/fiber';
import type { ShapeFamily } from '@/topics/types';
import { CameraRig, type CameraHome } from './CameraRig';
import { ConstructionView } from './ConstructionView';
import { GhostLayer, GuideLayer, type GuideOverlay } from './GhostLayer';
import { GridFloor } from './GridFloor';
import { InteractionLayer } from './InteractionLayer';
import { useSceneColors } from './useSceneColors';

export const DEFAULT_HOME: CameraHome = { position: [9, 11, 14], target: [2, 0, 2] };

export interface BuildCanvasProps {
  family: ShapeFamily;
  home?: CameraHome;
  guide?: GuideOverlay;
  label: string;
}

/** The build-mode 3D canvas: grid + the student's figure + live ghosts + input. */
export function BuildCanvas({ family, home = DEFAULT_HOME, guide, label }: BuildCanvasProps) {
  const colors = useSceneColors(family);
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: home.position as [number, number, number], fov: 40, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-label={label}
      className="touch-none select-none"
    >
      <GridFloor colors={colors} />
      <ConstructionView colors={colors} />
      <GuideLayer guide={guide} colors={colors} />
      <GhostLayer colors={colors} />
      <InteractionLayer />
      <CameraRig home={home} />
    </Canvas>
  );
}
