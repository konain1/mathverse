import { Html } from '@react-three/drei';
import { cn } from '@/lib/cn';
import type { Vec3 } from '@/lib/geometry/vector';

/** Small pill label floating at a 3D position ("4 cm", "90°"). */
export function LengthLabel({
  position,
  text,
  tone = 'default',
}: {
  position: Vec3;
  text: string;
  tone?: 'default' | 'bad' | 'ghost';
}) {
  return (
    <Html position={position as [number, number, number]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <span
        className={cn(
          'num whitespace-nowrap rounded-full border px-1.5 py-px text-[11px] font-semibold shadow-lift backdrop-blur',
          tone === 'bad' && 'border-bad bg-bad text-bg',
          tone === 'ghost' && 'border-accent/70 bg-bg/90 text-accent',
          tone === 'default' && 'border-line/80 bg-bg/85 text-ink',
        )}
      >
        {text}
      </span>
    </Html>
  );
}
