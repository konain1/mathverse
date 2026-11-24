import { describe, expect, it } from 'vitest';
import {
  TOPICS,
  buildRegistry,
  classesFor,
  getTopic,
  topicsByFamily,
  topicsForClass,
  validateRegistry,
} from './registry';
import { NCERT_CHAPTERS } from './ncertChapters';
import { CLASS_LEVELS, SHAPE_FAMILIES, defineTopic } from './types';

describe('topic registry', () => {
  it('discovers every topic folder and none of the template', () => {
    expect(TOPICS.length).toBe(24);
    expect(getTopic('my-topic-id')).toBeUndefined();
  });

  it('has no validation problems', () => {
    expect(validateRegistry([...TOPICS])).toEqual([]);
  });

  it('covers every shape family in every class', () => {
    for (const c of CLASS_LEVELS) {
      const byFamily = topicsByFamily(c);
      for (const f of SHAPE_FAMILIES) expect(byFamily[f].length, `class ${c} / ${f}`).toBeGreaterThan(0);
    }
  });

  it('lists a topic in its own class and in every class with an NCERT chapter', () => {
    const sa = getTopic('cube-surface-area')!;
    expect(classesFor(sa.meta)).toEqual([8, 9]);
    expect(topicsForClass(9).map((t) => t.meta.id)).toContain('cube-surface-area');
    expect(topicsForClass(7).map((t) => t.meta.id)).not.toContain('cube-surface-area');
  });

  it('every NCERT chapter used by a topic has a translated name', () => {
    for (const { meta } of TOPICS) {
      for (const chapter of Object.values(meta.ncert)) {
        expect(NCERT_CHAPTERS[chapter!], `${meta.id}: "${chapter}"`).toBeDefined();
      }
    }
  });

  it('sorts by family then order', () => {
    const fams = TOPICS.map((t) => SHAPE_FAMILIES.indexOf(t.meta.family));
    expect(fams).toEqual([...fams].sort((a, b) => a - b));
  });

  it('detects broken metadata', () => {
    const bad = defineTopic({
      id: 'wrong-id',
      family: 'square',
      classLevel: 8,
      title: { hinglish: 'x', en: 'x', hi: '' },
      summary: { hinglish: 'x', en: 'x', hi: 'x' },
      ncert: { 7: 'Perimeter and Area' },
      levels: [],
      prerequisites: ['missing-topic'],
      tags: [],
      order: 1,
    });
    const entries = buildRegistry(
      { './class-7/some-folder/meta.ts': { meta: bad } },
      { questions: {}, buildSteps: {}, solutionSteps: {}, Scene: {} },
    );
    const problems = validateRegistry(entries).join('\n');
    expect(problems).toMatch(/must equal folder name/);
    expect(problems).toMatch(/does not match folder/);
    expect(problems).toMatch(/ncert must name a chapter for class 8/);
    expect(problems).toMatch(/at least one level/);
    expect(problems).toMatch(/title\.hi is empty/);
    expect(problems).toMatch(/unknown prerequisite "missing-topic"/);
  });

  it('marks a topic playable only when all modules exist', () => {
    const meta = getTopic('cube-volume')!.meta;
    const loader = () => Promise.resolve({});
    const partial = buildRegistry(
      { './class-8/cube-volume/meta.ts': { meta } },
      { questions: { './class-8/cube-volume/questions.ts': loader }, buildSteps: {}, solutionSteps: {}, Scene: {} },
    );
    expect(partial[0]!.modules.questions).toBe(true);
    expect(partial[0]!.playable).toBe(false);
  });
});
