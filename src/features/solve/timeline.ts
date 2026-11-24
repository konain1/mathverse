/** Pure timeline maths for the step player (unit-tested). */
export function totalDuration(durations: readonly number[]): number {
  return durations.reduce((s, d) => s + d, 0);
}

export function stepStart(durations: readonly number[], index: number): number {
  return totalDuration(durations.slice(0, index));
}

/** Which step a global time falls in, and how far through it (0–1). */
export function locate(durations: readonly number[], time: number): { index: number; t: number } {
  const total = totalDuration(durations);
  const clamped = Math.max(0, Math.min(total, time));
  let acc = 0;
  for (let i = 0; i < durations.length; i++) {
    const d = durations[i]!;
    if (clamped < acc + d || i === durations.length - 1) return { index: i, t: d > 0 ? Math.min(1, (clamped - acc) / d) : 1 };
    acc += d;
  }
  return { index: 0, t: 0 };
}

/** Eases a 0–1 value. */
export const easeInOut = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
};

/** Progress of a sub-phase [from, to] inside a step's 0–1 time. */
export const phase = (t: number, from: number, to: number) => Math.max(0, Math.min(1, (t - from) / (to - from)));
