import { Html, Line } from '@react-three/drei';
import { usePalette } from '@/design/palette';
import { AngleMarker } from '@/features/build/scene/AngleMarker';
import { useLocalize } from '@/i18n';
import { lengthText, fmt } from '@/lib/format';
import { add, distance, midpoint, normalize, scale, sub, type Vec3 } from '@/lib/geometry/vector';
import { tx, type SceneProps } from '@/topics/contract';
import { PolyFill } from '@/three/blocks/PolyFill';
import { TileFiller } from '@/three/blocks/TileFiller';
import type { ShapeFamily } from '@/topics/types';
import { centreOf, flatState, walkPath, type FlatConfig, type Quad } from './flatState';

type P = [number, number, number];
const LETTERS = ['A', 'B', 'C', 'D'];

function Pill({ at, text, tone = 'plain' }: { at: Vec3; text: string; tone?: 'plain' | 'accent' | 'warm' }) {
  const cls =
    tone === 'accent' ? 'border-accent bg-accent text-bg' : tone === 'warm' ? 'border-triangle bg-triangle text-bg' : 'border-line/80 bg-bg/85 text-ink';
  return (
    <Html position={at as P} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <span className={`num whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-bold shadow-lift ${cls}`}>{text}</span>
    </Html>
  );
}

/** Outward unit normal (on the ground) of side a→b, pointing away from the figure's centre. */
function outward(a: Vec3, b: Vec3, centre: Vec3): Vec3 {
  const d = sub(b, a);
  let n = normalize([-d[2], 0, d[0]]);
  if (n[0] * (midpoint(a, b)[0] - centre[0]) + n[2] * (midpoint(a, b)[2] - centre[2]) < 0) n = scale(n, -1);
  return n;
}

/** Square built outward on side a→b (for the Pythagoras picture). */
function squareOn(a: Vec3, b: Vec3, away: Vec3, grow: number): Vec3[] {
  const n = scale(away, distance(a, b) * grow);
  return [a, b, add(b, n), add(a, n)];
}

/** A triangle that can lift, turn 180° about a vertical axis and land again (the congruence flip). */
function FlippingTriangle({ pts, pivot, t, color }: { pts: Vec3[]; pivot: Vec3; t: number; color: string }) {
  const local = pts.map((p) => sub(p, pivot));
  const lift = Math.sin(Math.PI * t) * 1.2;
  return (
    <group position={[pivot[0], pivot[1] + lift + 0.01, pivot[2]]} rotation-y={Math.PI * t}>
      <PolyFill pts={local} color={color} opacity={0.55} />
      <Line points={[...local, local[0]!] as P[]} color={color} lineWidth={2.5} />
    </group>
  );
}

