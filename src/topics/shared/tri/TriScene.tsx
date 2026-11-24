import { Html, Line } from '@react-three/drei';
import { usePalette } from '@/design/palette';
import { AngleMarker } from '@/features/build/scene/AngleMarker';
import { footOf } from '@/features/guided/triRecipes';
import { useLocalize } from '@/i18n';
import { fmt, lengthText } from '@/lib/format';
import { add, distance, midpoint, normalize, scale, sub, type Vec3 } from '@/lib/geometry/vector';
import { tx, type SceneProps } from '@/topics/contract';
import { PolyFill } from '@/three/blocks/PolyFill';
import { Wedge } from '@/three/blocks/Wedge';
import type { Tri } from './lattice';
import { centroidOf, dirOf, perimeterOfTri, proofConfigs, proofTriPoints, triState, wedgesOf, type TriConfig, type WedgeSpec } from './triState';

type P = [number, number, number];
const up = (p: Vec3, y = 0.02): P => [p[0], p[1] + y, p[2]];

function Pill({ at, text, tone = 'plain' }: { at: Vec3; text: string; tone?: 'plain' | 'accent' | 'warm' | 'cool' }) {
  const cls =
    tone === 'accent'
      ? 'border-accent bg-accent text-bg'
      : tone === 'warm'
        ? 'border-rectangle bg-rectangle text-bg'
        : tone === 'cool'
          ? 'border-square bg-square text-bg'
          : 'border-line/80 bg-bg/85 text-ink';
  return (
    <Html position={at as P} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <span className={`num whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-bold shadow-lift ${cls}`}>{text}</span>
    </Html>
  );
}

const deg = (r: number) => (r * 180) / Math.PI;
const outwardOf = (a: Vec3, b: Vec3, inside: Vec3): Vec3 => {
  const d = sub(b, a);
  let n = normalize([-d[2], 0, d[0]]);
  const m = midpoint(a, b);
  if (n[0] * (inside[0] - m[0]) + n[2] * (inside[2] - m[2]) > 0) n = scale(n, -1);
  return n;
};

/** Small tick marks across a side (1, 2 or 3) to show equal sides. */
function Ticks({ a, b, n, color }: { a: Vec3; b: Vec3; n: number; color: string }) {
  const d = normalize(sub(b, a));
  const perp: Vec3 = [-d[2], 0, d[0]];
  const m = midpoint(a, b);
  return (
    <>
      {Array.from({ length: n }, (_, k) => {
        const c = add(m, scale(d, (k - (n - 1) / 2) * 0.22));
        return <Line key={k} points={[up(add(c, scale(perp, -0.22))), up(add(c, scale(perp, 0.22)))]} color={color} lineWidth={3} />;
      })}
    </>
  );
}

/** The triangle itself: fill, sides, letters, labels, ticks, angles. */
function TriangleBody({
  tri,
  letters,
  color,
  sideLabels,
  angleLabels,
  ticks,
  showAngles,
  ink,
  muted = false,
}: {
  tri: Tri;
  letters: [string, string, string];
  color: string;
  sideLabels?: [string, string, string];
  angleLabels?: [string, string, string];
  ticks?: [number, number, number];
  showAngles?: boolean;
  ink: string;
  muted?: boolean;
}) {
  const [A, B, C] = tri;
  const G = centroidOf(tri);
  const sides: [Vec3, Vec3][] = [[B, C], [C, A], [A, B]];
  const w = wedgesOf(tri);
  return (
    <group>
      <PolyFill pts={tri.map((p) => up(p, 0.005)) as Vec3[]} color={color} opacity={muted ? 0.08 : 0.16} />
      {sides.map(([p, q], i) => (
        <group key={i}>
          <Line points={[up(p), up(q)]} color={color} lineWidth={muted ? 1.5 : 3} transparent opacity={muted ? 0.5 : 1} />
          {!muted && <Pill at={add(midpoint(p, q), scale(outwardOf(p, q, G), 0.6))} text={sideLabels?.[i] ?? lengthText(distance(p, q))} />}
          {ticks && ticks[i]! > 0 && <Ticks a={p} b={q} n={ticks[i]!} color={color} />}
        </group>
      ))}
      {tri.map((p, i) => (
        <Pill key={i} at={add(p, scale(normalize(sub(p, G)), 0.6))} text={letters[i]!} />
      ))}
      {showAngles &&
        (['A', 'B', 'C'] as const).map((k, i) => {
          const spec = w[k];
          if (angleLabels?.[i] === '') return null; // '' = don't mark this angle
          const label = angleLabels?.[i] ?? `${fmt(deg(spec.sweep))}°`;
          const mid = add(spec.center, scale(dirOf(spec.start + spec.sweep / 2), 1.35));
          return (
            <group key={k}>
              <Wedge center={spec.center} start={spec.start} sweep={spec.sweep} radius={0.8} color={ink} opacity={0.25} />
              <Pill at={mid} text={label} />
            </group>
          );
        })}
    </group>
  );
}

