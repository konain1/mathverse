import { Edges, Html } from '@react-three/drei';
import { useCallback, useMemo } from 'react';
import { usePalette } from '@/design/palette';
import { useLocalize } from '@/i18n';
import { homeFor } from '@/features/guided/recipes';
import { tx, type Params, type SceneProps } from '@/topics/contract';
import { UnitCubeFiller } from '@/three/blocks/UnitCubeFiller';
import { bigOrigin, volumeGeometry, vState, type Frame } from './sceneState';

function FrameBox({ f, color }: { f: Frame; color: string }) {
  const c = f.side / 2;
  return (
    <mesh position={[f.origin[0] + c, f.origin[1] + c, f.origin[2] + c]}>
      <boxGeometry args={[f.side, f.side, f.side]} />
      <meshBasicMaterial color={color} transparent opacity={0.05 * f.opacity} depthWrite={false} />
      <Edges color={color} transparent opacity={f.opacity} />
    </mesh>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <span className="num whitespace-nowrap rounded-full border border-line/80 bg-bg/85 px-2 py-0.5 text-xs font-bold text-ink shadow-lift">
      {text}
    </span>
  );
}

export default function Scene({ params, questionId, cue, t }: SceneProps) {
  const { shape } = usePalette();
  const s = vState(cue, t, questionId, params);
  const { A } = volumeGeometry(questionId, params);
  // alternate two shades per layer so layers are countable; octants use all four shape colours
  const layerColors = useMemo(() => [shape.cube, shape.square], [shape]);
  const octantPalette = useMemo(
    () => [shape.cube, shape.square, shape.triangle, shape.rectangle, shape.square, shape.cube, shape.rectangle, shape.triangle],
    [shape],
  );
  const a = params.a ?? 1;
  const octant = useCallback(
    (x: number, y: number, z: number) => octantPalette[(x >= a ? 1 : 0) + (y >= a ? 2 : 0) + (z >= a ? 4 : 0)]!,
    [octantPalette, a],
  );

  return (
    <group>
      {s.frames.map((f, i) => (
        <FrameBox key={i} f={f} color={shape.cube} />
      ))}
      {s.fills.map((f, i) => (
        <UnitCubeFiller
          key={i}
          nx={f.n}
          ny={f.n}
          nz={f.n}
          size={f.size}
          count={f.count}
          origin={f.origin}
          colors={layerColors}
          colorOf={f.octants ? octant : undefined}
        />
      ))}
      {s.showEdges && (
        <>
          <Html position={[A / 2, 0, A + 0.6]} center style={{ pointerEvents: 'none' }}>
            <Pill text={`${A} cm`} />
          </Html>
          <Html position={[A + 0.6, A / 2, A]} center style={{ pointerEvents: 'none' }}>
            <Pill text={`${A} cm`} />
          </Html>
        </>
      )}
      {questionId === 'double-side' && s.frames.length > 1 && (
        <Html position={[bigOrigin(a)[0] + a, 0, bigOrigin(a)[2] + 2 * a + 0.6]} center style={{ pointerEvents: 'none' }}>
          <Pill text={`${2 * a} cm`} />
        </Html>
      )}
    </group>
  );
}

/** Running count of cubes and layers. */
export function Overlay({ params, questionId, cue, t }: SceneProps) {
  const loc = useLocalize();
  const s = vState(cue, t, questionId, params);
  if (s.counted === 0) return null;
  const small = questionId === 'small-cubes';
  return (
    <div className="glass pointer-events-none absolute left-3 top-16 rounded-card px-4 py-3 shadow-lift sm:top-3">
      <p className="text-xs text-muted">
        {loc(small ? tx('Chhote cubes', 'Small cubes', 'छोटे घन') : tx('Unit cubes', 'Unit cubes', 'इकाई घन'))}
      </p>
      <p className="num text-2xl font-bold text-accent" aria-live="polite">
        {s.counted}
      </p>
      <p className="mt-1 text-xs text-muted">{loc(tx('Layers', 'Layers', 'परतें'))}</p>
      <p className="num text-lg font-bold">
        {s.layers} / {s.n}
      </p>
    </div>
  );
}

export const home = (p: Params, questionId: string) => {
  if (questionId === 'double-side') {
    const a = p.a!;
    return homeFor(3 * a + 2, [a, a * 0.6, -(a + 2) / 2]);
  }
  const { A } = volumeGeometry(questionId, p);
  return homeFor(A, [A / 2, A * 0.4, A / 2]);
};
