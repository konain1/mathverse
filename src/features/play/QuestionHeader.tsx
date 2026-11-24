import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLocalize, useT } from '@/i18n';
import type { QuestionTemplate } from '@/topics/contract';
import type { RegisteredTopic } from '@/topics/registry';

export function QuestionHeader({ topic, question }: { topic: RegisteredTopic; question: QuestionTemplate }) {
  const t = useT();
  const loc = useLocalize();
  return (
    <div className="flex items-center justify-between gap-2">
      <Link
        to={`/topic/${topic.meta.id}`}
        className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span className="line-clamp-1">{loc(topic.meta.title)}</span>
      </Link>
      <span className="shrink-0 rounded-full border border-accent/50 px-2.5 py-0.5 text-xs font-bold text-accent">
        {t(`levels.${question.level}`)}
      </span>
    </div>
  );
}
