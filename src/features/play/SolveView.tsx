import { AlertTriangle, ArrowRight, BookmarkCheck, HelpCircle } from 'lucide-react';
import { useEffect, useMemo, type ReactNode } from 'react';
import { Formula } from '@/components/Formula';
import { StageLayout } from '@/components/stage/StageLayout';
import { SolveCanvas } from '@/features/solve/SolveCanvas';
import { StepControls } from '@/features/solve/StepControls';
import { usePlayer } from '@/features/solve/usePlayer';
import { DEFAULT_HOME } from '@/features/build/scene/BuildCanvas';
import { useReducedMotionPref } from '@/hooks/useMediaQuery';
import { useLocalize, useT } from '@/i18n';
import { cn } from '@/lib/cn';
import type { Params, SceneModule, SolutionScript } from '@/topics/contract';
import type { ShapeFamily } from '@/topics/types';

export function SolveView({
  family,
  header,
  script,
  scene,
  params,
  questionId,
  onWatched,
  onTry,
}: {
  family: ShapeFamily;
  header: ReactNode;
  script: SolutionScript;
  scene: SceneModule;
  params: Params;
  questionId: string;
  onWatched: () => void;
  onTry: () => void;
}) {
  const t = useT();
  const loc = useLocalize();
  const reduced = useReducedMotionPref();
  const durations = useMemo(() => script.steps.map((s) => s.duration), [script]);
  const player = usePlayer(durations, !reduced);
  const step = script.steps[player.index]!;
  const finished = player.index === script.steps.length - 1 && player.t >= 1;
  const home = useMemo(() => scene.home?.(params, questionId) ?? DEFAULT_HOME, [scene, params, questionId]);
  const Scene = scene.default;
  const Overlay = scene.Overlay;
  const sceneProps = { params, questionId, cue: step.cue, stepIndex: player.index, t: player.t };

  useEffect(() => {
    if (finished) onWatched();
  }, [finished, onWatched]);

  return (
    <StageLayout
      family={family}
      panelLabel={t('play.solve.steps')}
      stage={
        <div className="absolute inset-0">
          <SolveCanvas family={family} home={home} label={loc(step.narration)}>
            <Scene {...sceneProps} />
          </SolveCanvas>
          {Overlay && <Overlay {...sceneProps} />}
        </div>
      }
      bottom={<StepControls player={player} durations={durations} />}
      panel={
        <div className="flex flex-col gap-4">
          {header}
          {/* the current step: narration doubles as the caption for the animation */}
          <div className="glass rounded-card p-4" aria-live="polite">
            <p className="num text-xs font-bold text-accent">{t('play.solve.stepOf', { n: player.index + 1, total: script.steps.length })}</p>
            <p className="mt-1.5 text-base font-semibold leading-relaxed">{loc(step.narration)}</p>
            {step.formula && <Formula tex={step.formula} className="mt-3 text-lg" />}
            {step.why && (
              <details className="group mt-3 rounded-control border border-line/70 px-3 py-2">
                <summary className="flex min-h-[36px] cursor-pointer list-none items-center gap-2 text-sm font-bold">
                  <HelpCircle className="h-4 w-4 text-accent" aria-hidden="true" />
                  {t('play.solve.why')}
                </summary>
                <p className="pb-1 pt-1 text-sm leading-relaxed text-muted">{loc(step.why)}</p>
              </details>
            )}
          </div>

          <section aria-labelledby="solve-steps">
            <h2 id="solve-steps" className="text-sm font-semibold text-muted">
              {t('play.solve.steps')}
            </h2>
            <ol className="mt-2 space-y-1">
              {script.steps.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => player.goTo(i)}
                    aria-current={i === player.index ? 'step' : undefined}
                    className={cn(
                      'flex min-h-[44px] w-full items-start gap-2 rounded-control px-2 py-2 text-left text-sm',
                      i === player.index ? 'bg-surface/70 font-semibold' : 'text-muted hover:text-ink',
                    )}
                  >
                    <span className="num mt-px w-5 shrink-0 text-xs font-bold text-accent">{i + 1}</span>
                    <span className="line-clamp-2">{loc(s.narration)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <div className="grid gap-3">
            <div className="rounded-card border border-ok/50 p-3">
              <p className="flex items-center gap-2 text-sm font-bold text-ok">
                <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
                {t('play.solve.remember')}
              </p>
              <p className="mt-1 text-sm">{loc(script.remember)}</p>
            </div>
            <div className="rounded-card border border-triangle/50 p-3">
              <p className="flex items-center gap-2 text-sm font-bold text-triangle">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                {t('play.solve.mistake')}
              </p>
              <p className="mt-1 text-sm">{loc(script.mistake)}</p>
            </div>
          </div>

          <button type="button" onClick={onTry} className={finished ? 'btn-primary' : 'btn-ghost'}>
            {t('play.solve.tryCta')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      }
    />
  );
}
