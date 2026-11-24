import { Html, Segment, Segments } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { usePalette } from '@/design/palette';
import { useReducedMotionPref } from '@/hooks/useMediaQuery';
import {
  CM_PER_UNIT,
  EDGES,
  FACE_INDEX,
  LABELLED_EDGES,
  easeInOutCubic,
  shapePositions,
  type MorphShapeKey,
} from './morphShapes';

const FAMILY_OF: Record<MorphShapeKey, 'cube' | 'triangle' | 'square' | 'rectangle'> = {
  cube: 'cube',
  triangle: 'triangle',
  square: 'square',
  rectangle: 'rectangle',
};

type LabelKey = keyof typeof LABELLED_EDGES;
const LABEL_KEYS = Object.keys(LABELLED_EDGES) as LabelKey[];
/** Push each label off its edge so it doesn't sit on the line. */
const LABEL_OFFSET: Record<LabelKey, THREE.Vector3Tuple> = {
  front: [0, 0, 0.38],
  side: [0.42, 0, 0],
  height: [-0.45, 0, 0.2],
};

interface SegmentLike {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: THREE.Color;
}

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

export interface MorphShapeProps {
  shape: MorphShapeKey;
  /** Live "4 cm" labels on the front, side and height edges. */
  labels?: boolean;
  /** Seconds per morph. */
  duration?: number;
  lineWidth?: number;
  /** Slowly turn the model itself (for previews without OrbitControls). */
  spin?: boolean;
}

/**
 * Blueprint-style solid: translucent faces, glowing edges, vertex dots and
 * live length labels. Changing `shape` tweens every vertex to the new shape.
 */
export function MorphShape({ shape, labels = false, duration = 1.1, lineWidth = 2.5, spin = false }: MorphShapeProps) {
  const { shape: shapeColors, scene, theme } = usePalette();
  const reduced = useReducedMotionPref();
  const targetColor = shapeColors[FAMILY_OF[shape]];

  const anim = useRef({
    from: shapePositions(shape),
    to: shapePositions(shape),
    cur: shapePositions(shape),
    fromColor: new THREE.Color(targetColor),
    toColor: new THREE.Color(targetColor),
    color: new THREE.Color(targetColor),
    t: 1,
    dirty: true,
  });

  useEffect(() => {
    const a = anim.current;
    a.from = a.cur.slice();
    a.to = shapePositions(shape);
    a.fromColor.copy(a.color);
    a.toColor.set(targetColor);
    a.t = reduced ? 1 : 0;
    if (reduced) {
      a.cur = a.to.slice();
      a.color.copy(a.toColor);
    }
    a.dirty = true;
  }, [shape, targetColor, reduced]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(24), 3));
    g.setIndex([...FACE_INDEX]);
    return g;
  }, []);
  const faceMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: theme === 'dark' ? 0.14 : 0.18,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [theme],
  );
  const dotGeometry = useMemo(() => new THREE.SphereGeometry(0.065, 16, 12), []);
  const dotMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: scene.ink }), [scene.ink]);
  const glowTexture = useMemo(makeGlowTexture, []);
  useEffect(
    () => () => {
      geometry.dispose();
      dotGeometry.dispose();
      glowTexture.dispose();
    },
    [geometry, dotGeometry, glowTexture],
  );
  useEffect(() => () => faceMaterial.dispose(), [faceMaterial]);
  useEffect(() => () => dotMaterial.dispose(), [dotMaterial]);

  const groupRef = useRef<THREE.Group>(null);
  const glowMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const segRefs = useRef<(SegmentLike | null)[]>([]);
  const dotRefs = useRef<(THREE.Mesh | null)[]>([]);
  const labelGroups = useRef<Partial<Record<LabelKey, THREE.Group | null>>>({});
  const labelText = useRef<Partial<Record<LabelKey, HTMLSpanElement | null>>>({});

  useFrame((_, dt) => {
    const a = anim.current;
    if (spin && !reduced && groupRef.current) groupRef.current.rotation.y += dt * 0.35;
    if (a.t < 1) {
      a.t = Math.min(1, a.t + dt / duration);
      const e = easeInOutCubic(a.t);
      for (let i = 0; i < 24; i++) a.cur[i] = a.from[i]! + (a.to[i]! - a.from[i]!) * e;
      a.color.lerpColors(a.fromColor, a.toColor, e);
      a.dirty = true;
    }
    if (!a.dirty) return;
    a.dirty = false;

    const p = a.cur;
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
    (attr.array as Float32Array).set(p);
    attr.needsUpdate = true;
    faceMaterial.color.copy(a.color);
    glowMatRef.current?.color.copy(a.color);

    EDGES.forEach(([i, j], k) => {
      const s = segRefs.current[k];
      if (!s) return;
      s.start.set(p[i * 3]!, p[i * 3 + 1]!, p[i * 3 + 2]!);
      s.end.set(p[j * 3]!, p[j * 3 + 1]!, p[j * 3 + 2]!);
      s.color.copy(a.color);
    });
    dotRefs.current.forEach((m, i) => m?.position.set(p[i * 3]!, p[i * 3 + 1]!, p[i * 3 + 2]!));

    if (labels) {
      for (const key of LABEL_KEYS) {
        const [i, j] = LABELLED_EDGES[key];
        const g = labelGroups.current[key];
        const el = labelText.current[key];
        if (!g || !el) continue;
        const ax = p[i * 3]!, ay = p[i * 3 + 1]!, az = p[i * 3 + 2]!;
        const bx = p[j * 3]!, by = p[j * 3 + 1]!, bz = p[j * 3 + 2]!;
        const off = LABEL_OFFSET[key];
        g.position.set((ax + bx) / 2 + off[0], (ay + by) / 2 + off[1], (az + bz) / 2 + off[2]);
        const cm = Math.hypot(ax - bx, ay - by, az - bz) * CM_PER_UNIT;
        el.textContent = `${cm.toFixed(cm % 1 < 0.05 || cm % 1 > 0.95 ? 0 : 1)} cm`;
        el.style.opacity = cm < 0.3 ? '0' : '1';
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* soft accent glow on the floor */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.002}>
        <planeGeometry args={[6, 6]} />
        <meshBasicMaterial
          ref={glowMatRef}
          map={glowTexture}
          transparent
          opacity={scene.glowOpacity}
          depthWrite={false}
        />
      </mesh>

      <mesh geometry={geometry} material={faceMaterial} frustumCulled={false} />

      <Segments limit={EDGES.length} lineWidth={lineWidth}>
        {EDGES.map((_, k) => (
          <Segment
            key={k}
            ref={(el) => {
              segRefs.current[k] = el as unknown as SegmentLike | null;
            }}
            start={[0, 0, 0]}
            end={[0, 0, 0]}
            color={targetColor}
          />
        ))}
      </Segments>

      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            dotRefs.current[i] = m;
          }}
          geometry={dotGeometry}
          material={dotMaterial}
        />
      ))}

      {labels &&
        LABEL_KEYS.map((key) => (
          <group
            key={key}
            ref={(g) => {
              labelGroups.current[key] = g;
            }}
          >
            <Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
              <span
                ref={(el) => {
                  labelText.current[key] = el;
                }}
                className="num whitespace-nowrap rounded-full border border-line/80 bg-bg/80 px-2 py-0.5 text-xs font-semibold text-ink shadow-lift backdrop-blur transition-opacity duration-300"
              />
            </Html>
          </group>
        ))}
    </group>
  );
}
