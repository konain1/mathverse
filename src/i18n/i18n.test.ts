import { describe, expect, it } from 'vitest';
import { interpolate, messages, translate } from './index';
import { LANGS } from '@/topics/types';

function leaves(obj: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out[key] = v;
    else Object.assign(out, leaves(v, key));
  }
  return out;
}

describe('i18n', () => {
  const source = leaves(messages.hinglish);

  it.each(LANGS)('%s has every key, no empty strings, same placeholders', (lang) => {
    const target = leaves(messages[lang]);
    expect(Object.keys(target).sort()).toEqual(Object.keys(source).sort());
    for (const [key, value] of Object.entries(target)) {
      expect(value.trim(), key).not.toBe('');
      const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
      expect(ph(value), key).toEqual(ph(source[key]!));
    }
  });

  it('Hindi locale is actually Devanagari', () => {
    expect(translate('hi', 'shapes.triangle')).toBe('त्रिभुज');
    expect(translate('hi', 'shapes.cubeSingle')).toBe('घन');
    expect(translate('hi', 'shapes.rectangle')).toBe('आयत');
    expect(translate('hi', 'shapes.square')).toBe('वर्ग');
  });

  it('interpolates and leaves unknown placeholders intact', () => {
    expect(translate('en', 'landing.topicsTitle', { n: 8 })).toBe('Class 8 topics');
    expect(interpolate('{a} + {b}', { a: 1 })).toBe('1 + {b}');
  });
});

import { ISSUE_CODES } from '@/lib/geometry/validators';

describe('build messages', () => {
  const OP_ERRORS = [
    'same-point', 'edge-exists', 'point-exists', 'point-occupied', 'face-too-few', 'face-collinear',
    'face-not-planar', 'face-not-convex', 'face-exists', 'zero-extrude', 'unknown-entity', 'below-ground',
  ] as const;
  it.each(LANGS)('%s explains every validator issue and every failed action', (lang) => {
    const issues = messages[lang].build.issues as Record<string, string>;
    const errors = messages[lang].build.errors as Record<string, string>;
    for (const code of ISSUE_CODES) expect(issues[code], code).toBeTruthy();
    for (const e of OP_ERRORS) expect(errors[e], e).toBeTruthy();
  });
  it('the spec example reads naturally', () => {
    expect(translate('hinglish', 'build.issues.side-mismatch', { actual: 3, expected: 4, shape: 'Cube' })).toBe(
      'Ye side 3 cm hai, baaki 4 cm. Cube mein saari sides barabar hoti hain.',
    );
  });
});