const WEDGE_COLORS = ['triangle', 'square', 'rectangle'] as const;

export function TriScene({ cfg, cue, t }: SceneProps & { cfg: TriConfig }) {
  const { shape, scene } = usePalette();
  const accent = shape.triangle;
  const s = triState(cue, t, cfg);
  const tri = cfg.tri;
  const [A, B, C] = tri;
  const w = wedgesOf(tri);
  const wedgeColor = (k: 'A' | 'B' | 'C') => shape[WEDGE_COLORS[['A', 'B', 'C'].indexOf(k)]!];

  const renderWedge = (k: 'A' | 'B' | 'C', spec: WedgeSpec, label: boolean) => (
    <group key={k}>
      <Wedge center={spec.center} start={spec.start} sweep={spec.sweep} radius={1.4} color={wedgeColor(k)} opacity={0.7} />
      {label && spec.sweep > 0 && (
        <Pill
          at={add(spec.center, scale(dirOf(spec.start + spec.sweep / 2), 2.05))}
          text={cfg.angleLabels?.[['A', 'B', 'C'].indexOf(k)] ?? `${fmt(deg(spec.sweep))}°`}
          tone={k === 'A' ? 'accent' : k === 'B' ? 'cool' : 'warm'}
        />
      )}
    </group>
  );

  return (
    <group>
      {!s.hideMain && (
        <TriangleBody
          tri={tri}
          letters={['A', 'B', 'C']}
          color={accent}
          sideLabels={cfg.sideLabels}
          angleLabels={cfg.angleLabels}
          ticks={s.ticks || s.match ? cfg.ticks : undefined}
          showAngles={s.angles}
          ink={scene.ink}
        />
      )}

      {/* torn corners */}
      {s.wedges && (['A', 'B', 'C'] as const).map((k) => renderWedge(k, s.wedges![k], s.wedges!.labels))}
      {s.straightLine > 0 && s.wedges && (
        <>
          <Line points={[up(add(s.wedges.B.center, [-2.6, 0, 0])), up(add(s.wedges.B.center, [2.6, 0, 0]))]} color={scene.ink} lineWidth={3} transparent opacity={s.straightLine} />
          <Pill at={add(s.wedges.B.center, [0, 0, 0.6])} text="180°" tone="accent" />
        </>
      )}

      {/* exterior angle */}
      {s.extend > 0 && cfg.extend && (
        (() => {
          const D = add(C, scale(normalize(sub(C, B)), cfg.extend * s.extend));
          return (
            <>
              <Line points={[up(C), up(D)]} color={accent} lineWidth={3} dashed dashSize={0.3} gapSize={0.15} />
              {s.extend >= 1 && <Pill at={add(D, [0.5, 0, 0.4])} text="D" />}
            </>
          );
        })()
      )}
      {s.exterior > 0 &&
        (() => {
          const base = Math.atan2(-(C[2] - B[2]), C[0] - B[0]);
          const sweep = Math.PI - w.C.sweep;
          return (
            <>
              <Wedge center={C} start={base} sweep={sweep} radius={2.4} color={scene.ink} opacity={0.12 * s.exterior} />
              <Line
                points={Array.from({ length: 25 }, (_, i) => up(add(C, scale(dirOf(base + (sweep * i) / 24), 2.4))))}
                color={scene.ink}
                lineWidth={2}
                transparent
                opacity={s.exterior}
              />
              {s.exterior >= 1 && <Pill at={add(C, scale(dirOf(base + sweep / 2), 3.2))} text={`∠ACD = ${fmt(deg(sweep))}°`} />}
            </>
          );
        })()}

      {/* medians & altitude */}
      {s.median > 0 &&
        (() => {
          const M = midpoint(B, C);
          return (
            <>
              <Line points={[up(A, 0.04), up(add(A, scale(sub(M, A), s.median)), 0.04)]} color={shape.square} lineWidth={3.5} />
              {s.median >= 1 && (
                <>
                  <Ticks a={B} b={M} n={1} color={shape.square} />
                  <Ticks a={M} b={C} n={1} color={shape.square} />
                  <Pill at={add(M, [0, 0, 0.6])} text="M" tone="cool" />
                </>
              )}
            </>
          );
        })()}
      {s.medians > 0 &&
        (() => {
          const G = centroidOf(tri);
          const mB = midpoint(C, A);
          const mC = midpoint(A, B);
          return (
            <>
              <Line points={[up(B, 0.04), up(add(B, scale(sub(mB, B), s.medians)), 0.04)]} color={shape.square} lineWidth={3.5} />
              <Line points={[up(C, 0.04), up(add(C, scale(sub(mC, C), s.medians)), 0.04)]} color={shape.square} lineWidth={3.5} />
              {s.medians >= 1 && (
                <>
                  <mesh position={up(G, 0.08)}>
                    <sphereGeometry args={[0.17, 16, 12]} />
                    <meshBasicMaterial color={scene.ink} />
                  </mesh>
                  <Pill at={add(G, [0.55, 0, -0.45])} text="G" />
                </>
              )}
            </>
          );
        })()}
      {s.altitude > 0 &&
        (() => {
          const D = footOf(A, B, C);
          return (
            <>
              <Line points={[up(A, 0.04), up(add(A, scale(sub(D, A), s.altitude)), 0.04)]} color={shape.rectangle} lineWidth={3} dashed dashSize={0.25} gapSize={0.12} />
              {s.altitude >= 1 && (
                <>
                  <AngleMarker vertex={up(D, 0.04)} a={A} b={distance(D, C) > 0.01 ? C : B} color={scene.ink} size={0.4} />
                  <Pill at={add(midpoint(A, D), [0.55, 0, 0])} text={`h = ${lengthText(distance(A, D))}`} tone="warm" />
                </>
              )}
            </>
          );
        })()}

      {/* squares on the sides (Pythagoras) */}
      {s.squares > 0 &&
        (() => {
          const G = centroidOf(tri);
          const sqs: [Vec3, Vec3, string][] = [[B, C, shape.square], [A, B, shape.rectangle], [C, A, shape.cube]];
          return sqs.map(([p, q, col], i) => {
            const n = scale(outwardOf(p, q, G), distance(p, q) * s.squares);
            const pts = [p, q, add(q, n), add(p, n)];
            const area = distance(p, q) ** 2;
            return (
              <group key={i}>
                <PolyFill pts={pts.map((x) => up(x, 0.01)) as Vec3[]} color={col} opacity={0.35} />
                {s.squares > 0.95 && <Pill at={scale(add(add(pts[0]!, pts[1]!), add(pts[2]!, pts[3]!)), 0.25)} text={`${fmt(area)} cm²`} tone={i === 2 ? 'accent' : 'plain'} />}
              </group>
            );
          });
        })()}

      {/* rearrangement proof */}
      {s.proof && cfg.pythag &&
        (() => {
          const { a, b } = cfg.pythag;
          const { s: side } = proofConfigs(a, b);
          const O: Vec3 = [B[0], 0, B[2]];
          const sq: Vec3[] = [O, add(O, [side, 0, 0]), add(O, [side, 0, -side]), add(O, [0, 0, -side])];
          const m = (x: number, y: number): Vec3 => [O[0] + x, 0, O[2] - y];
          return (
            <group>
              <Line points={[...sq, sq[0]!].map((p) => up(p))} color={scene.ink} lineWidth={2.5} transparent opacity={s.proof.fade} />
              {s.proof.holes === 'c' && <PolyFill pts={[m(a, 0), m(side, a), m(b, side), m(0, b)]} color={shape.cube} opacity={0.45} />}
              {s.proof.holes === 'c' && <Pill at={m(side / 2, side / 2)} text={`c² = ${fmt(a * a + b * b)}`} tone="accent" />}
              {s.proof.holes === 'ab' && (
                <>
                  <PolyFill pts={[m(0, 0), m(a, 0), m(a, a), m(0, a)]} color={shape.rectangle} opacity={0.45} />
                  <PolyFill pts={[m(a, a), m(side, a), m(side, side), m(a, side)]} color={shape.square} opacity={0.45} />
                  <Pill at={m(a / 2, a / 2)} text={`a² = ${a * a}`} tone="warm" />
                  <Pill at={m(a + b / 2, a + b / 2)} text={`b² = ${b * b}`} tone="cool" />
                </>
              )}
              {s.proof.tris.map((p, i) => (
                <PolyFill key={i} pts={proofTriPoints(p, a, b, O).map((x) => up(x, 0.02)) as Vec3[]} color={accent} opacity={0.6 * s.proof!.fade} />
              ))}
              {s.proof.tris.map((p, i) => {
                const pts = proofTriPoints(p, a, b, O);
                return <Line key={`l${i}`} points={[...pts, pts[0]!].map((x) => up(x, 0.03))} color={accent} lineWidth={2} transparent opacity={s.proof!.fade} />;
              })}
            </group>
          );
        })()}

      {/* perimeter walk */}
      {s.walk > 0 &&
        (() => {
          const P = perimeterOfTri(tri);
          let left = s.walk * P;
          const path: Vec3[] = [A];
          for (const [p, q] of [[A, B], [B, C], [C, A]] as [Vec3, Vec3][]) {
            const len = distance(p, q);
            if (left >= len) {
              path.push(q);
              left -= len;
            } else {
              path.push(add(p, scale(sub(q, p), left / len)));
              break;
            }
          }
          const head = path[path.length - 1]!;
          return (
            <>
              <Line points={path.map((p) => up(p, 0.05))} color={shape.rectangle} lineWidth={6} />
              <mesh position={up(head, 0.2)}>
                <sphereGeometry args={[0.2, 20, 14]} />
                <meshBasicMaterial color={shape.rectangle} />
              </mesh>
            </>
          );
        })()}

      {/* area: copy → parallelogram → rectangle */}
      {s.copy > 0 &&
        (() => {
          const M = midpoint(A, C);
          const local = tri.map((p) => sub(p, M));
          const D = footOf(A, B, C);
          const piece = [B, D, A];
          const shift = scale(sub(C, B), s.rectangle);
          return (
            <>
              <group position={[M[0], 0.02 + Math.sin(Math.PI * s.copy) * 1.2, M[2]]} rotation-y={Math.PI * s.copy}>
                <PolyFill pts={local} color={shape.square} opacity={0.45} />
                <Line points={[...local, local[0]!] as P[]} color={shape.square} lineWidth={2.5} />
              </group>
              {s.rectangle > 0 && (
                <>
                  {/* what stays of ABC once the piece BDA is cut off */}
                  <PolyFill pts={[A, D, C].map((p) => up(p, 0.01)) as Vec3[]} color={accent} opacity={0.3} />
                  <Line points={[A, D, C, A].map((p) => up(p, 0.02))} color={accent} lineWidth={2.5} />
                  <Line points={[up(B), up(D)]} color={accent} lineWidth={1.5} dashed dashSize={0.2} gapSize={0.15} />
                  <PolyFill pts={piece.map((p) => up(add(p, shift), 0.04)) as Vec3[]} color={shape.triangle} opacity={0.55} />
                  <Line points={[...piece, piece[0]!].map((p) => up(add(p, shift), 0.05))} color={shape.triangle} lineWidth={2.5} />
                </>
              )}
              {s.copy >= 1 && s.rectangle === 0 && <Pill at={add(M, [0, 0, -0.8])} text="b × h" />}
              {s.rectangle >= 1 && <Pill at={add(midpoint(D, add(D, sub(C, B))), [0, 0, (A[2] - D[2]) / 2])} text={`${lengthText(distance(B, C))} × ${lengthText(distance(A, D))}`} tone="accent" />}
            </>
          );
        })()}

      {/* inequality: rods that can't close */}
      {s.rods > 0 && cfg.rods &&
        (() => {
          const { c, a, b } = cfg.rods;
          const L: Vec3 = [0, 0, 0];
          const R: Vec3 = [c, 0, 0];
          const phL = (Math.PI / 2) * (1 - s.rods);
          const phR = Math.PI / 2 + (Math.PI / 2) * s.rods;
          const tl = add(L, scale(dirOf(phL), a));
          const tr = add(R, scale(dirOf(phR), b));
          const gap = c - a - b;
          return (
            <>
              <Line points={[up(L), up(R)]} color={accent} lineWidth={4} />
              <Line points={[up(L), up(tl)]} color={shape.square} lineWidth={4} />
              <Line points={[up(R), up(tr)]} color={shape.rectangle} lineWidth={4} />
              <Pill at={add(midpoint(L, R), [0, 0, 0.7])} text={`${c} cm`} />
              <Pill at={add(midpoint(L, tl), [-0.5, 0, 0])} text={`${a} cm`} tone="cool" />
              <Pill at={add(midpoint(R, tr), [0.5, 0, 0])} text={`${b} cm`} tone="warm" />
              {s.rods >= 0.98 && <Pill at={add(midpoint(tl, tr), [0, 0, -0.8])} text={gap > 0 ? `gap ${fmt(gap)} cm` : '0 cm'} tone="accent" />}
            </>
          );
        })()}

      {/* inequality: the third side as the angle opens */}
      {s.range > 0 && cfg.range &&
        (() => {
          const { a, b } = cfg.range;
          const V: Vec3 = [0, 0, 0];
          const theta = ((5 + s.range * 170) * Math.PI) / 180;
          const P1 = add(V, [a, 0, 0]);
          const P2 = add(V, scale(dirOf(theta), b));
          return (
            <>
              <Line points={[up(V), up(P1)]} color={shape.square} lineWidth={4} />
              <Line points={[up(V), up(P2)]} color={shape.rectangle} lineWidth={4} />
              <Line points={[up(P1), up(P2)]} color={accent} lineWidth={3} dashed dashSize={0.25} gapSize={0.12} />
              <Pill at={add(midpoint(V, P1), [0, 0, 0.6])} text={`${a} cm`} tone="cool" />
              <Pill at={add(midpoint(V, P2), [-0.5, 0, -0.2])} text={`${b} cm`} tone="warm" />
              <Pill at={add(midpoint(P1, P2), [0.6, 0, -0.3])} text={`${fmt(distance(P1, P2))} cm`} tone="accent" />
            </>
          );
        })()}

      {/* congruence: DEF and the move onto ABC */}
      {cfg.copy &&
        (() => {
          const { offset, rotate, mirror } = cfg.copy;
          const G = centroidOf(tri);
          const local = tri.map((p) => sub(p, G)) as Tri;
          const k = 1 - s.superpose;
          return (
            <group position={[G[0] + offset[0] * k, 0.02 + Math.sin(Math.PI * s.superpose) * 1.5, G[2] + offset[2] * k]} rotation-y={rotate * k}>
              <group rotation-x={mirror ? Math.PI * k : 0}>
                <TriangleBody
                  tri={local}
                  letters={['D', 'E', 'F']}
                  color={shape.square}
                  ticks={s.match ? cfg.ticks : undefined}
                  showAngles={s.match && (cfg.copy.rule === 'ASA' || cfg.copy.rule === 'SAS' || cfg.copy.rule === 'RHS')}
                  angleLabels={cfg.angleLabels}
                  ink={scene.ink}
                  muted={s.superpose > 0.98}
                />
              </group>
            </group>
          );
        })()}
      {s.match && cfg.copy && (cfg.copy.rule === 'ASA' || cfg.copy.rule === 'SAS' || cfg.copy.rule === 'RHS') && (
        <TriangleBody tri={tri} letters={['A', 'B', 'C']} color={accent} ticks={cfg.ticks} showAngles angleLabels={cfg.angleLabels} ink={scene.ink} />
      )}
    </group>
  );
}

