import { Grid } from '@react-three/drei';
import { GRID_EXTENT } from '../store';
import type { BuildColors } from './useSceneColors';

/** 1 small cell = 1 cm, thicker line every 5 cm. Finite so students see where they can build. */
export function GridFloor({ colors }: { colors: BuildColors }) {
  const size = GRID_EXTENT * 2;
  return (
    <>
      <Grid
        position={[0, -0.002, 0]}
        args={[size, size]}
        cellSize={1}
        sectionSize={5}
        cellThickness={0.7}
        sectionThickness={1.2}
        cellColor={colors.grid}
        sectionColor={colors.section}
        fadeDistance={60}
        fadeStrength={1}
      />
      {/* origin marker */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0]}>
        <ringGeometry args={[0.05, 0.1, 24]} />
        <meshBasicMaterial color={colors.muted} />
      </mesh>
    </>
  );
}
