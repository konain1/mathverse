import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { appStorage, storageKey } from './storage';

/**
 * Learning progress (v1: this device only). Keyed by topic id → question id.
 * Phase 6 adds XP, streaks and mastery on top of these records.
 */
interface ProgressState {
  /** best stars per question from "Try yourself" */
  stars: Record<string, Record<string, number>>;
  /** questions whose figure the student has built correctly */
  built: Record<string, Record<string, true>>;
  /** questions whose solution was watched to the end */
  watched: Record<string, Record<string, true>>;
  recordStars: (topicId: string, questionId: string, stars: number) => void;
  markBuilt: (topicId: string, questionId: string) => void;
  markWatched: (topicId: string, questionId: string) => void;
}

const set2 = <T,>(m: Record<string, Record<string, T>>, a: string, b: string, v: T) => ({ ...m, [a]: { ...m[a], [b]: v } });

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      stars: {},
      built: {},
      watched: {},
      recordStars: (t, q, n) =>
        set((s) => ((s.stars[t]?.[q] ?? 0) >= n ? s : { stars: set2(s.stars, t, q, n) })),
      markBuilt: (t, q) => set((s) => (s.built[t]?.[q] ? s : { built: set2(s.built, t, q, true as const) })),
      markWatched: (t, q) => set((s) => (s.watched[t]?.[q] ? s : { watched: set2(s.watched, t, q, true as const) })),
    }),
    { name: storageKey('progress'), storage: appStorage, version: 1 },
  ),
);
