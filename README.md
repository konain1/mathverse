# mathVerse by ko9

Interactive 3D maths for CBSE/NCERT Classes 7–9. Students build each figure themselves, then watch an animated solution.
Flow for every question: **Understand → Build → Solve → Try yourself**.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest
npm run typecheck
npm run build      # outputs dist/ (Vercel / Netlify configs included)
```

## Layout

```
src/
  topics/            topic plugins, one folder each: class-<n>/<topic-id>/
    registry.ts      auto-discovers topics (import.meta.glob); validates metadata
    types.ts         TopicMeta, LocalizedText, ClassLevel, Difficulty…
    ncertChapters.ts NCERT chapter names in 3 languages
    shared/          shared scenes/steps (shared/flat: squares & rectangles, shared/tri: triangles) + contract test helper
    _template/       copy this to add a topic
  lib/geometry/      pure maths, all unit-tested: formulas, vectors/polygons,
                     construction model (points/edges/faces + ops), loops, validators
  lib/history.ts     undo/redo snapshots
  features/guided/   reusable guided-construction recipes (e.g. cubePlan)
  features/solve/    step player (timeline, controls, solve canvas)
  features/play/     the four-phase question page
  features/build/    build engine: store (tools, drafts, check), scene/ (grid, edges with
                     live labels, faces, angle markers, ghosts, camera, pointer input), ui/
  three/             shared 3D building blocks (LazyCanvas, MorphShape, BlueprintStage…)
  i18n/              Hinglish (default), English, Hindi
  state/             Zustand stores (persisted to localStorage via state/storage.ts)
  styles/tokens.css  design tokens (dark + light); design/palette.ts mirrors them for three.js
```

Free build (the engine playground) lives at `/build`.
19 of the 24 V1 topics are playable (Triangle ×9, Square ×4, Rectangle ×4, Cube surface area, Cube volume; 5 more cube topics are still "coming soon"), at `/topic/<id>` →
pick a question → Understand → Build (guided or free) → Solve (animated) → Try yourself.
To add a topic, see [docs/ADDING_A_TOPIC.md](docs/ADDING_A_TOPIC.md).

The product name is a single constant in `src/config/app.ts`.
