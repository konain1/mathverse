import { Line } from '@react-three/drei';
import { useMemo } from 'react';
import { add, angleAtDeg, isRightAngle, normalize, scale, sub, type Vec3 } from '@/lib/geometry/vector';
import { LengthLabel } from './LengthLabel';

/**
 * Marks the angle at `vertex` between rays to `a` and `b`:
 * a small square for 90°, otherwise an arc (optionally with its value).
 */
export function AngleMarker({
  vertex,
  a,
  b,
  color,
  size = 0.45,
  showValue = false,
  lineWidth = 1.5,
}: {
  vertex: Vec3;
  a: Vec3;
  b: Vec3;
  color: string;
  size?: number;
  showValue?: boolean;
  lineWidth?: number;
}) {
  const { points, labelPos, deg } = useMemo(() => {
    const u = normalize(sub(a, vertex));
    const v = normalize(sub(b, vertex));
    const deg = angleAtDeg(vertex, a, b);
    if (isRightAngle(deg)) {
      const p1 = add(vertex, scale(u, size));
      const p2 = add(p1, scale(v, size));
      const p3 = add(vertex, scale(v, size));
      return { points: [p1, p2, p3], labelPos: add(vertex, scale(normalize(add(u, v)), size * 2.2)), deg };
    }
    // arc by slerping between u and v
    const steps = 16;
    const pts: Vec3[] = [];
    const theta = (deg * Math.PI) / 180;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const s = Math.sin(theta);
      const w1 = Math.sin((1 - t) * theta) / s;
      const w2 = Math.sin(t * theta) / s;
      pts.push(add(vertex, scale(add(scale(u, w1), scale(v, w2)), size)));
    }
    return { points: pts, labelPos: add(vertex, scale(normalize(add(u, v)), size * 2)), deg };
  }, [vertex, a, b, size]);

  return (
    <>
      <Line points={points as [number, number, number][]} color={color} lineWidth={lineWidth} transparent opacity={0.9} />
      {showValue && <LengthLabel position={labelPos} text={`${Math.round(deg * 10) / 10}°`} tone="ghost" />}
    </>
  );
}
