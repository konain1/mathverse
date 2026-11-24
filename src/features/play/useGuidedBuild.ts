import { useEffect, useMemo } from 'react';
import { currentStepIndex } from '@/features/guided/recipes';
import { useBuild, useBuildStore } from '@/features/build/BuildProvider';
import { selectConstruction } from '@/features/build/store';
import type { GuideOverlay } from '@/features/build/scene/GhostLayer';
import type { BuildPlan } from '@/topics/contract';

export type BuildMode = 'guided' | 'free';

/**
 * Drives guided construction on top of the build store:
 * - works out the current step from the geometry itself (so any valid order counts),
 * - selects that step's tool,
 * - after every change, shows the current step's issues (they glow red in 3D),
 * - returns the ghost guide for the next valid position.
 */
export function useGuidedBuild(plan: BuildPlan, mode: BuildMode, revealTarget: boolean) {
  const store = useBuildStore();
  const c = useBuild(selectConstruction);
  const index = useMemo(() => currentStepIndex(plan, c), [plan, c]);
  const complete = useMemo(() => plan.check(c).ok, [plan, c]);
  const step = plan.steps[index];

  // pick the right tool for the step
  useEffect(() => {
    if (mode !== 'guided' || !step) return;
    const s = store.getState();
    if (s.tool !== step.tool) s.setTool(step.tool);
    if (step.faceIntent && s.faceIntent !== step.faceIntent) s.setFaceIntent(step.faceIntent);
  }, [mode, step, store]);

  // re-check the current step after every change to the figure
  useEffect(
    () =>
      store.subscribe((s, prev) => {
        if (mode !== 'guided' || s.history.present === prev.history.present) return;
        const cur = s.history.present;
        const st = plan.steps[currentStepIndex(plan, cur)];
        const issues = st?.evaluate(cur).issues ?? [];
        if (issues.length) store.setState({ feedback: { kind: 'issues', issues, source: 'step' } });
        else if (s.feedback?.kind === 'issues' && s.feedback.source === 'step') store.setState({ feedback: null });
      }),
    [store, plan, mode],
  );

  const guide: GuideOverlay | undefined = revealTarget ? plan.target : mode === 'guided' ? step?.guide?.(c) : undefined;
  return { index, complete, guide };
}
