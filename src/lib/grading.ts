/** Grading typed answers and awarding stars (pure, unit-tested). */
import type { AnswerSpec, Mistake } from '@/topics/contract';

/** Accepts "96", " 96.0 ", "96 cm²", "1,000", "-3". Returns null if no number. */
export function parseNumber(input: string): number | null {
  const cleaned = input.replace(/,/g, '').replace(/[²³]/g, '').trim();
  const m = cleaned.match(/^-?\d+(\.\d+)?|^-?\.\d+/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

export interface AnswerResult {
  id: string;
  correct: boolean;
  given: number | null;
  expected: number;
  /** recognised common mistake, if any */
  mistake?: Mistake;
}

export function gradeAnswers(
  specs: AnswerSpec[],
  inputs: Record<string, string>,
  mistakes: Mistake[] = [],
): { results: AnswerResult[]; allCorrect: boolean } {
  const results = specs.map((s) => {
    const given = parseNumber(inputs[s.id] ?? '');
    const tol = s.tolerance ?? 0.01;
    const correct = given !== null && Math.abs(given - s.value) <= tol + 1e-9;
    const mistake =
      !correct && given !== null
        ? mistakes.find((m) => m.answerId === s.id && Math.abs(m.value - given) <= tol + 1e-9 && Math.abs(m.value - s.value) > tol)
        : undefined;
    return { id: s.id, correct, given, expected: s.value, ...(mistake && { mistake }) };
  });
  return { results, allCorrect: results.every((r) => r.correct) };
}

/**
 * 3 stars: built correctly, right first time, no hints.
 * −1 per wrong attempt (max −2), −1 for using hints, −1 if the figure wasn't built correctly. Never below 1.
 */
export function computeStars(o: { wrongAttempts: number; hintsUsed: number; buildOk: boolean }): 1 | 2 | 3 {
  const s = 3 - Math.min(2, o.wrongAttempts) - (o.hintsUsed > 0 ? 1 : 0) - (o.buildOk ? 0 : 1);
  return Math.max(1, Math.min(3, s)) as 1 | 2 | 3;
}
