import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import type { MessageKey } from '@/i18n';
import { ApiError } from '@/lib/api';

/** Turns an API error into a message key (field errors point at the field). */
export function errorKey(e: unknown): MessageKey {
  if (!(e instanceof ApiError)) return 'auth.errServer_error';
  if (e.code === 'invalid_input' && e.field === 'name') return 'auth.errName';
  if (e.code === 'invalid_input' && e.field === 'email') return 'auth.errEmail';
  if (e.code === 'invalid_input' && e.field === 'password') return 'auth.errPassword';
  const map: Partial<Record<ApiError['code'], MessageKey>> = {
    invalid_input: 'auth.errInvalid_input',
    email_taken: 'auth.errEmail_taken',
    bad_credentials: 'auth.errBad_credentials',
    too_many_attempts: 'auth.errToo_many_attempts',
    offline: 'auth.errOffline',
  };
  return map[e.code] ?? 'auth.errServer_error';
}

export function AuthCard({
  title,
  body,
  error,
  children,
  switchText,
  switchTo,
  switchLabel,
}: {
  title: string;
  body: string;
  error: string | null;
  children: ReactNode;
  switchText: string;
  switchTo: string;
  switchLabel: string;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-md flex-col justify-center px-4 py-10">
      <div className="glass rounded-panel p-6 shadow-lift sm:p-8">
        <Logo />
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted">{body}</p>
        {error && (
          <p role="alert" className="mt-5 flex gap-2 rounded-control border border-bad/50 bg-bad/10 px-3 py-2.5 text-sm font-semibold text-bad">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-5 text-center text-sm text-muted">
        {switchText}{' '}
        <Link to={switchTo} className="font-bold text-accent hover:underline">
          {switchLabel}
        </Link>
      </p>
    </div>
  );
}

export function Field({
  id,
  label,
  hint,
  invalid,
  ...input
}: { id: string; label: string; hint?: string; invalid?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`mt-1 min-h-[48px] w-full rounded-control border bg-bg/60 px-3 text-base outline-none focus:border-accent ${invalid ? 'border-bad' : 'border-line'}`}
        {...input}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
