import type { hinglish } from './locales/hinglish';

/** Shape of every locale. Hinglish is the source; en/hi must match it exactly (TS enforces this). */
export type Messages = typeof hinglish;

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

/** Dotted key into the messages, e.g. "landing.heroTitle". Typos are compile errors. */
export type MessageKey = Leaves<Messages>;
export type MessageVars = Record<string, string | number>;
