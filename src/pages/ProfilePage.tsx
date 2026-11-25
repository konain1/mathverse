import { BookOpenCheck, Box, Eye, LogOut, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ShapeIcon } from '@/components/ShapeIcon';
import { RocketProgress } from '@/features/profile/RocketProgress';
import { useLang, useLocalize, useT, LANG_META } from '@/i18n';
import { useAuth } from '@/state/auth';
import { useProgress } from '@/state/progress';
import { topicsForClass } from '@/topics/registry';
import { CLASS_LEVELS, type ClassLevel } from '@/topics/types';

const sum = (m: Record<string, Record<string, unknown>>, f: (v: unknown) => number) =>
  Object.values(m).reduce((s, qs) => s + Object.values(qs).reduce<number>((a, v) => a + f(v), 0), 0);

function Stat({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="glass rounded-card p-4">
      <span className="text-accent">{icon}</span>
      <p className="num mt-2 text-3xl font-extrabold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const t = useT();
  const loc = useLocalize();
  const lang = useLang();
  const navigate = useNavigate();
  const { status, user, logout } = useAuth();
  const { stars, built, watched } = useProgress();

  if (status === 'loading') return <div className="grid min-h-[60vh] place-items-center text-muted">{t('common.loading')}</div>;
  if (status === 'guest' || !user) return <Navigate to="/login" replace state={{ from: '/profile' }} />;

  const classLevel: ClassLevel = (CLASS_LEVELS as readonly number[]).includes(user.classLevel) ? (user.classLevel as ClassLevel) : 8;
  const topics = topicsForClass(classLevel).filter((x) => x.playable);
  const totalStars = sum(stars, (v) => Number(v));
  const solved = sum(stars, (v) => (Number(v) > 0 ? 1 : 0));
  const totalQs = topics.reduce((a, x) => a + x.meta.levels.length, 0);
  const doneQs = topics.reduce((a, x) => a + Object.values(stars[x.meta.id] ?? {}).filter((n) => n > 0).length, 0);
  const pct = totalQs ? Math.round((doneQs / totalQs) * 100) : 0;
  const since = new Date(user.createdAt.replace(' ', 'T') + 'Z').toLocaleDateString(LANG_META[lang].htmlLang, { month: 'long', year: 'numeric' });

  return (
    <div className="mx-auto max-w-page px-4 py-8 sm:px-6 lg:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('auth.hello', { name: user.name })}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="rounded-full border border-accent/60 px-2.5 py-0.5 font-bold text-accent">{t('auth.classBadge', { n: classLevel })}</span>
            <span>{user.email}</span>
            <span>{t('auth.memberSince', { date: since })}</span>
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={async () => {
            await logout();
            navigate('/', { replace: true });
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {t('auth.logout')}
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <section aria-labelledby="rocket-title">
          <h2 id="rocket-title" className="mb-3 text-xl font-extrabold">{t('auth.rocketTitle')}</h2>
          <RocketProgress pct={pct} label={t('auth.rocketAria', { pct })} />
          <p className="mt-3 text-sm font-semibold">{pct >= 100 ? t('auth.rocketDone') : t('auth.rocketLine', { pct, left: totalQs - doneQs })}</p>
        </section>
        <div>
      <section className="grid grid-cols-2 gap-3" aria-label={t('auth.profile')}>
        <Stat icon={<Star className="h-5 w-5" aria-hidden="true" />} value={totalStars} label={t('auth.statStars')} />
        <Stat icon={<BookOpenCheck className="h-5 w-5" aria-hidden="true" />} value={solved} label={t('auth.statSolved')} />
        <Stat icon={<Box className="h-5 w-5" aria-hidden="true" />} value={sum(built, () => 1)} label={t('auth.statBuilt')} />
        <Stat icon={<Eye className="h-5 w-5" aria-hidden="true" />} value={sum(watched, () => 1)} label={t('auth.statWatched')} />
      </section>
      <p className="mt-3 text-xs text-muted">{t('auth.synced')}</p>
        </div>
      </div>

      <section className="mt-10" aria-labelledby="my-topics">
        <h2 id="my-topics" className="text-xl font-extrabold">
          {t('auth.topicsTitle')}
        </h2>
        {solved === 0 && (
          <p className="mt-2 text-muted">
            {t('auth.noProgress')}{' '}
            <Link to="/#topics" className="font-bold text-accent hover:underline">
              {t('auth.pickTopic')}
            </Link>
          </p>
        )}
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map(({ meta }) => {
            const s = stars[meta.id] ?? {};
            const done = Object.values(s).filter((n) => n > 0).length;
            const total = meta.levels.length;
            const pct = Math.min(100, Math.round((done / Math.max(1, total)) * 100));
            return (
              <li key={meta.id} data-accent={meta.family}>
                <Link to={`/topic/${meta.id}`} className="glass block rounded-card p-4 transition-colors hover:border-accent/70">
                  <span className="flex items-center gap-2 font-bold">
                    <span className="text-accent">
                      <ShapeIcon family={meta.family} className="h-4 w-4" />
                    </span>
                    {loc(meta.title)}
                  </span>
                  <span className="num mt-1 block text-xs text-muted">
                    {t('auth.topicLine', { solved: done, total, stars: Object.values(s).reduce((a, n) => a + n, 0) })}
                  </span>
                  <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
                    <span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
