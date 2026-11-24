/**
 * The plugin contract: what each file in a topic folder exports.
 *
 *   meta.ts           export const meta = defineTopic({...})
 *   questions.ts      export const questions: QuestionTemplate[]
 *   buildSteps.ts     export function buildPlan(questionId, params): BuildPlan
 *   solutionSteps.ts  export function solution(questionId, params): SolutionScript
 *   Scene.tsx         export default function Scene(props: SceneProps)   (inside the Canvas)
 *                     export function Overlay(props: SceneProps)         (optional, DOM over the canvas)
 *
 * Every number a student sees must be computed with src/lib/geometry, never typed in.
 */
import type { ComponentType } from 'react';
import type { GuideOverlay } from '@/features/build/scene/GhostLayer';
import type { CameraHome } from '@/features/build/scene/CameraRig';
import type { Tool } from '@/features/build/store';
import type { Construction, FaceIntent } from '@/lib/geometry/construction';
import type { CheckResult, Issue } from '@/lib/geometry/validators';
import type { Difficulty, LocalizedText } from './types';

export type Params = Record<string, number>;
/** Deterministic random source in [0, 1). */
export type Rng = () => number;

export type Unit = 'cm' | 'cm2' | 'cm3' | 'deg' | 'times' | 'cubes' | 'squares' | 'tiles' | 'rupees' | 'none';

export interface Fact {
  label: LocalizedText;
  value: number;
  unit: Unit;
}

export interface AnswerSpec {
  id: string;
  label: LocalizedText;
  /** For a multiple-choice answer: the options; `value` is then the index of the right one. */
  options?: LocalizedText[];
  value: number;
  unit: Unit;
  /** absolute tolerance; default 0.01 (answers rounded to 2 decimals are accepted) */
  tolerance?: number;
}

/** A likely wrong answer and the explanation to show when a student gives it. */
export interface Mistake {
  answerId: string;
  value: number;
  message: LocalizedText;
}

export interface QuestionTemplate<P extends Params = Params> {
  id: string;
  level: Difficulty;
  /** The curated worked example. */
  params: P;
  /** A fresh variant for "Try yourself". Must only produce valid, nice numbers. */
  generate: (rng: Rng) => P;
  prompt: (p: P) => LocalizedText;
  given: (p: P) => Fact[];
  find: (p: P) => LocalizedText[];
  answers: (p: P) => AnswerSpec[];
  mistakes?: (p: P) => Mistake[];
}

// ─── build ───────────────────────────────────────────────────────────────
export interface StepEvaluation {
  done: boolean;
  /** shown (and glowing red) while this step is the current one */
  issues: Issue[];
}

export interface GuidedStep {
  id: string;
  instruction: LocalizedText;
  /** auto-selected in guided mode */
  tool: Tool;
  faceIntent?: FaceIntent;
  /** ghost of the next valid position; may depend on what is already built */
  guide?: (c: Construction) => GuideOverlay | undefined;
  evaluate: (c: Construction) => StepEvaluation;
}

export interface BuildPlan {
  /** Figure already on the grid when building starts (e.g. the triangle to copy). */
  initial?: Construction;
  steps: GuidedStep[];
  /** Final check; also the only check in free mode / Try yourself. */
  check: (c: Construction) => CheckResult;
  /** The finished figure, for the Understand preview and the "reveal" hint. */
  target: GuideOverlay;
  /** Free-mode hints: nudge → clue → (reveal = target). */
  hints: { nudge: LocalizedText; clue: LocalizedText };
  home?: CameraHome;
}

// ─── solve ───────────────────────────────────────────────────────────────
export interface SolutionStep {
  id: string;
  /** Spoken-style explanation; also the caption for the animation. */
  narration: LocalizedText;
  /** KaTeX source */
  formula?: string;
  /** Animation the Scene should play for this step. */
  cue: string;
  /** seconds at 1× speed */
  duration: number;
  /** "Kyun?" card */
  why?: LocalizedText;
}

export interface SolutionScript {
  steps: SolutionStep[];
  remember: LocalizedText;
  mistake: LocalizedText;
}

export interface SceneProps {
  params: Params;
  questionId: string;
  /** cue of the current step */
  cue: string;
  stepIndex: number;
  /** 0 → 1 progress through the current step (scrubbable, so scenes must be pure functions of it) */
  t: number;
}

export interface SceneModule {
  default: ComponentType<SceneProps>;
  Overlay?: ComponentType<SceneProps>;
  home?: (params: Params, questionId: string) => CameraHome;
}
export interface QuestionsModule {
  questions: QuestionTemplate[];
}
export interface BuildStepsModule {
  buildPlan: (questionId: string, params: Params) => BuildPlan;
}
export interface SolutionStepsModule {
  solution: (questionId: string, params: Params) => SolutionScript;
}

/** Shorthand for a string in all three languages. */
export const tx = (hinglish: string, en: string, hi: string): LocalizedText => ({ hinglish, en, hi });

/** Typed helper so questions.ts gets full checking of its params. */
export function defineQuestion<P extends Params>(q: QuestionTemplate<P>): QuestionTemplate {
  return q as unknown as QuestionTemplate;
}
