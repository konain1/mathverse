import { motion } from 'framer-motion';
import { ArrowRight, PartyPopper } from 'lucide-react';
import { useEffect } from 'react';
import { Confetti } from '@/components/celebrate/Confetti';
import { playChime } from '@/components/celebrate/chime';
import { useT } from '@/i18n';
import { useSettings } from '@/state/settings';

export function Celebration({ onContinue, onStay }: { onContinue: () => void; onStay: () => void }) {
  const t = useT();
  const sound = useSettings((s) => s.sound);
  useEffect(() => {
    if (sound) playChime();
  }, [sound]);
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-bg/40 p-4 backdrop-blur-[2px]">
      <Confetti />
      <motion.div
        role="alertdialog"
        aria-labelledby="celebrate-title"
        initial={{ scale: 0.9, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="glass relative max-w-sm rounded-panel p-6 text-center shadow-lift"
      >
        <PartyPopper className="mx-auto h-10 w-10 text-accent" aria-hidden="true" />
        <h2 id="celebrate-title" className="mt-3 text-xl font-extrabold">
          {t('play.celebrate.title')}
        </h2>
        <p className="mt-2 text-sm text-muted">{t('play.celebrate.body')}</p>
        <div className="mt-5 flex flex-col gap-2">
          <button type="button" onClick={onContinue} className="btn-primary" autoFocus>
            {t('play.celebrate.cta')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={onStay} className="btn-ghost">
            {t('play.celebrate.stay')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
