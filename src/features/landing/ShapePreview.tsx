import { LazyCanvas } from '@/three/LazyCanvas';
import { MorphShape } from '@/three/MorphShape';
import type { ShapeFamily } from '@/topics/types';

/** Tiny spinning 3D thumbnail of a shape family. Low DPR, renders only while on screen. */
export function ShapePreview({ family, className }: { family: ShapeFamily; className?: string }) {
  return (
    <LazyCanvas className={className} maxDpr={1.5} camera={{ position: [3.6, 3.4, 4.6], fov: 40 }}>
      <group position-y={family === 'cube' ? -0.75 : 0}>
        <MorphShape shape={family} spin lineWidth={1.8} />
      </group>
    </LazyCanvas>
  );
}
