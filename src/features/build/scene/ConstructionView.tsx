import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { memo, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { edgeLength, pointPos, type Construction } from '@/lib/geometry/construction';
import { centroid } from '@/lib/geometry/polygon';
import { add, angleAtDeg, isRightAngle, midpoint, normalize, scale, sub, type Vec3 } from '@/lib/geometry/vector';
import { useReducedMotionPref } from '@/hooks/useMediaQuery';
import { useBuild } from '../BuildProvider';
import { highlightedIds, selectConstruction } from '../store';
import { formatCm } from './labels';
import { LengthLabel } from './LengthLabel';
import type { BuildColors } from './useSceneColors';

/** Grows a freshly created entity from 0 → 1 so the student sees what changed. */
function PopIn({ active, children, at }: { active: boolean; children: React.ReactNode; at: Vec3 }) {
  const ref = useRef<THREE.Group>(null);
  const reduced = useReducedMotionPref();
  // decided once, on mount: re-renders (e.g. hover) must not restart the animation
  const t = useRef(active && !reduced ? 0 : 1);
  useLayoutEffect(() => {
    if (t.current < 1) ref.current?.scale.setScalar(0.001);
  }, []);
  useFrame((_, dt) => {
    if (!ref.current || t.current >= 1) return;
    t.current = Math.min(1, t.current + dt / 0.28);
    const k = 1 - (1 - t.current) ** 3;
    ref.current.scale.setScalar(0.001 + k * 0.999);
  });
  return (
    <group position={at as [number, number, number]}>
      <group ref={ref}>{children}</group>
    </group>
  );
}

function FaceMesh({ pts, color, opacity }: { pts: Vec3[]; color: string; opacity: number }) {
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

/** All right angles between edges meeting at a point, as one batched line object. */
function RightAngleMarkers({ c, color }: { c: Construction; color: string }) {
  const geometry = useMemo(() => {
    const segs: number[] = [];
    for (const p of Object.values(c.points)) {
      const others = Object.values(c.edges)
        .filter((e) => e.a === p.id || e.b === p.id)
        .map((e) => pointPos(c, e.a === p.id ? e.b : e.a));
      for (let i = 0; i < others.length; i++)
        for (let j = i + 1; j < others.length; j++) {
          if (!isRightAngle(angleAtDeg(p.pos, others[i]!, others[j]!))) continue;
          const u = normalize(sub(others[i]!, p.pos));
          const v = normalize(sub(others[j]!, p.pos));
          const s = 0.35;
          const p1 = add(p.pos, scale(u, s));
          const p2 = add(p1, scale(v, s));
          const p3 = add(p.pos, scale(v, s));
          segs.push(...p1, ...p2, ...p2, ...p3);
        }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
    return g;
  }, [c]);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.75} />
    </lineSegments>
  );
}

export const ConstructionView = memo(function ConstructionView({ colors }: { colors: BuildColors }) {
  const c = useBuild(selectConstruction);
  const feedback = useBuild((s) => s.feedback);
  const lastCreated = useBuild((s) => s.lastCreated);
  const tool = useBuild((s) => s.tool);
  const hover = useBuild((s) => s.hover);
  const draft = useBuild((s) => s.draft);

  const bad = useMemo(() => highlightedIds(feedback), [feedback]);
  const fresh = useMemo(() => new Set(lastCreated), [lastCreated]);
  const centre = useMemo(() => centroid(Object.values(c.points).map((p) => p.pos)), [c]);
  const activeFace =
    draft?.kind === 'extrude' ? draft.faceId : tool === 'extrude' || tool === 'face' ? hover?.faceId : undefined;
  const movingPoint = draft?.kind === 'move' ? draft.pointId : undefined;

  return (
    <group>
      {Object.values(c.faces).map((f) => {
        const pts = f.points.map((id) => pointPos(c, id));
        const isBad = bad.has(f.id);
        const isActive = activeFace === f.id;
        return (
          <FaceMesh
            key={f.id}
            pts={pts}
            color={isBad ? colors.bad : colors.accent}
            opacity={isBad ? 0.32 : isActive ? 0.38 : 0.16}
          />
        );
      })}

      {Object.values(c.edges).map((e) => {
        const a = pointPos(c, e.a);
        const b = pointPos(c, e.b);
        const isBad = bad.has(e.id) || (bad.has(e.a) && bad.has(e.b));
        const mid = midpoint(a, b);
        // push the label away from the figure's centre so it doesn't sit on the line;
        // edges through the centre (diagonals) get pushed sideways instead, so their labels don't collide
        const away = normalize([mid[0] - centre[0], 0, mid[2] - centre[2]]);
        const side = normalize([-(b[2] - a[2]), 0, b[0] - a[0]]);
        const dir: Vec3 = away[0] || away[2] ? away : side[0] || side[2] ? side : [0, 0, 1];
        const labelPos = add(mid, scale(dir, 0.42));
        return (
          <group key={e.id}>
            <Line
              points={[a as [number, number, number], b as [number, number, number]]}
              color={isBad ? colors.bad : colors.accent}
              lineWidth={isBad ? 4 : 2.6}
              transparent={e.a === movingPoint || e.b === movingPoint}
              opacity={e.a === movingPoint || e.b === movingPoint ? 0.25 : 1}
            />
            <LengthLabel position={labelPos} text={formatCm(edgeLength(c, e.id))} tone={isBad ? 'bad' : 'default'} />
          </group>
        );
      })}

      <RightAngleMarkers c={c} color={colors.ink} />

      {Object.values(c.points).map((p) => {
        const isBad = bad.has(p.id);
        const isHover = hover?.pointId === p.id;
        return (
          <PopIn key={p.id} active={fresh.has(p.id)} at={p.pos}>
            <mesh scale={isHover ? 1.5 : 1}>
              <sphereGeometry args={[0.13, 20, 14]} />
              <meshBasicMaterial color={isBad ? colors.bad : colors.ink} />
            </mesh>
          </PopIn>
        );
      })}
    </group>
  );
});
