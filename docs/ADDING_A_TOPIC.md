# Adding a topic

A topic is one folder. Adding a topic means adding a folder; no other file needs editing.
The registry (`src/topics/registry.ts`) finds it automatically.

```
src/topics/class-<n>/<topic-id>/
  meta.ts           title, class, NCERT chapter, levels, prerequisites, tags
  questions.ts      curated questions + generators for "Try yourself"
  buildSteps.ts     the guided construction (as data)
  solutionSteps.ts  narration + KaTeX + animation cue, per step
  Scene.tsx         the 3D scene that plays those cues
```

A topic with only `meta.ts` shows up in menus as "coming soon". It becomes playable
(Understand → Build → Solve → Try yourself) once all five files exist.

## 1. Copy the template

```bash
cp -r src/topics/_template src/topics/class-8/my-new-topic
```

Then in `meta.ts` set `id` to the folder name (`my-new-topic`) and `classLevel` to the
folder's class. `ncert` maps class → chapter name; any extra class listed there makes
the topic appear in that class too. New chapter names also go in
`src/topics/ncertChapters.ts` (with Hindi), or a test will fail.

## 2. Questions (`questions.ts`)

Export `questions: QuestionTemplate[]`, usually one per level (basic, medium, hard, challenge).
Each has:

- `params`: the worked example's numbers.
- `generate(rng)`: a new variant for Try yourself. Only produce nice numbers, and keep
  figures buildable (the grid is 20 cm × 20 cm, building starts at the origin, so sides ≤ 10 cm).
- `prompt`, `given`, `find`: text in all three languages (use `tx(hinglish, en, hi)`).
  In Hinglish keep maths terms in English (area, volume, perimeter).
- `answers(p)`: **computed with `src/lib/geometry`**. Never type a number in.
- `mistakes(p)`: likely wrong values and what to say. Explain the method; don't reveal the final answer.

## 3. Build plan (`buildSteps.ts`)

Export `buildPlan(questionId, params): BuildPlan`. Reuse a recipe from
`src/features/guided/recipes.ts` (e.g. `cubePlan(a)`) or write steps. Each step has:

- `instruction`: one short sentence in 3 languages ("Ab 4 cm ki line kheencho").
- `tool` (and `faceIntent` for faces): selected automatically in guided mode.
- `guide(c)`: ghost of the next valid position (`{ points, segments }`).
- `evaluate(c)`: `{ done, issues }`. Issues name the entity ids to glow red and the
  numbers to show; their messages live in `build.issues.*` in the locale files.

The current step is "the first step that is not done", worked out from the geometry, so
students may build in any valid order. `check(c)` is the final check (also used in free
mode). `hints` gives the nudge and clue; the third hint reveals `target`.

## 4. Solution (`solutionSteps.ts`)

Export `solution(questionId, params): SolutionScript`: steps with `narration`,
`formula` (KaTeX), `cue`, `duration` (seconds at 1×) and an optional `why` ("Kyun?" card),
plus `remember` and `mistake` cards. Always show units (`\,\text{cm}^2`).

## 5. Scene (`Scene.tsx`)

Default export: a component rendered inside the solve canvas with
`{ params, questionId, cue, stepIndex, t }`. **It must be a pure function of `(cue, t)`**
(no timers, no animation state), so scrubbing, speed and Previous/Next all stay in sync.
A good pattern is a `sceneState.ts` that turns `(cue, t)` into plain data, plus a test.

Optional exports: `Overlay` (DOM over the canvas, e.g. a running counter) and
`home(params, questionId)` (camera start).

Shared building blocks: `NetUnfolder` (cuboid ⇄ net), `UnitCubeFiller` (instanced unit
cubes), `Rect` (face with 1 cm grid), `AngleMarker`, `LengthLabel`, and `easeInOut` /
`phase` from `src/features/solve/timeline.ts`.

## 6. Test it

Add a `topic.test.ts` next to the files (see `class-8/cube-volume/topic.test.ts`):
worked examples, mistakes, generated variants stay valid, and every solution cue is
handled by the scene. Then run `npm test`, `npm run typecheck`, and open the topic in the app.
