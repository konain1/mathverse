/**
 * Topic registry. Auto-discovers every folder under src/topics/class-<n>/<id>/.
 * Adding a topic = adding a folder; nothing in here needs editing.
 *
 * - meta.ts is loaded eagerly (tiny: titles, tags, class) so menus render instantly.
 * - questions / buildSteps / solutionSteps / Scene are lazy chunks, fetched only
 *   when a student opens that topic.
 */
import {
  CLASS_LEVELS,
  DIFFICULTIES,
  LANGS,
  SHAPE_FAMILIES,
  type ClassLevel,
  type ShapeFamily,
  type TopicMeta,
} from './types';

export const TOPIC_MODULE_KINDS = ['questions', 'buildSteps', 'solutionSteps', 'Scene'] as const;
export type TopicModuleKind = (typeof TOPIC_MODULE_KINDS)[number];

type Loader = () => Promise<unknown>;

const metaModules = import.meta.glob<{ meta: TopicMeta }>('./class-*/*/meta.ts', { eager: true });
const lazyModules: Record<TopicModuleKind, Record<string, Loader>> = {
  questions: import.meta.glob('./class-*/*/questions.ts'),
  buildSteps: import.meta.glob('./class-*/*/buildSteps.ts'),
  solutionSteps: import.meta.glob('./class-*/*/solutionSteps.ts'),
  Scene: import.meta.glob('./class-*/*/Scene.tsx'),
};

export interface RegisteredTopic {
  meta: TopicMeta;
  /** e.g. "class-8/cube-surface-area" */
  folder: string;
  /** Which lazy modules exist for this topic. */
  modules: Record<TopicModuleKind, boolean>;
  /** True once the topic ships every module (build + solve + try). */
  playable: boolean;
}

const FILE_EXT: Record<TopicModuleKind, string> = {
  questions: 'ts',
  buildSteps: 'ts',
  solutionSteps: 'ts',
  Scene: 'tsx',
};

function modulePath(folder: string, kind: TopicModuleKind) {
  return `./${folder}/${kind}.${FILE_EXT[kind]}`;
}

/** Pure: turns glob results into registry entries. Exported for tests. */
export function buildRegistry(
  metas: Record<string, { meta: TopicMeta }>,
  lazy: Record<TopicModuleKind, Record<string, Loader>>,
): RegisteredTopic[] {
  return Object.entries(metas)
    .map(([path, mod]) => {
      const folder = path.replace(/^\.\//, '').replace(/\/meta\.ts$/, '');
      const modules = Object.fromEntries(
        TOPIC_MODULE_KINDS.map((k) => [k, modulePath(folder, k) in lazy[k]]),
      ) as Record<TopicModuleKind, boolean>;
      return {
        meta: mod.meta,
        folder,
        modules,
        playable: TOPIC_MODULE_KINDS.every((k) => modules[k]),
      };
    })
    .sort(
      (a, b) =>
        SHAPE_FAMILIES.indexOf(a.meta.family) - SHAPE_FAMILIES.indexOf(b.meta.family) ||
        a.meta.order - b.meta.order ||
        a.meta.id.localeCompare(b.meta.id),
    );
}

/** Pure: returns human-readable problems (empty array = healthy). Exported for tests. */
export function validateRegistry(entries: RegisteredTopic[]): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const { meta, folder } of entries) {
    const [classDir, idDir] = folder.split('/');
    const where = `[${folder}]`;
    if (meta.id !== idDir) problems.push(`${where} meta.id "${meta.id}" must equal folder name "${idDir}"`);
    if (classDir !== `class-${meta.classLevel}`)
      problems.push(`${where} classLevel ${meta.classLevel} does not match folder "${classDir}"`);
    if (ids.has(meta.id)) problems.push(`${where} duplicate topic id "${meta.id}"`);
    ids.add(meta.id);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(meta.id)) problems.push(`${where} id must be kebab-case`);
    if (!SHAPE_FAMILIES.includes(meta.family)) problems.push(`${where} unknown family "${meta.family}"`);
    if (!meta.ncert[meta.classLevel]) problems.push(`${where} ncert must name a chapter for class ${meta.classLevel}`);
    for (const c of Object.keys(meta.ncert)) {
      if (!CLASS_LEVELS.includes(Number(c) as ClassLevel)) problems.push(`${where} ncert has unknown class ${c}`);
    }
    if (meta.levels.length === 0) problems.push(`${where} needs at least one level`);
    for (const l of meta.levels) if (!DIFFICULTIES.includes(l)) problems.push(`${where} unknown level "${l}"`);
    for (const field of ['title', 'summary'] as const) {
      for (const lang of LANGS) {
        if (!meta[field][lang]?.trim()) problems.push(`${where} ${field}.${lang} is empty`);
      }
    }
  }
  for (const { meta, folder } of entries) {
    for (const p of meta.prerequisites) {
      if (p === meta.id) problems.push(`[${folder}] lists itself as a prerequisite`);
      else if (!ids.has(p)) problems.push(`[${folder}] unknown prerequisite "${p}"`);
    }
  }
  // Prerequisite cycles would make "do this first" advice loop forever.
  const byId = new Map(entries.map((e) => [e.meta.id, e.meta]));
  const state = new Map<string, 'visiting' | 'done'>();
  const visit = (id: string, trail: string[]): void => {
    if (state.get(id) === 'done') return;
    if (state.get(id) === 'visiting') {
      problems.push(`prerequisite cycle: ${[...trail, id].join(' → ')}`);
      return;
    }
    state.set(id, 'visiting');
    for (const p of byId.get(id)?.prerequisites ?? []) if (byId.has(p)) visit(p, [...trail, id]);
    state.set(id, 'done');
  };
  for (const id of byId.keys()) visit(id, []);
  return problems;
}

export const TOPICS: readonly RegisteredTopic[] = buildRegistry(metaModules, lazyModules);

if (import.meta.env.DEV) {
  const problems = validateRegistry([...TOPICS]);
  if (problems.length) console.warn(`[topics] ${problems.length} problem(s):\n` + problems.join('\n'));
}

const BY_ID = new Map(TOPICS.map((t) => [t.meta.id, t]));

export function getTopic(id: string): RegisteredTopic | undefined {
  return BY_ID.get(id);
}

/** Classes where a topic is taught (its own class + any other class with an NCERT chapter). */
export function classesFor(meta: TopicMeta): ClassLevel[] {
  return CLASS_LEVELS.filter((c) => c === meta.classLevel || Boolean(meta.ncert[c]));
}

export function topicsForClass(c: ClassLevel): RegisteredTopic[] {
  return TOPICS.filter((t) => classesFor(t.meta).includes(c));
}

export function topicsByFamily(c: ClassLevel): Record<ShapeFamily, RegisteredTopic[]> {
  const out = Object.fromEntries(SHAPE_FAMILIES.map((f) => [f, [] as RegisteredTopic[]])) as Record<
    ShapeFamily,
    RegisteredTopic[]
  >;
  for (const t of topicsForClass(c)) out[t.meta.family].push(t);
  return out;
}

/** Lazy-load one module of a topic (e.g. its Scene). Rejects if the topic doesn't ship it. */
export function loadTopicModule<T = unknown>(id: string, kind: TopicModuleKind): Promise<T> {
  const topic = BY_ID.get(id);
  const loader = topic && lazyModules[kind][modulePath(topic.folder, kind)];
  if (!loader) return Promise.reject(new Error(`Topic "${id}" has no ${kind} module`));
  return loader() as Promise<T>;
}
