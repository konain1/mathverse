/** Saved progress: same shape as the app's progress store. Merging never loses a better result. */
export interface Progress {
  stars: Record<string, Record<string, number>>;
  built: Record<string, Record<string, true>>;
  watched: Record<string, Record<string, true>>;
}

export const emptyProgress = (): Progress => ({ stars: {}, built: {}, watched: {} });

const ID = /^[a-z0-9-]{1,64}$/;
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

/** Keeps only well-formed entries (ids like "cube-volume", stars 0–3). */
export function cleanProgress(input: unknown): Progress {
  const out = emptyProgress();
  if (!isObj(input)) return out;
  for (const key of ['stars', 'built', 'watched'] as const) {
    const m = input[key];
    if (!isObj(m)) continue;
    for (const [topic, qs] of Object.entries(m)) {
      if (!ID.test(topic) || !isObj(qs)) continue;
      for (const [q, v] of Object.entries(qs)) {
        if (!ID.test(q)) continue;
        if (key === 'stars') {
          if (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 3) (out.stars[topic] ??= {})[q] = v;
        } else if (v === true) {
          (out[key][topic] ??= {})[q] = true;
        }
      }
    }
  }
  return out;
}

export function mergeProgress(a: Progress, b: Progress): Progress {
  const out: Progress = structuredClone(a);
  for (const [t, qs] of Object.entries(b.stars))
    for (const [q, n] of Object.entries(qs)) {
      if (n > (out.stars[t]?.[q] ?? 0)) (out.stars[t] ??= {})[q] = n;
    }
  for (const key of ['built', 'watched'] as const)
    for (const [t, qs] of Object.entries(b[key])) for (const q of Object.keys(qs)) (out[key][t] ??= {})[q] = true;
  return out;
}
