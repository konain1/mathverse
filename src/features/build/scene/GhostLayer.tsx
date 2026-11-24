import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { faceVertices, findPointAt, neighbours, pointPos } from '@/lib/geometry/construction';
import { findOpenLoops } from '@/lib/geometry/loops';
import { pointInPolygon } from '@/lib/geometry/polygon';
import { add, distance, equals, midpoint, scale, type Vec3 } from '@/lib/geometry/vector';
import { useReducedMotionPref } from '@/hooks/useMediaQuery';
import { useBuild } from '../BuildProvider';
import { extrudeAxis, selectConstruction } from '../store';
import { AngleMarker } from './AngleMarker';
import { formatCm } from './labels';
import { LengthLabel } from './LengthLabel';
import type { BuildColors } from './useSceneColors';

type P = [number, number, number];

function Pulse({ at, color }: { at: Vec3; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const reduced = useReducedMotionPref();
  useFrame(({ clock }) => {
    if (!ref.current || reduced) return;
    ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 5) * 0.15);
  });
  return (
    <group position={at as P}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.17, 20, 14]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.28, 0.36, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function GhostFill({ pts, color, opacity = 0.18 }: { pts: Vec3[]; color: string; opacity?: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos: number[] = [];
    for (let i = 1; i < pts.length - 1; i++) pos.push(...pts[0]!, ...pts[i]!, ...pts[i + 1]!);
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, [pts]);
  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function GhostSegment({ a, b, color, label = true }: { a: Vec3; b: Vec3; color: string; label?: boolean }) {
  if (equals(a, b)) return null;
  return (
    <>
      <Line points={[a as P, b as P]} color={color} lineWidth={2.4} dashed dashSize={0.25} gapSize={0.15} />
      {label && <LengthLabel position={add(midpoint(a, b), [0, 0.35, 0])} text={formatCm(distance(a, b))} tone="ghost" />}
    </>
  );
}

/** Live preview of what the current tool will do: ghost point, line, face, push-pull or move. */
export function GhostLayer({ colors }: { colors: BuildColors }) {
  const c = useBuild(selectConstruction);
  const tool = useBuild((s) => s.tool);
  const draft = useBuild((s) => s.draft);
  const hover = useBuild((s) => s.hover);
  const loops = useMemo(() => findOpenLoops(c), [c]);
  const color = colors.accent;

  // Extrude preview
  if (draft?.kind === 'extrude') {
    const base = faceVertices(c, draft.faceId);
    if (draft.height === 0) return null;
    const off = scale(extrudeAxis(c, draft.faceId), draft.height);
    const top = base.map((p) => add(p, off));
    return (
      <group>
        <GhostFill pts={top} color={color} opacity={0.22} />
        <Line points={[...top, top[0]!] as P[]} color={color} lineWidth={2.4} dashed dashSize={0.25} gapSize={0.15} />
        {base.map((p, i) => (
          <Line key={i} points={[p as P, top[i] as P]} color={color} lineWidth={2} dashed dashSize={0.25} gapSize={0.15} />
        ))}
        <LengthLabel
          position={add(midpoint(base[0]!, top[0]!), [-0.5, 0, -0.5])}
          text={formatCm(Math.abs(draft.height))}
          tone="ghost"
        />
      </group>
    );
  }

  if (!hover || tool === 'rotate') return null;
  const at = hover.pos;

  // Move preview: the point and its edges follow the pointer
  if (draft?.kind === 'move') {
    return (
      <group>
        <Pulse at={at} color={color} />
        {neighbours(c, draft.pointId).map((n) => (
          <GhostSegment key={n} a={pointPos(c, n)} b={at} color={color} />
        ))}
      </group>
    );
  }

  if (tool === 'line' && draft?.kind === 'line') {
    const start = draft.start.pos;
    const startId = draft.start.pointId ?? findPointAt(c, start);
    return (
      <group>
        <Pulse at={at} color={color} />
        <GhostSegment a={start} b={at} color={color} />
        {/* live angle markers against edges already at the start point */}
        {startId &&
          !equals(start, at) &&
          neighbours(c, startId).map((n) => (
            <AngleMarker key={n} vertex={start} a={pointPos(c, n)} b={at} color={colors.ink} size={0.5} showValue />
          ))}
      </group>
    );
  }

  if (tool === 'face') {
    const picks = draft?.kind === 'face' ? draft.picks.map((p) => p.pos) : [];
    if (picks.length === 0 && !hover.pointId) {
      const loop = loops.find((l) => pointInPolygon(at, l.map((id) => pointPos(c, id))));
      if (loop) return <GhostFill pts={loop.map((id) => pointPos(c, id))} color={color} opacity={0.3} />;
    }
    const chain = [...picks, at];
    return (
      <group>
        <Pulse at={at} color={color} />
        {chain.length >= 3 && <GhostFill pts={chain} color={color} />}
        {chain.slice(1).map((p, i) => (
          <GhostSegment key={i} a={chain[i]!} b={p} color={color} />
        ))}
        {chain.length >= 3 && <GhostSegment a={at} b={chain[0]!} color={color} label={false} />}
      </group>
    );
  }

  if (tool === 'extrude') return hover.faceId ? null : <Pulse at={at} color={colors.muted} />;

  if (tool === 'point' || tool === 'line' || tool === 'move') {
    if (tool === 'move' && !hover.pointId) return null;
    return <Pulse at={at} color={color} />;
  }
  return null;
}

/** Guided-mode hint: where the next point/line should go (pulsing, dashed). */
export interface GuideOverlay {
  points?: Vec3[];
  segments?: [Vec3, Vec3][];
}

export function GuideLayer({ guide, colors }: { guide?: GuideOverlay; colors: BuildColors }) {
  if (!guide) return null;
  return (
    <group>
      {guide.points?.map((p, i) => <Pulse key={`p${i}`} at={p} color={colors.ok} />)}
      {guide.segments?.map(([a, b], i) => (
        <Line key={`s${i}`} points={[a as P, b as P]} color={colors.ok} lineWidth={2} dashed dashSize={0.2} gapSize={0.2} transparent opacity={0.8} />
      ))}
    </group>
  );
}
