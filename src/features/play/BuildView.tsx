import { Check, Circle, CircleDot } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BuildProvider, useBuild } from '@/features/build/BuildProvider';
import { BuildCanvas } from '@/features/build/scene/BuildCanvas';
import { FeedbackCard } from '@/features/build/ui/FeedbackCard';
import { StatusLine } from '@/features/build/ui/StatusLine';
import { Toolbar } from '@/features/build/ui/Toolbar';
import { WorkspaceLayout } from '@/features/build/ui/WorkspaceLayout';
import { useLocalize, useT } from '@/i18n';
import { analyzeConstruction } from '@/lib/geometry/validators';
import { cn } from '@/lib/cn';
import type { BuildPlan } from '@/topics/contract';
import type { ShapeFamily } from '@/topics/types';
import { Celebration } from './Celebration';
import { HintBox } from './HintBox';
import { useGuidedBuild, type BuildMode } from './useGuidedBuild';

export function planCheck(plan: BuildPlan) {
  return (c: Parameters<BuildPlan['check']>[0]) => {
    const r = plan.check(c);
    return r.ok
      ? ({ kind: 'success', analysis: analyzeConstruction(c) } as const)
      : ({ kind: 'issues', issues: r.issues, source: 'check' } as const);
  };
}

function ModeSwitch({ mode, onChange }: { mode: BuildMode; onChange: (m: BuildMode) => void }) {
  const t = useT();
  return (
    <div role="radiogroup" aria-label={t('play.build.modeLabel')} className="grid grid-cols-2 gap-1 rounded-control border border-line/70 p-1">
      {(['guided', 'free'] as const).map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          onClick={() => onChange(m)}
          className={cn('min-h-[44px] rounded-[0.7rem] text-sm font-bold', mode === m ? 'bg-ink text-bg' : 'text-muted hover:text-ink')}
        >
          {t(`play.build.${m}`)}
        </button>
      ))}
    </div>
  );
}

function StepList({ plan, index }: { plan: BuildPlan; index: number }) {
  const t = useT();
  const loc = useLocalize();
  return (
    <section aria-labelledby="steps-title">
      <h2 id="steps-title" className="text-sm font-semibold text-muted">
        {t('play.build.steps')}
      </h2>
      <ol className="mt-2 space-y-2">
        {plan.steps.map((s, i) => {
          const state = i < index ? 'done' : i === index ? 'now' : 'later';
          return (
            <li
              key={s.id}
              aria-current={state === 'now' ? 'step' : undefined}
              className={cn(
                'flex gap-3 rounded-control px-3 py-2.5 text-sm',
                state === 'now' && 'glass border-accent/60 font-semibold shadow-glow',
                state === 'later' && 'text-faint',
              )}
            >
              {state === 'done' ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-label={t('play.build.done')} />
              ) : state === 'now' ? (
                <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-label={t('play.build.now')} />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span className={state === 'done' ? 'text-muted line-through decoration-line' : undefined}>{loc(s.instruction)}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Build workspace shared by the Build phase (guided/free) and Try yourself (free, no guidance). */
export function BuildArea({
  family,
  plan,
  mode,
  panelTop,
  panelBottom,
  onBuilt,
  celebrate,
  onContinue,
  onHintUsed,
}: {
  family: ShapeFamily;
  plan: BuildPlan;
  mode: BuildMode;
  onHintUsed?: () => void;
  panelTop: ReactNode;
  panelBottom?: ReactNode;
  onBuilt?: () => void;
  celebrate: boolean;
  onContinue?: () => void;
}) {
  const t = useT();
  const [hintLevel, setHintLevel] = useState(0);
  const moreHint = () => {
    if (hintLevel >= 3) return;
    setHintLevel(hintLevel + 1);
    onHintUsed?.();
  };
  const { index, complete, guide } = useGuidedBuild(plan, mode, hintLevel >= 3);
  const feedback = useBuild((s) => s.feedback);
  const [showParty, setShowParty] = useState(false);
  const partied = useRef(false);

  // guided: celebrate as soon as the figure is right; free: when Check confirms it
  const success = mode === 'guided' ? complete : complete && feedback?.kind === 'success';
  useEffect(() => {
    if (!success || partied.current) return;
    partied.current = true;
    onBuilt?.();
    if (celebrate) setShowParty(true);
  }, [success, celebrate, onBuilt]);

  return (
    <WorkspaceLayout
      family={family}
      canvasLabel={t('build.canvasLabel')}
      canvas={<BuildCanvas family={family} label={t('build.canvasLabel')} home={plan.home} guide={guide} />}
      toolbar={<Toolbar hintAvailable={mode === 'free' && hintLevel < 3} onHint={moreHint} />}
      status={<StatusLine />}
      overlay={
        showParty && onContinue ? (
          <Celebration onContinue={onContinue} onStay={() => setShowParty(false)} />
        ) : undefined
      }
      panel={
        <div className="flex flex-col gap-5">
          {panelTop}
          {mode === 'guided' ? (
            <StepList plan={plan} index={index} />
          ) : (
            <>
              <p className="text-sm text-muted">{t('play.build.freeIntro')}</p>
              <HintBox plan={plan} level={hintLevel} onMore={moreHint} />
            </>
          )}
          <FeedbackCard />
          {complete && !showParty && onContinue && (
            <button type="button" className="btn-primary" onClick={onContinue}>
              {t('play.celebrate.cta')}
            </button>
          )}
          {panelBottom}
        </div>
      }
    />
  );
}

export function BuildView(props: {
  family: ShapeFamily;
  plan: BuildPlan;
  header: ReactNode;
  prompt: string;
  onBuilt: () => void;
  onContinue: () => void;
}) {
  const [mode, setMode] = useState<BuildMode>('guided');
  return (
    // a new store per mode switch keeps guided and free attempts separate
    <BuildProvider key={mode} options={{ check: planCheck(props.plan), initial: props.plan.initial }}>
      <BuildArea
        family={props.family}
        plan={props.plan}
        mode={mode}
        celebrate
        onBuilt={props.onBuilt}
        onContinue={props.onContinue}
        panelTop={
          <>
            {props.header}
            <p className="font-bold leading-snug">{props.prompt}</p>
            <ModeSwitch mode={mode} onChange={setMode} />
          </>
        }
      />
    </BuildProvider>
  );
}
