import { Html } from '@react-three/drei';
import { usePalette } from '@/design/palette';
import { useLocalize } from '@/i18n';
import { homeFor } from '@/features/guided/recipes';
import { squareArea } from '@/lib/geometry/formulas';
import { tx, type Params, type SceneProps } from '@/topics/contract';
import { NetUnfolder, type CuboidFace } from '@/three/blocks/NetUnfolder';
import { Rect } from '@/three/blocks/Rect';
import { saState } from './sceneState';

/** Every question's params carry the cube side `a` (for side-from-tsa it is the answer). */
const sideOf = (p: Params) => p.a!;

/** Where each face's centre sits in that face's own coordinates (see NetUnfolder). */
function faceCentre(face: CuboidFace, a: number): [number, number, number] {
  if (face === 'bottom' || face === 'top') return [a / 2, 0.02, a / 2];
  if (face === 'front' || face === 'back') return [a / 2, a / 2, 0.02];
  return [0.02, a / 2, a / 2];
}

function Pill({ text, strong = false }: { text: string; strong?: boolean }) {
  return (
    <span
      className={`num whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-bold shadow-lift ${
        strong ? 'border-accent bg-accent text-bg' : 'border-line/80 bg-bg/85 text-ink'
      }`}
    >
      {text}
    </span>
  );
}

export default function Scene({ params, questionId, cue, t }: SceneProps) {
  const a = sideOf(params);
  const { shape } = usePalette();
  const s = saState(cue, t, questionId);
  const accent = shape.cube;
  const second = shape.rectangle;
  const face = squareArea(a);

  const labels: Partial<Record<CuboidFace, React.ReactNode>> = {};
  for (const f of [...s.lit, ...s.secondary]) {
    labels[f] = (
      <Html position={faceCentre(f, a)} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <Pill text={`${face} cm²`} strong={s.secondary.includes(f)} />
      </Html>
    );
  }

  return (
    <group>
      <NetUnfolder
        l={a}
        b={a}
        h={a}
        unfold={s.unfold}
        outline={accent}
        hidden={s.hideTop ? ['top'] : []}
        labels={labels}
        styleFor={(f) =>
          s.secondary.includes(f)
            ? { color: second, opacity: 0.55, grid: true }
            : s.lit.includes(f)
              ? { color: accent, opacity: 0.5, grid: s.grid.includes(f) || s.lit.length === 1 }
              : { color: accent, opacity: 0.08 }
        }
      />
      {s.lidLift > 0 && s.lidLift < 1 && (
        <group position={[0, a + s.lidLift * a * 1.4, 0]}>
          <Rect u={[a, 0, 0]} v={[0, 0, a]} color={accent} opacity={0.35 * (1 - s.lidLift)} outline={accent} />
        </group>
      )}
      {s.showEdges && (
        <>
          <Html position={[a / 2, 0, a + 0.55]} center style={{ pointerEvents: 'none' }}>
            <Pill text={`${a} cm`} />
          </Html>
          <Html position={[a + 0.55, a / 2, a]} center style={{ pointerEvents: 'none' }}>
            <Pill text={`${a} cm`} />
          </Html>
        </>
      )}
    </group>
  );
}

/** Running total in the corner of the canvas. */
export function Overlay({ params, questionId, cue, t }: SceneProps) {
  const loc = useLocalize();
  const a = sideOf(params);
  const s = saState(cue, t, questionId);
  if (s.counted === 0) return null;
  return (
    <div className="glass pointer-events-none absolute left-3 top-16 rounded-card px-4 py-3 shadow-lift sm:top-3">
      <p className="text-xs text-muted">{loc(tx('Gine hue faces', 'Faces counted', 'गिने हुए फलक'))}</p>
      <p className="num text-lg font-bold">{s.counted}</p>
      <p className="mt-1 text-xs text-muted">{loc(tx('Area', 'Area', 'क्षेत्रफल'))}</p>
      <p className="num text-2xl font-bold text-accent" aria-live="polite">
        {s.counted * squareArea(a)} cm²
      </p>
    </div>
  );
}

// framed for the open net, which spans 3a × 4a around the base
export const home = (p: Params) => homeFor(p.a! * 1.9, [p.a! / 2, 0, p.a! * 0.1]);
