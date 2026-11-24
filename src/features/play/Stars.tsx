import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useT } from '@/i18n';

export function Stars({ n, size = 'lg' }: { n: number; size?: 'sm' | 'lg' }) {
  const t = useT();
  const cls = size === 'lg' ? 'h-9 w-9' : 'h-4 w-4';
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={t('play.try.stars', { n })}>
      {[1, 2, 3].map((i) => (
        <motion.span
          key={i}
          initial={size === 'lg' ? { scale: 0, rotate: -40 } : false}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15 * i, type: 'spring', stiffness: 300, damping: 14 }}
        >
          <Star className={`${cls} ${i <= n ? 'fill-triangle text-triangle' : 'text-line'}`} aria-hidden="true" />
        </motion.span>
      ))}
    </span>
  );
}