export function FlatScene({ cfg, cue, t, family, labels }: SceneProps & { cfg: FlatConfig; family: ShapeFamily; labels?: { diagonal?: string; squares?: [string, string, string] } }) {
  const { shape, scene } = usePalette();
  const accent = shape[family];
  const warm = shape.triangle;
  const other = family === 'rectangle' ? shape.cube : shape.rectangle;
  const s = flatState(cue, t, cfg);
  const q = cfg.corners;
  const O = centreOf(q);
  const [A, B, C, D] = q;
  const lift = (p: Vec3, y = 0.02): Vec3 => [p[0], p[1] + y, p[2]];

  const sideColor = (i: number) => (s.sides.length === 0 || s.sides.includes(i) ? accent : scene.muted);
  const showFill = !s.split && !s.flip && !s.four && !s.ringSubtract && !s.ringFill;

  return (
    <group>
      {/* the figure */}
      {showFill && <PolyFill pts={q.map((p) => lift(p, 0.005))} color={accent} opacity={s.tiles ? 0.06 : 0.14} />}
      {q.map((a, i) => {
        const b = q[(i + 1) % 4]!;
        const n = outward(a, b, O);
        const hi = s.sides.includes(i);
        return (
          <group key={i}>
            <Line points={[lift(a) as P, lift(b) as P]} color={sideColor(i)} lineWidth={hi ? 5 : 2.5} />
            <Pill at={add(midpoint(a, b), scale(n, 0.55))} text={lengthText(distance(a, b))} tone={hi ? 'accent' : 'plain'} />
            {s.ticks &&
              Array.from({ length: cfg.kind === 'square' ? 1 : i % 2 ? 2 : 1 }, (_, k) => {
                const m = add(midpoint(a, b), scale(normalize(sub(b, a)), (k - (cfg.kind === 'square' ? 0 : i % 2 ? 0.5 : 0)) * 0.22));
                return <Line key={k} points={[lift(add(m, scale(n, -0.22))) as P, lift(add(m, scale(n, 0.22))) as P]} color={accent} lineWidth={3} />;
              })}
          </group>
        );
      })}
      {s.lettersOn &&
        q.map((p, i) => <Pill key={i} at={add(p, scale(normalize(sub(p, O)), 0.6))} text={LETTERS[i]!} />)}

      {/* right angles */}
      {s.angles.map((i) => (
        <AngleMarker key={i} vertex={lift(q[i]!, 0.03)} a={q[(i + 3) % 4]!} b={q[(i + 1) % 4]!} color={scene.ink} size={0.5} showValue />
      ))}

      {/* perimeter walk */}
      {s.walk > 0 && (() => {
        const path = walkPath(q, s.walk * q.reduce((acc, p, i) => acc + distance(p, q[(i + 1) % 4]!), 0));
        const head = path[path.length - 1]!;
        return (
          <>
            <Line points={path.map((p) => lift(p, 0.05)) as P[]} color={warm} lineWidth={6} />
            <mesh position={lift(head, 0.2) as P}>
              <sphereGeometry args={[0.2, 20, 14]} />
              <meshBasicMaterial color={warm} />
            </mesh>
          </>
        );
      })()}

      {/* unit tiles */}
      {cfg.tiles && s.tiles > 0 && (
        <TileFiller nx={cfg.tiles.nx} nz={cfg.tiles.nz} size={cfg.tiles.size} count={s.tiles} origin={cfg.tiles.origin as P} color={accent} rowColor={other} />
      )}
      {cfg.tiles && (cfg.extra ?? 0) > 0 && s.extra > 0 && (
        <TileFiller nx={cfg.extra!} nz={1} count={s.extra} origin={[cfg.tiles.origin[0], 0, cfg.tiles.origin[2] + cfg.tiles.nz * cfg.tiles.size + 1]} color={warm} />
      )}

      {/* diagonals */}
      {s.diagonal > 0 && (
        <>
          <Line points={[lift(A, 0.04) as P, lift(add(A, scale(sub(C, A), s.diagonal)), 0.04) as P]} color={warm} lineWidth={4} />
          {s.diagonal >= 1 && <Pill at={add(midpoint(A, C), [0, 0.5, 0])} text={labels?.diagonal ?? lengthText(distance(A, C))} tone="warm" />}
        </>
      )}
      {s.diagonal2 > 0 && <Line points={[lift(B, 0.04) as P, lift(add(B, scale(sub(D, B), s.diagonal2)), 0.04) as P]} color={warm} lineWidth={4} />}
      {s.centre && (
        <>
          <mesh position={lift(O, 0.06) as P}>
            <sphereGeometry args={[0.15, 16, 12]} />
            <meshBasicMaterial color={scene.ink} />
          </mesh>
          <Pill at={add(O, [0.5, 0.3, -0.5])} text="O" />
          {cfg.kind === 'square' && <AngleMarker vertex={lift(O, 0.05)} a={B} b={C} color={scene.ink} size={0.45} showValue />}
        </>
      )}

      {/* right triangle ABC + Pythagoras squares */}
      {s.triangle && <PolyFill pts={[A, B, C].map((p) => lift(p, 0.01))} color={warm} opacity={0.3} />}
      {s.pythag > 0 && (
        <>
          {(() => {
            const sqAB = squareOn(A, B, outward(A, B, O), s.pythag);
            const sqBC = squareOn(B, C, outward(B, C, O), s.pythag);
            const nAC = (() => {
              const n = outward(A, C, B);
              return n;
            })();
            const sqAC = squareOn(A, C, nAC, s.pythag);
            const lab = labels?.squares;
            return (
              <>
                <PolyFill pts={sqAB} color={accent} opacity={0.35} />
                <PolyFill pts={sqBC} color={other} opacity={0.35} />
                <PolyFill pts={sqAC} color={warm} opacity={0.3} />
                {s.pythag > 0.95 && lab && (
                  <>
                    <Pill at={centreOfPts(sqAB)} text={lab[0]} tone="accent" />
                    <Pill at={centreOfPts(sqBC)} text={lab[1]} />
                    <Pill at={centreOfPts(sqAC)} text={lab[2]} tone="warm" />
                  </>
                )}
              </>
            );
          })()}
        </>
      )}

      {/* the two triangles of the diagonal */}
      {s.split > 0 &&
        (() => {
          const n = outward(A, C, B);
          const d = 0.8 * s.split;
          const t1 = [A, B, C].map((p) => lift(add(p, scale(n, -d)), 0.01));
          const t2 = [A, C, D].map((p) => lift(add(p, scale(n, d)), 0.01));
          return (
            <>
              <PolyFill pts={t1} color={accent} opacity={0.45} />
              <PolyFill pts={t2} color={warm} opacity={0.45} />
            </>
          );
        })()}
      {s.flip > 0 && (
        <>
          <PolyFill pts={[A, B, C].map((p) => lift(p, 0.01))} color={accent} opacity={0.4} />
          <FlippingTriangle pts={[A, C, D]} pivot={lift(O, 0.02)} t={s.flip} color={warm} />
        </>
      )}

      {/* four triangles from both diagonals */}
      {s.four > 0 &&
        q.map((p, i) => {
          const nxt = q[(i + 1) % 4]!;
          const dir = normalize(sub(midpoint(p, nxt), O));
          const off = scale(dir, 0.7 * s.four);
          return <PolyFill key={i} pts={[p, nxt, O].map((x) => lift(add(x, off), 0.01))} color={i % 2 ? warm : accent} opacity={0.45} />;
        })}

      {/* area from the diagonal: the square drawn on the diagonals */}
      {s.diagSquare > 0 &&
        (() => {
          const outer = [add(sub(add(A, B), O), [0, 0, 0]), sub(add(B, C), O), sub(add(C, D), O), sub(add(D, A), O)] as Vec3[];
          const grow = Math.min(1, s.diagSquare * 2);
          const shown = outer.map((p) => add(O, scale(sub(p, O), grow)));
          return (
            <>
              <Line points={[...shown, shown[0]!].map((p) => lift(p, 0.03)) as P[]} color={other} lineWidth={2.5} dashed dashSize={0.3} gapSize={0.2} />
              {s.diagSquare > 0.5 &&
                q.map((p, i) => {
                  const nxt = q[(i + 1) % 4]!;
                  return <PolyFill key={i} pts={[p, outer[i]!, nxt].map((x) => lift(x, 0.01))} color={other} opacity={0.35 * Math.min(1, (s.diagSquare - 0.5) * 2)} />;
                })}
              {s.diagSquare > 0.5 && q.map((p, i) => <PolyFill key={`in${i}`} pts={[p, q[(i + 1) % 4]!, O].map((x) => lift(x, 0.015))} color={accent} opacity={0.35} />)}
            </>
          );
        })()}

      {/* frame / path */}
      {cfg.ring &&
        (() => {
          const { outer, inner } = cfg.ring;
          const L = distance(outer[0], outer[1]);
          const B2 = distance(outer[1], outer[2]);
          const w = Math.abs(inner[0][0] - outer[0][0]);
          const [ox, , oz] = outer[0];
          const strips: Vec3[][] = [
            [[ox, 0, oz], [ox + L, 0, oz], [ox + L, 0, oz + w], [ox, 0, oz + w]],
            [[ox, 0, oz + B2 - w], [ox + L, 0, oz + B2 - w], [ox + L, 0, oz + B2], [ox, 0, oz + B2]],
            [[ox, 0, oz + w], [ox + w, 0, oz + w], [ox + w, 0, oz + B2 - w], [ox, 0, oz + B2 - w]],
            [[ox + L - w, 0, oz + w], [ox + L, 0, oz + w], [ox + L, 0, oz + B2 - w], [ox + L - w, 0, oz + B2 - w]],
          ];
          const n = s.ringFill * 4;
          return (
            <>
              <Line points={[...outer, outer[0]].map((p) => lift(p)) as P[]} color={other} lineWidth={2.5} />
              <Line points={[...inner, inner[0]].map((p) => lift(p)) as P[]} color={accent} lineWidth={2.5} />
              <PolyFill pts={inner.map((p) => lift(p, 0.005 + s.ringSubtract * 1.5))} color={accent} opacity={0.18 * (1 - s.ringSubtract * 0.8)} />
              {s.ringFill > 0 &&
                strips.map((st, i) => (n > i ? <PolyFill key={i} pts={st.map((p) => lift(p, 0.01))} color={i < 2 ? warm : other} opacity={0.45 * Math.min(1, n - i)} /> : null))}
              {s.ringSubtract > 0 && <PolyFill pts={outer.map((p) => lift(p, 0.003))} color={warm} opacity={0.3} />}
            </>
          );
        })()}
    </group>
  );
}

