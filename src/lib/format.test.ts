import { describe, expect, it } from 'vitest';
import { fmt, lengthText, surd } from './format';

describe('format', () => {
  it('surds', () => {
    expect(surd(50).text).toBe('5√2');
    expect(surd(2).text).toBe('√2');
    expect(surd(2).tex).toBe('\\sqrt{2}');
    expect(surd(49)).toMatchObject({ text: '7', exact: true });
  });
  it('lengths', () => {
    expect(lengthText(5)).toBe('5 cm');
    expect(lengthText(Math.hypot(3, 3))).toBe('3√2 cm');
    expect(lengthText(Math.hypot(3, 4))).toBe('5 cm');
    expect(fmt(5.6568)).toBe('5.66');
  });
});
