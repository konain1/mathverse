import { BookOpen, Box, PlayCircle, Target } from 'lucide-react';
import { useT, type MessageKey } from '@/i18n';

const STEPS: { icon: typeof BookOpen; title: MessageKey; body: MessageKey }[] = [
  { icon: BookOpen, title: 'landing.flowUnderstand', body: 'landing.flowUnderstandBody' },
  { icon: Box, title: 'landing.flowBuild', body: 'landing.flowBuildBody' },
  { icon: PlayCircle, title: 'landing.flowSolve', body: 'landing.flowSolveBody' },
  { icon: Target, title: 'landing.flowTry', body: 'landing.flowTryBody' },
];

export function FlowSection() {
  const t = useT();
  return (
    <section aria-labelledby="flow-title" className="mx-auto max-w-page px-4 pb-20 pt-4 sm:px-6">
      <h2 id="flow-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        {t('landing.flowTitle')}
      </h2>
      <p className="mt-3 max-w-xl text-muted">{t('landing.flowBody')}</p>
      <ol className="relative mt-10 grid gap-8 md:grid-cols-4 md:gap-6">
        {/* the connecting rail: it's a real sequence */}
        <span aria-hidden="true" className="absolute left-[22px] top-2 h-[calc(100%-1rem)] w-px bg-line md:left-0 md:top-[22px] md:h-px md:w-full" />
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="relative flex gap-4 md:flex-col">
            <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-bg-raised font-mono font-bold text-accent">
              {i + 1}
            </span>
            <div>
              <h3 className="flex items-center gap-2 text-lg font-extrabold">
                <Icon className="h-5 w-5 text-muted" aria-hidden="true" />
                {t(title)}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(body)}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