const centreOfPts = (pts: Vec3[]): Vec3 => scale(pts.reduce((acc, p) => add(acc, p), [0, 0, 0] as Vec3), 1 / pts.length);

const COUNTER_LABEL = {
  length: tx('Ab tak chale', 'Walked so far', 'अब तक चले'),
  area: tx('Area', 'Area', 'क्षेत्रफल'),
  squares: tx('Unit squares', 'Unit squares', 'इकाई वर्ग'),
  tiles: tx('Tiles', 'Tiles', 'टाइलें'),
};

/** Running counter in the corner of the canvas. */
export function FlatOverlay({ cfg, cue, t, unit = 'cm' }: SceneProps & { cfg: FlatConfig; unit?: string }) {
  const loc = useLocalize();
  const s = flatState(cue, t, cfg);
  if (!s.counter) return null;
  const { kind, value } = s.counter;
  const suffix = kind === 'length' ? ` ${unit}` : kind === 'area' ? ` ${unit}²` : '';
  return (
    <div className="glass pointer-events-none absolute left-3 top-16 rounded-card px-4 py-3 shadow-lift sm:top-3">
      <p className="text-xs text-muted">{loc(COUNTER_LABEL[kind])}</p>
      <p className="num text-2xl font-bold text-accent" aria-live="polite">
        {kind === 'length' ? fmt(Math.round(value * 10) / 10) : fmt(value)}
        {suffix}
      </p>
    </div>
  );
}

/**
 * Camera for flat figures: looks down steeply (≈60°) so lengths aren't squashed,
 * framing the figure plus `margin` (extra room for squares built on its sides).
 */
export function flatHome(q: readonly Vec3[], margin = 1.3) {
  const xs = q.map((p) => p[0]);
  const zs = q.map((p) => p[2]);
  const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)) * margin;
  const target: Vec3 = [(Math.max(...xs) + Math.min(...xs)) / 2, 0, (Math.max(...zs) + Math.min(...zs)) / 2];
  const dist = 1.45 * size + 3;
  return { position: add(target, scale(normalize([0.35, 1.9, 1.05]), dist)), target };
}

/** Every corner of the figure plus the three Pythagoras squares (for framing the camera). */
export function pythagPoints(q: Quad): Vec3[] {
  const [A, B, C] = q;
  const O = centreOf(q);
  return [
    ...q,
    ...squareOn(A, B, outward(A, B, O), 1),
    ...squareOn(B, C, outward(B, C, O), 1),
    ...squareOn(A, C, outward(A, C, B), 1),
  ];
}
