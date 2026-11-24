import { CircleAlert, CircleCheck, RefreshCcw } from 'lucide-react';
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BuildProvider, useBuildStore } from '@/features/build/BuildProvider';
import { useLocalize, useT } from '@/i18n';
import { computeStars, gradeAnswers, type AnswerResult } from '@/lib/grading';
import { newSeed, seededRng } from '@/lib/random';
import { useProgress } from '@/state/progress';
import type { BuildPlan, Params, QuestionTemplate } from '@/topics/contract';
import type { ShapeFamily } from '@/topics/types';
import { BuildArea, planCheck } from './BuildView';
import { Stars } from './Stars';
import { unitIsPrefix, useFormatValue, useUnitLabel } from './units';

const MAX_WRONG_BEFORE_REVEAL = 3;

function AnswerForm({
  topicId,
  question,
  params,
  plan,
  hintsUsedRef,
}: {
  topicId: string;
  question: QuestionTemplate;
  params: Params;
  plan: BuildPlan;
  hintsUsedRef: { current: number };
}) {
  const t = useT();
  const loc = useLocalize();
  const unit = useUnitLabel();
  const formatValue = useFormatValue();
  const store = useBuildStore();
  const record = useProgress((s) => s.recordStars);
  const answers = useMemo(() => question.answers(params), [question, params]);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<AnswerResult[] | null>(null);
  const [wrong, setWrong] = useState(0);
  const [buildOk, setBuildOk] = useState<boolean | null>(null);
  const [stars, setStars] = useState<number | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const graded = gradeAnswers(answers, inputs, question.mistakes?.(params) ?? []);
    const built = plan.check(store.getState().history.present).ok;
    setResults(graded.results);
    setBuildOk(built);
    if (!built) store.getState().check(); // show what's off in the figure, in red
    if (graded.allCorrect) {
      const s = computeStars({ wrongAttempts: wrong, hintsUsed: hintsUsedRef.current, buildOk: built });
      setStars(s);
      record(topicId, question.id, s);
    } else {
      const w = wrong + 1;
      setWrong(w);
      if (w >= MAX_WRONG_BEFORE_REVEAL) {
        setStars(1);
        record(topicId, question.id, 1);
      }
    }
  };

  const revealed = wrong >= MAX_WRONG_BEFORE_REVEAL;
  const done = stars !== null;

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
      {answers.map((a) => {
        const r = results?.find((x) => x.id === a.id);
        const id = `ans-${a.id}`;
        return (
          <div key={a.id}>
            {a.options ? (
              <fieldset aria-describedby={r ? `${id}-fb` : undefined}>
                <legend className="text-sm font-semibold">{loc(a.label)}</legend>
                <div className="mt-1.5 flex flex-wrap gap-2" role="radiogroup">
                  {a.options.map((o, i) => {
                    const on = inputs[a.id] === String(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        disabled={done}
                        onClick={() => setInputs((s) => ({ ...s, [a.id]: String(i) }))}
                        className={`min-h-[44px] rounded-control border px-3 text-sm font-bold ${on ? 'border-accent bg-accent text-bg' : 'border-line text-ink hover:border-accent/70'}`}
                      >
                        {loc(o)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ) : (
              <>
                <label htmlFor={id} className="text-sm font-semibold">
                  {loc(a.label)}
                </label>
                <div className="mt-1 flex items-center gap-2">
                  {unitIsPrefix(a.unit) && <span className="num shrink-0 text-lg font-bold text-muted">{unit(a.unit)}</span>}
                  <input
                    id={id}
                    inputMode="decimal"
                    autoComplete="off"
                    disabled={done}
                    value={inputs[a.id] ?? ''}
                    onChange={(e) => setInputs((s) => ({ ...s, [a.id]: e.target.value }))}
                    aria-describedby={r ? `${id}-fb` : undefined}
                    aria-invalid={r ? !r.correct : undefined}
                    className="num min-h-[48px] w-full rounded-control border border-line bg-bg/60 px-3 text-lg font-bold outline-none focus:border-accent"
                  />
                  {!unitIsPrefix(a.unit) && <span className="num shrink-0 text-lg font-bold text-muted">{unit(a.unit)}</span>}
                </div>
              </>
            )}
            {r && (
              <p id={`${id}-fb`} className={`mt-1.5 flex gap-1.5 text-sm ${r.correct ? 'text-ok' : 'text-bad'}`}>
                {r.correct ? <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
                <span>
                  {r.correct ? t('play.try.correct') : r.mistake ? loc(r.mistake.message) : t('play.try.wrongGeneric')}
                  {!r.correct && revealed && (
                    <span className="block font-bold text-ink">{t('play.try.reveal', { value: a.options ? loc(a.options[r.expected]!) : formatValue(r.expected, a.unit), unit: '' }).trim()}</span>
                  )}
                </span>
              </p>
            )}
          </div>
        );
      })}
      <p className="text-xs text-muted">{t('play.try.answerHint')}</p>
      {buildOk === false && <p className="text-sm text-triangle">{t('play.try.buildMissing')}</p>}
      {wrong > 0 && !done && <p className="num text-xs text-muted">{t('play.try.attempts', { n: wrong })}</p>}
      {!done && (
        <button type="submit" className="btn-primary">
          {t('play.try.submit')}
        </button>
      )}
      {done && (
        <div className="glass flex flex-col items-center gap-2 rounded-card p-4 text-center" aria-live="polite">
          <p className="text-sm text-muted">{t('play.try.earned')}</p>
          <Stars n={stars!} />
        </div>
      )}
    </form>
  );
}

export function TryView({
  family,
  topicId,
  header,
  question,
  buildPlan,
}: {
  family: ShapeFamily;
  topicId: string;
  header: ReactNode;
  question: QuestionTemplate;
  buildPlan: (questionId: string, p: Params) => BuildPlan;
}) {
  const t = useT();
  const loc = useLocalize();
  const [seed, setSeed] = useState(newSeed);
  const params = useMemo(() => question.generate(seededRng(seed)), [question, seed]);
  const plan = useMemo(() => buildPlan(question.id, params), [buildPlan, question.id, params]);
  // hints taken in this attempt (each new question starts at 0); they cost a star
  const hintsUsed = useMemo(() => ({ current: 0, seed }), [seed]);

  return (
    <BuildProvider key={seed} options={{ check: planCheck(plan), initial: plan.initial }}>
      <BuildArea
        family={family}
        plan={plan}
        mode="free"
        celebrate={false}
        onHintUsed={() => {
          hintsUsed.current += 1;
        }}
        panelTop={
          <>
            {header}
            <div>
              <h1 className="text-lg font-extrabold">{t('play.try.title')}</h1>
              <p className="mt-1 text-sm text-muted">{t('play.try.intro')}</p>
            </div>
            <p className="glass rounded-card p-3 font-bold leading-snug">{loc(question.prompt(params))}</p>
          </>
        }
        panelBottom={
          <>
            <AnswerForm topicId={topicId} question={question} params={params} plan={plan} hintsUsedRef={hintsUsed} />
            <div className="flex gap-2">
              <button type="button" className="btn-ghost flex-1" onClick={() => setSeed(newSeed())}>
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                {t('play.try.another')}
              </button>
              <Link to={`/topic/${topicId}`} className="btn-ghost flex-1">
                {t('play.try.back')}
              </Link>
            </div>
          </>
        }
      />
    </BuildProvider>
  );
}
