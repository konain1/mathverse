import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useReducedMotionPref } from '@/hooks/useMediaQuery';

const COLORS = ['rgb(var(--triangle))', 'rgb(var(--square))', 'rgb(var(--rectangle))', 'rgb(var(--cube))'];

/** Lightweight confetti burst made of the four shape colours (and shapes). Skipped with reduced motion. */
export function Confetti({ pieces = 70 }: { pieces?: number }) {
  const reduced = useReducedMotionPref();
  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        x: (Math.random() - 0.5) * 900,
        y: 300 + Math.random() * 400,
        r: Math.random() * 720 - 360,
        d: 1.4 + Math.random() * 1.2,
        delay: Math.random() * 0.25,
        color: COLORS[i % 4]!,
        shape: i % 3,
        size: 7 + Math.random() * 7,
      })),
    [pieces],
  );
  if (reduced) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((p, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/3"
          style={{
            width: p.size,
            height: p.shape === 2 ? p.size * 0.5 : p.size,
            background: p.shape === 1 ? 'transparent' : p.color,
            borderLeft: p.shape === 1 ? `${p.size / 2}px solid transparent` : undefined,
            borderRight: p.shape === 1 ? `${p.size / 2}px solid transparent` : undefined,
            borderBottom: p.shape === 1 ? `${p.size}px solid ${p.color}` : undefined,
            borderRadius: p.shape === 0 ? 2 : 0,
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: [0, -260 - Math.random() * 120, p.y], rotate: p.r, opacity: [1, 1, 0] }}
          transition={{ duration: p.d, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
