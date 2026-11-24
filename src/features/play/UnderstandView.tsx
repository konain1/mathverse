import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { StageLayout } from '@/components/stage/StageLayout';
import { GuideLayer } from '@/features/build/scene/GhostLayer';
import { DEFAULT_HOME } from '@/features/build/scene/BuildCanvas';
import { useSceneColors } from '@/features/build/scene/useSceneColors';
import { SolveCanvas } from '@/features/solve/SolveCanvas';
import { useLocalize, useT } from '@/i18n';
import type { BuildPlan, Params, QuestionTemplate } from '@/topics/contract';
import type { ShapeFamily } from '@/topics/types';
import { unitIsPrefix, useFormatValue, useUnitLabel } from './units';

function Preview({ plan, family }: { plan: BuildPlan; family: ShapeFamily }) {
  const colors = useSceneColors(family);
  return <GuideLayer guide={plan.target} colors={{ ...colors, ok: colors.accent }} />;
}

export function UnderstandView({
  family,
  header,
  question,
  params,
  plan,
  onStart,
}: {
  family: ShapeFamily;
  header: ReactNode;
  question: QuestionTemplate;
  params: Params;
  plan: BuildPlan;
  onStart: () => void;
}) {
  const t = useT();
  const loc = useLocalize();
  const unit = useUnitLabel();
  const formatValue = useFormatValue();
  return (
    <StageLayout
      family={family}
      panelLabel={t('play.understand.title')}
      stage={
        <div className="absolute inset-0">
          <SolveCanvas family={family} home={plan.home ?? DEFAULT_HOME} label={t('play.understand.preview')}>
            <Preview plan={plan} family={family} />
          </SolveCanvas>
          <p className="glass pointer-events-none absolute bottom-3 left-3 rounded-control px-3 py-1.5 text-xs font-semibold">
            {t('play.understand.preview')}
          </p>
        </div>
      }
      panel={
        <div className="flex flex-col gap-5">
          {header}
          <h1 className="text-xl font-extrabold leading-snug sm:text-2xl">{loc(question.prompt(params))}</h1>
          <section aria-labelledby="given">
            <h2 id="given" className="text-sm font-semibold text-muted">
              {t('play.understand.given')}
            </h2>
            <ul className="mt-2 space-y-2">
              {question.given(params).map((f) => (
                <li key={loc(f.label)} className="glass flex items-baseline justify-between rounded-control px-3 py-2">
                  <span>{loc(f.label)}</span>
                  <span className="num text-lg font-bold">{formatValue(f.value, f.unit)}</span>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="find">
            <h2 id="find" className="text-sm font-semibold text-muted">
              {t('play.understand.find')}
            </h2>
            <ul className="mt-2 space-y-2">
              {question.find(params).map((f, i) => (
                <li key={i} className="flex items-baseline justify-between rounded-control border border-dashed border-accent/60 px-3 py-2">
                  <span>{loc(f)}</span>
                  <span className="num font-bold text-accent">
                    {(() => {
                      const ans = question.answers(params)[i];
                      const u = ans?.unit ?? 'cm';
                      if (ans?.options) return '?';
                      return unitIsPrefix(u) ? `${unit(u)} ?` : `? ${unit(u)}`.trim();
                    })()}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <button type="button" onClick={onStart} className="btn-primary">
            {t('play.understand.start')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      }
    />
  );
}
