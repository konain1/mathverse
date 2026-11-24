import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { locate, stepStart, totalDuration } from './timeline';

export const SPEEDS = [0.5, 1, 2] as const;
export type Speed = (typeof SPEEDS)[number];

/**
 * Step player state. Play runs straight through all steps; Next/Prev jump to a
 * step and play just that one. Time is the single source of truth, so the
 * scrubber, speed and every animation stay in sync.
 */
export function usePlayer(durations: number[], autoplay: boolean) {
  const total = useMemo(() => totalDuration(durations), [durations]);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [speed, setSpeed] = useState<Speed>(1);
  const stopAt = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      let done = false;
      setTime((t) => {
        const limit = stopAt.current ?? total;
        const next = Math.min(limit, t + dt * speed);
        if (next >= limit) done = true;
        return next;
      });
      if (done) {
        stopAt.current = null;
        setPlaying(false);
      } else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, total]);

  const { index, t } = locate(durations, time);

  const playStep = useCallback(
    (i: number) => {
      const k = Math.max(0, Math.min(durations.length - 1, i));
      setTime(stepStart(durations, k));
      stopAt.current = stepStart(durations, k + 1);
      setPlaying(true);
    },
    [durations],
  );

  return {
    time,
    total,
    index,
    t,
    playing,
    speed,
    setSpeed,
    toggle: () => {
      if (playing) setPlaying(false);
      else {
        stopAt.current = null;
        if (time >= total - 1e-6) setTime(0);
        setPlaying(true);
      }
    },
    next: () => playStep(index + 1),
    prev: () => playStep(t > 0.15 ? index : index - 1),
    goTo: playStep,
    seek: (s: number) => {
      stopAt.current = null;
      setPlaying(false);
      setTime(Math.max(0, Math.min(total, s)));
    },
  };
}
export type Player = ReturnType<typeof usePlayer>;
