import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useT } from '@/i18n';
import { useAuth } from '@/state/auth';

/** Header: "Log in" for guests, the student's initial (→ profile) once logged in. */
export function AccountButton() {
  const t = useT();
  const status = useAuth((s) => s.status);
  const name = useAuth((s) => s.user?.name);
  if (status === 'loading') return <span className="h-11 w-11" aria-hidden="true" />;
  if (status === 'user' && name)
    return (
      <Link
        to="/profile"
        aria-label={t('auth.profile')}
        title={t('auth.profile')}
        className="grid h-11 w-11 place-items-center rounded-full bg-accent text-base font-extrabold uppercase text-bg"
      >
        {name.trim().charAt(0)}
      </Link>
    );
  return (
    <Link to="/login" className="btn-ghost min-h-[44px] px-3 text-sm">
      <LogIn className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{t('auth.login')}</span>
      <span className="sr-only sm:hidden">{t('auth.login')}</span>
    </Link>
  );
}
