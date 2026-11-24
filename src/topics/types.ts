/**
 * Shared types for the topic plugin system.
 * A topic is a folder: src/topics/class-<n>/<topic-id>/ (see docs/ADDING_A_TOPIC.md).
 */

export const LANGS = ['hinglish', 'en', 'hi'] as const;
export type Lang = (typeof LANGS)[number];

/** Every user-facing string a topic ships must exist in all three languages. */
export type LocalizedText = Record<Lang, string>;

export const CLASS_LEVELS = [7, 8, 9] as const;
export type ClassLevel = (typeof CLASS_LEVELS)[number];

export const SHAPE_FAMILIES = ['triangle', 'square', 'rectangle', 'cube'] as const;
/** Visual family (decides accent colour + icon). Cuboid topics live in the "cube" family. */
export type ShapeFamily = (typeof SHAPE_FAMILIES)[number];

export const DIFFICULTIES = ['basic', 'medium', 'hard', 'challenge'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface TopicMeta {
  /** Must equal the folder name. Globally unique, kebab-case. */
  id: string;
  family: ShapeFamily;
  /** The class whose folder the topic lives in (where it is first taught). */
  classLevel: ClassLevel;
  title: LocalizedText;
  /** One or two sentences: what the student will do and see. */
  summary: LocalizedText;
  /**
   * NCERT chapter name per class where this topic is taught.
   * Must contain `classLevel`; other keys make the topic show up in those classes too.
   */
  ncert: Partial<Record<ClassLevel, string>>;
  /** Difficulty levels this topic offers (questions are tagged with these). */
  levels: readonly Difficulty[];
  /** Topic ids worth doing first. */
  prerequisites: readonly string[];
  tags: readonly string[];
  /** Sort order inside its family (lower first). */
  order: number;
  /** Has one of the app's signature animations. */
  signature?: boolean;
}

/** Identity helper so meta.ts files get full type-checking and autocomplete. */
export function defineTopic<const T extends TopicMeta>(meta: T): T {
  return meta;
}
