import { describe, expect, it } from 'vitest';
import { BASICS_BY_FAMILY, CONCEPTS, CONCEPT_BY_ID } from './concepts';

describe('basics concepts', () => {
  it('every listed concept exists', () => {
    for (const ids of Object.values(BASICS_BY_FAMILY)) for (const id of ids) expect(CONCEPT_BY_ID.has(id), id).toBe(true);
  });
  it('ids are unique', () => {
    expect(CONCEPT_BY_ID.size).toBe(CONCEPTS.length);
  });
  it('has short text in all 3 languages', () => {
    for (const c of CONCEPTS) {
      for (const txt of [c.title, c.example, ...c.lines]) {
        for (const lang of ['hinglish', 'en', 'hi'] as const) {
          expect(txt[lang].trim().length, `${c.id} ${lang}`).toBeGreaterThan(0);
          expect(txt[lang].length, `${c.id} ${lang}: ${txt[lang]}`).toBeLessThanOrEqual(lang === 'hi' ? 110 : 100);
        }
      }
    }
  });
});