const COUNTER = {
  length: tx('Length', 'Length', 'लंबाई'),
  angle: tx('Angles ka jod', 'Sum of angles', 'कोणों का योग'),
  area: tx('Area', 'Area', 'क्षेत्रफल'),
};

export function TriOverlay({ cfg, cue, t }: SceneProps & { cfg: TriConfig }) {
  const loc = useLocalize();
  const s = triState(cue, t, cfg);
  if (!s.counter) return null;
  const { kind, value } = s.counter;
  return (
    <div className="glass pointer-events-none absolute left-3 top-16 rounded-card px-4 py-3 shadow-lift sm:top-3">
      <p className="text-xs text-muted">{loc(COUNTER[kind])}</p>
      <p className="num text-2xl font-bold text-accent" aria-live="polite">
        {fmt(Math.round(value * 10) / 10)}
        {kind === 'angle' ? '°' : kind === 'area' ? ' cm²' : ' cm'}
      </p>
    </div>
  );
}

/** Steep top-down camera framing a set of points. */
export function triHome(points: readonly Vec3[], margin = 1.25) {
  const xs = points.map((p) => p[0]);
  const zs = points.map((p) => p[2]);
  const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)) * margin;
  const target: Vec3 = [(Math.max(...xs) + Math.min(...xs)) / 2, 0, (Math.max(...zs) + Math.min(...zs)) / 2];
  return { position: add(target, scale(normalize([0.1, 1.9, 1.05]), 1.45 * size + 3)), target };
}
