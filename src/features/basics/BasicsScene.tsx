/**
 * One short looping animation per Basics concept. Pure function of (id, t): t goes 0 → 1.
 * Flat concepts are drawn on the ground (y ≈ 0); solid ones use a cube/cuboid at the origin.
 */
import { Html, Line } from '@react-three/drei';
import { useSceneColors } from '@/features/build/scene/useSceneColors';
import { homeFor } from '@/features/guided/recipes';
import type { Vec3 } from '@/lib/geometry/vector';
import { NetUnfolder } from '@/three/blocks/NetUnfolder';
import { TileFiller } from '@/three/blocks/TileFiller';
import { UnitCubeFiller } from '@/three/blocks/UnitCubeFiller';
import type { ShapeFamily } from '@/topics/types';

const Y = 0.02;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => {
  const k = clamp01(x);
  return k * k * (3 - 2 * k);
};
/** progress of a sub-animation running from a to b inside t */
const part = (t: number, a: number, b: number) => ease((t - a) / (b - a));
const lerp = (p: Vec3, q: Vec3, k: number): Vec3 => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k];
const g = (x: number, z: number): Vec3 => [x, Y, z];

export function basicsHome(solid: boolean) {
  return solid ? homeFor(3, [1.5, 1, 1.5]) : { position: [0, 13, 7] as Vec3, target: [0, 0, 0] as Vec3 };
}

function Pill({ at, text, strong }: { at: Vec3; text: string; strong?: boolean }) {
  return (
    <Html position={at} center style={{ pointerEvents: 'none' }}>
      <span
        className={`num whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-bold shadow-lift ${strong ? 'border-accent bg-accent text-bg' : 'border-line/80 bg-bg/85 text-ink'}`}
      >
        {text}
      </span>
    </Html>
  );
}

