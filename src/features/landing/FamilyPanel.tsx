import { ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShapeIcon } from '@/components/ShapeIcon';
import { useLocalize, useT, type MessageKey } from '@/i18n';
import { chapterText } from '@/topics/ncertChapters';
import type { RegisteredTopic } from '@/topics/registry';
import type { ClassLevel, ShapeFamily } from '@/topics/types';
import { ShapePreview } from './ShapePreview';

export const FAMILY_NAME: Record<ShapeFamily, MessageKey> = {
  triangle: 'shapes.triangle',
  square: 'shapes.square',
  rectangle: 'shapes.rectangle',
  cube: 'shapes.cube',
};

interface Props {
  family: ShapeFamily;
  topics: RegisteredTopic[];
  classLevel: ClassLevel;
  /** Nearest class that does have topics for this family (for the empty state). */
  otherClass?: ClassLevel;
}

export function FamilyPanel({ family, topics, classLevel, otherClass }: Props) {
  const t = useT();
  const loc = useLocalize();
  const headingId = `family-${family}`;

  return (
    <article data-accent={family} aria-labelledby={headingId} className="glass flex flex-col overflow-hidden rounded-panel">
      <div className="flex items-center gap-4 p-4 sm:p-5">
        <ShapePreview family={family} className="h-24 w-24 shrink-0 overflow-hidden rounded-card border border-line/60 bg-bg/40" />
        <div className="min-w-0">
          <h3 id={headingId} className="flex items-center gap-2 text-xl font-extrabold">
            <span className="text-accent">
              <ShapeIcon family={family} className="h-6 w-6" />
            </span>
            {t(FAMILY_NAME[family])}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {topics.length === 1 ? t('landing.topicCountOne') : t('landing.topicCount', { n: topics.length })}
          </p>
        </div>
      </div>

      {topics.length === 0 ? (
        <p className="border-t border-line/50 px-5 py-6 text-sm text-muted">
          {t('landing.familyEmpty', { n: classLevel, other: otherClass ?? classLevel })}
        </p>
      ) : (
        <ul className="border-t border-line/50">
          {topics.map(({ meta }) => {
            const chapter = meta.ncert[classLevel];
            return (
              <li key={meta.id} className="border-b border-line/30 last:border-b-0">
                <Link
                  to={`/topic/${meta.id}`}
                  className="group flex min-h-[60px] items-center gap-3 px-4 py-3 transition-colors hover:bg-surface/50 focus-visible:-outline-offset-2 sm:px-5"
                >
                  <span className="mt-0.5 h-2 w-2 shrink-0 self-start rounded-full bg-accent translate-y-2" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold leading-snug">{loc(meta.title)}</span>
                    <span className="mt-0.5 block text-sm text-muted">{chapter && loc(chapterText(chapter))}</span>
                  </span>
                  {meta.signature && (
                    <span className="hidden shrink-0 items-center gap-1 rounded-full border border-accent/40 px-2 py-0.5 text-xs font-semibold text-accent sm:inline-flex">
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      {t('landing.signatureBadge')}
                    </span>
                  )}
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
