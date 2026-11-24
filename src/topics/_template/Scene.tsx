import { usePalette } from '@/design/palette';
import { homeFor } from '@/features/guided/recipes';
import type { Params, SceneProps } from '@/topics/contract';
import { NetUnfolder } from '@/three/blocks/NetUnfolder';

/**
 * Rendered inside the solve Canvas. Must be a pure function of (cue, t) so the
 * scrubber and speed control work: no internal timers, no useFrame state.
 */
export default function Scene({ params, t }: SceneProps) {
  const { shape } = usePalette();
  const a = params.a!;
  return (
    <NetUnfolder
      l={a}
      b={a}
      h={a}
      unfold={0}
      outline={shape.cube}
      styleFor={() => ({ color: shape.cube, opacity: 0.1 + 0.3 * t })}
    />
  );
}

/** Optional: DOM overlay over the canvas (counters, labels). */
// export function Overlay(props: SceneProps) { ... }

/** Camera starting point for this scene. */
export const home = (p: Params) => homeFor(p.a!, [p.a! / 2, p.a! * 0.4, p.a! / 2]);