function Dot({ at, color, size = 0.14 }: { at: Vec3; color: string; size?: number }) {
  if (size <= 0.001) return null;
  return (
    <mesh position={at}>
      <sphereGeometry args={[size, 20, 14]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

/** A segment p → q drawn up to fraction k. */
function Seg({ p, q, k = 1, color, width = 3, dashed }: { p: Vec3; q: Vec3; k?: number; color: string; width?: number; dashed?: boolean }) {
  if (k <= 0.001) return null;
  return <Line points={[p, lerp(p, q, k)]} color={color} lineWidth={width} dashed={dashed} dashSize={0.25} gapSize={0.15} />;
}

/** Ground arrow made simple: rotate a cone lying flat. */
function FlatArrow({ at, deg, color }: { at: Vec3; deg: number; color: string }) {
  // cone points +y by default; tip it onto the ground (+z), then turn it to `deg` (0 = +x, counter-clockwise seen from above)
  const r = (deg * Math.PI) / 180;
  return (
    <group position={at} rotation={[0, r + Math.PI / 2, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.18, 0.45, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

/** Polygon outline drawn side by side; returns sides and corner labels. */
function Polygon({ pts, t, color, ink, names }: { pts: Vec3[]; t: number; color: string; ink: string; names?: string[] }) {
  const n = pts.length;
  return (
    <>
      {pts.map((p, i) => (
        <Seg key={i} p={p} q={pts[(i + 1) % n]!} k={part(t, (i / n) * 0.7, ((i + 1) / n) * 0.7)} color={color} width={4} />
      ))}
      {pts.map((p, i) => (
        <Dot key={`d${i}`} at={p} color={ink} size={t > (i / n) * 0.7 ? 0.1 : 0} />
      ))}
      {names?.map((nm, i) => {
        const c = pts.reduce((s, p) => [s[0] + p[0] / n, 0, s[2] + p[2] / n] as Vec3, [0, 0, 0] as Vec3);
        const p = pts[i]!;
        const d = [p[0] - c[0], p[2] - c[2]];
        const len = Math.hypot(d[0]!, d[1]!) || 1;
        return t > (i / n) * 0.7 ? <Pill key={`n${i}`} at={[p[0] + (d[0]! / len) * 0.55, Y, p[2] + (d[1]! / len) * 0.55]} text={nm} /> : null;
      })}
    </>
  );
}

/** Small square marking a right angle at corner c between directions u and v (unit, ground). */
function RightMark({ c, u, v, color, size = 0.45 }: { c: Vec3; u: [number, number]; v: [number, number]; color: string; size?: number }) {
  const a = g(c[0] + u[0] * size, c[2] + u[1] * size);
  const m = g(c[0] + (u[0] + v[0]) * size, c[2] + (u[1] + v[1]) * size);
  const b = g(c[0] + v[0] * size, c[2] + v[1] * size);
  return <Line points={[a, m, b]} color={color} lineWidth={2} />;
}

const CUBE_A = 3;
const cubeVerts = (l: number, h: number, b: number): Vec3[] => [
  [0, 0, 0], [l, 0, 0], [l, 0, b], [0, 0, b],
  [0, h, 0], [l, h, 0], [l, h, b], [0, h, b],
];
const CUBE_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

function Box({ l, h, b, color, opacity = 0.12, edge, edgeWidth = 2 }: { l: number; h: number; b: number; color: string; opacity?: number; edge: string; edgeWidth?: number }) {
  const v = cubeVerts(l, h, b);
  if (h <= 0.001) return null;
  return (
    <group>
      <mesh position={[l / 2, h / 2, b / 2]}>
        <boxGeometry args={[l, h, b]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
      </mesh>
      {CUBE_EDGES.map(([i, j], k) => (
        <Line key={k} points={[v[i]!, v[j]!]} color={edge} lineWidth={edgeWidth} />
      ))}
    </group>
  );
}

/** The angle animation shared by "angle" and "right-angle". */
function AngleFan({ t, to, color, ink }: { t: number; to: number; color: string; ink: string }) {
  const O = g(-1.5, 1.5);
  const deg = to * part(t, 0.2, 0.85);
  const r = (deg * Math.PI) / 180;
  const L = 4;
  const end2 = g(O[0] + Math.cos(r) * L, O[2] - Math.sin(r) * L);
  const arc: Vec3[] = Array.from({ length: 25 }, (_, i) => {
    const a = (r * i) / 24;
    return g(O[0] + Math.cos(a) * 1.1, O[2] - Math.sin(a) * 1.1);
  });
  const mid = r / 2;
  return (
    <>
      <Seg p={O} q={g(O[0] + L, O[2])} k={part(t, 0, 0.2)} color={color} width={4} />
      {t > 0.2 && <Seg p={O} q={end2} color={color} width={4} />}
      <Dot at={O} color={ink} />
      <Pill at={g(O[0] - 0.45, O[2] + 0.4)} text="O" />
      {deg > 3 && (to === 90 && t > 0.9 ? (
        <RightMark c={O} u={[1, 0]} v={[0, -1]} color={ink} />
      ) : (
        <Line points={arc} color={ink} lineWidth={2} />
      ))}
      {deg > 3 && <Pill at={g(O[0] + Math.cos(mid) * 1.9, O[2] - Math.sin(mid) * 1.9)} text={`${Math.round(deg)}°`} strong={t > 0.9} />}
    </>
  );
}

export function BasicsScene({ id, t, family }: { id: string; t: number; family: ShapeFamily }) {
  const col = useSceneColors(family);
  const accent = col.accent;
  const ink = col.ink;
  const muted = col.muted;
  const hi = col.ok;

  switch (id) {
    case 'point': {
      const pts: [Vec3, string][] = [[g(-2, 1), 'A'], [g(1.5, -1), 'B'], [g(2.5, 2), 'C']];
      return (
        <>
          {pts.map(([p, n], i) => {
            const k = part(t, i * 0.25, i * 0.25 + 0.2);
            return (
              <group key={n}>
                <Dot at={p} color={accent} size={0.18 * k} />
                {k > 0.5 && <Pill at={g(p[0], p[2] - 0.6)} text={n} />}
              </group>
            );
          })}
        </>
      );
    }
    case 'line-segment': {
      const A = g(-2.5, 0);
      const B = g(2.5, 0);
      const k = part(t, 0.15, 0.75);
      return (
        <>
          <Dot at={A} color={ink} />
          <Pill at={g(-2.5, -0.6)} text="A" />
          <Seg p={A} q={B} k={k} color={accent} width={5} />
          {k > 0.99 && <Dot at={B} color={ink} />}
          {k > 0.99 && <Pill at={g(2.5, -0.6)} text="B" />}
          {t > 0.8 && <Pill at={g(0, 0.7)} text="AB = 5 cm" strong />}
        </>
      );
    }
    case 'line': {
      const k = part(t, 0.1, 0.8);
      const L = 1.5 + 4.5 * k;
      return (
        <>
          <Line points={[g(-L, 0), g(L, 0)]} color={accent} lineWidth={5} />
          <FlatArrow at={g(L, 0)} deg={0} color={accent} />
          <FlatArrow at={g(-L, 0)} deg={180} color={accent} />
          <Dot at={g(-1.5, 0)} color={ink} />
          <Dot at={g(1.5, 0)} color={ink} />
          <Pill at={g(-1.5, -0.6)} text="A" />
          <Pill at={g(1.5, -0.6)} text="B" />
          {t > 0.85 && <Pill at={g(0, 0.8)} text="∞ ⟷ ∞" strong />}
        </>
      );
    }
    case 'ray': {
      const k = part(t, 0.1, 0.8);
      const L = -3 + 9 * k;
      return (
        <>
          <Line points={[g(-3, 0), g(Math.max(-2.99, L), 0)]} color={accent} lineWidth={5} />
          {k > 0.05 && <FlatArrow at={g(L, 0)} deg={0} color={accent} />}
          <Dot at={g(-3, 0)} color={ink} size={0.17} />
          <Pill at={g(-3, -0.6)} text="A" />
          {t > 0.85 && <Pill at={g(1.5, 0.8)} text="A ⟶ ∞" strong />}
        </>
      );
    }
    case 'angle':
      return <AngleFan t={t} to={60} color={accent} ink={ink} />;
    case 'right-angle':
      return <AngleFan t={t} to={90} color={accent} ink={ink} />;

    case 'vertex': {
      const v = cubeVerts(CUBE_A, CUBE_A, CUBE_A);
      const n = Math.min(8, Math.floor(part(t, 0.1, 0.85) * 8 + 0.0001));
      return (
        <>
          <Box l={CUBE_A} h={CUBE_A} b={CUBE_A} color={accent} edge={muted} />
          {v.slice(0, n).map((p, i) => (
            <Dot key={i} at={p} color={hi} size={0.16} />
          ))}
          <Pill at={[CUBE_A / 2, CUBE_A + 1, CUBE_A / 2]} text={`${n} / 8`} strong={n === 8} />
        </>
      );
    }
    case 'edge': {
      const v = cubeVerts(CUBE_A, CUBE_A, CUBE_A);
      const n = Math.min(12, Math.floor(part(t, 0.1, 0.85) * 12 + 0.0001));
      return (
        <>
          <Box l={CUBE_A} h={CUBE_A} b={CUBE_A} color={accent} edge={muted} edgeWidth={1.5} />
          {CUBE_EDGES.slice(0, n).map(([i, j], k) => (
            <Line key={k} points={[v[i]!, v[j]!]} color={hi} lineWidth={6} />
          ))}
          <Pill at={[CUBE_A / 2, CUBE_A + 1, CUBE_A / 2]} text={`${n} / 12`} strong={n === 12} />
        </>
      );
    }
    case 'face':
    case 'surface-area': {
      const a = id === 'face' ? CUBE_A : 2;
      const lit = Math.min(6, Math.floor(part(t, 0.05, 0.55) * 6 + 0.0001));
      const unfold = id === 'face' ? 0 : part(t, 0.6, 0.95);
      const area = a * a;
      return (
        <>
          <NetUnfolder
            l={a}
            b={a}
            h={a}
            unfold={unfold}
            outline={ink}
            grid={id === 'surface-area'}
            styleFor={(_, i) => (i < lit ? { color: accent, opacity: 0.6 } : { color: muted, opacity: 0.08 })}
          />
          <Pill
            at={[a / 2, a + 1, a / 2]}
            text={id === 'face' ? `${lit} / 6` : t > 0.6 ? `6 × ${area} = ${6 * area} cm²` : `${lit} × ${area} cm²`}
            strong={lit === 6}
          />
        </>
      );
    }
    case 'cube':
    case 'cuboid': {
      const [l, h, b] = id === 'cube' ? [CUBE_A, CUBE_A, CUBE_A] : [4, 2, 2.5];
      const k = part(t, 0.05, 0.55);
      const show = t > 0.6;
      const lab = id === 'cube' ? ['a', 'a', 'a'] : ['l', 'h', 'b'];
      return (
        <>
          <Box l={l} h={h * k} b={b} color={accent} opacity={0.18} edge={accent} />
          {show && <Pill at={[l / 2, 0, b + 0.5]} text={`${lab[0]} = ${l} cm`} />}
          {show && <Pill at={[l + 0.6, h / 2, b]} text={`${lab[1]} = ${h} cm`} />}
          {show && <Pill at={[l + 0.5, 0, b / 2]} text={`${lab[2]} = ${b} cm`} />}
        </>
      );
    }
    case 'net':
      return (
        <>
          <NetUnfolder l={2} b={2} h={2} unfold={part(t, 0.1, 0.85)} outline={ink} styleFor={(_, i) => ({ color: i % 2 ? accent : hi, opacity: 0.45 })} />
          {t > 0.85 && <Pill at={[1, 0, 4.7]} text="6 □" strong />}
        </>
      );
    case 'unit-cube': {
      const k = part(t, 0.05, 0.5);
      return (
        <>
          <Box l={1} h={1 * k} b={1} color={accent} opacity={0.55} edge={ink} edgeWidth={3} />
          {t > 0.55 && <Pill at={[0.5, 0, 1.45]} text="1 cm" />}
          {t > 0.6 && <Pill at={[1.55, 0.5, 1]} text="1 cm" />}
          {t > 0.65 && <Pill at={[1.5, 0, 0.5]} text="1 cm" />}
          {t > 0.8 && <Pill at={[0.5, 1.8, 0.5]} text="1 cm³" strong />}
        </>
      );
    }
    case 'volume': {
      const count = part(t, 0.05, 0.85) * 27;
      return (
        <>
          <UnitCubeFiller nx={3} ny={3} nz={3} count={count} colors={[accent, hi]} />
          <Pill at={[1.5, 4, 1.5]} text={t > 0.86 ? '3 × 3 × 3 = 27 cm³' : `${Math.floor(count)} cm³`} strong={t > 0.86} />
        </>
      );
    }

    case 'triangle':
      return (
        <>
          <Polygon pts={[g(-3, 1.8), g(3, 1.8), g(0.5, -2.2)]} t={t} color={accent} ink={ink} names={['A', 'B', 'C']} />
          {t > 0.8 && <Pill at={g(0.2, 0.5)} text="3 sides · 180°" strong />}
        </>
      );
    case 'square':
    case 'rectangle':
    case 'diagonal': {
      const [w, d] = id === 'rectangle' ? [6, 3] : [4, 4];
      const x0 = -w / 2;
      const z0 = -d / 2;
      const pts = [g(x0, z0 + d), g(x0 + w, z0 + d), g(x0 + w, z0), g(x0, z0)];
      const marks = t > 0.75 && id !== 'diagonal';
      return (
        <>
          <Polygon pts={pts} t={id === 'diagonal' ? Math.min(1, t * 2.5) : t} color={accent} ink={ink} names={['A', 'B', 'C', 'D']} />
          {marks && (
            <>
              <RightMark c={pts[0]!} u={[1, 0]} v={[0, -1]} color={ink} />
              <RightMark c={pts[1]!} u={[-1, 0]} v={[0, -1]} color={ink} />
              <RightMark c={pts[2]!} u={[-1, 0]} v={[0, 1]} color={ink} />
              <RightMark c={pts[3]!} u={[1, 0]} v={[0, 1]} color={ink} />
              <Pill at={g(0, z0 + d + 0.6)} text={`${w} cm`} />
              <Pill at={g(x0 + w + 0.8, 0)} text={`${d} cm`} />
            </>
          )}
          {id === 'diagonal' && (
            <>
              <Seg p={pts[0]!} q={pts[2]!} k={part(t, 0.4, 0.65)} color={hi} width={4} />
              <Seg p={pts[1]!} q={pts[3]!} k={part(t, 0.65, 0.9)} color={hi} width={4} />
              {t > 0.9 && <Pill at={g(0, -0.6)} text="AC, BD" strong />}
            </>
          )}
        </>
      );
    }
    case 'perimeter': {
      const w = 5;
      const d = 3;
      const pts = [g(-2.5, 1.5), g(2.5, 1.5), g(2.5, -1.5), g(-2.5, -1.5)];
      const sides = [w, d, w, d];
      const walk = part(t, 0.05, 0.85) * 4;
      const i = Math.min(3, Math.floor(walk));
      const pos = lerp(pts[i]!, pts[(i + 1) % 4]!, walk - i);
      const done = sides.slice(0, Math.floor(walk)).reduce((s, x) => s + x, 0);
      return (
        <>
          {pts.map((p, k) => (
            <Seg key={k} p={p} q={pts[(k + 1) % 4]!} color={k < Math.floor(walk) ? accent : muted} width={k < Math.floor(walk) ? 5 : 2} />
          ))}
          <Dot at={[pos[0], 0.15, pos[2]]} color={hi} size={0.22} />
          <Pill at={g(0, 2.2)} text={`${w} cm`} />
          <Pill at={g(3.3, 0)} text={`${d} cm`} />
          <Pill at={g(0, 0)} text={walk >= 3.999 ? `5 + 3 + 5 + 3 = 16 cm` : `${done} cm`} strong={walk >= 3.999} />
        </>
      );
    }
    case 'area': {
      const count = part(t, 0.05, 0.85) * 15;
      return (
        <>
          <Line points={[g(-2.5, -1.5), g(2.5, -1.5), g(2.5, 1.5), g(-2.5, 1.5), g(-2.5, -1.5)]} color={accent} lineWidth={3} />
          <TileFiller nx={5} nz={3} count={count} color={accent} rowColor={hi} origin={[-2.5, 0, -1.5]} />
          <Pill at={g(0, 2.3)} text={t > 0.86 ? '5 × 3 = 15 cm²' : `${Math.floor(count)} cm²`} strong={t > 0.86} />
        </>
      );
    }
    default:
      return null;
  }
}

