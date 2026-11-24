import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { useT } from '@/i18n';
import { useSettings } from '@/state/settings';
import { topicsByFamily } from '@/topics/registry';
import { CLASS_LEVELS, SHAPE_FAMILIES, type ClassLevel, type ShapeFamily } from '@/topics/types';
import { ClassPicker } from './ClassPicker';
import { FamilyPanel } from './FamilyPanel';

function nearestClassWith(family: ShapeFamily, from: ClassLevel): ClassLevel | undefined {
  return [...CLASS_LEVELS]
    .filter((c) => c !== from && topicsByFamily(c)[family].length > 0)
    .sort((a, b) => Math.abs(a - from) - Math.abs(b - from))[0];
}

export function TopicBrowser() {
  const t = useT();
  const classLevel = useSettings((s) => s.classLevel);
  const byFamily = useMemo(() => topicsByFamily(classLevel), [classLevel]);

  return (
    <section id="topics" aria-labelledby="topics-title" className="mx-auto max-w-page scroll-mt-20 px-4 py-12 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 id="topics-title" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t('landing.topicsTitle', { n: classLevel })}
          </h2>
          <p className="mt-3 text-muted">{t('landing.topicsBody')}</p>
        </div>
        <ClassPicker />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={classLevel}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="mt-8 grid items-start gap-5 md:grid-cols-2"
        >
          {SHAPE_FAMILIES.map((family) => (
            <FamilyPanel
              key={family}
              family={family}
              topics={byFamily[family]}
              classLevel={classLevel}
              otherClass={byFamily[family].length === 0 ? nearestClassWith(family, classLevel) : undefined}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
