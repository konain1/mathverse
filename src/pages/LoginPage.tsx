import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthCard, Field, errorKey } from '@/features/auth/AuthForm';
import { useT } from '@/i18n';
import { useAuth } from '@/state/auth';

export default function LoginPage() {
  const t = useT();
  const navigate = useNavigate();
  const next = (useLocation().state as { from?: string } | null)?.from ?? '/profile';
  const status = useAuth((s) => s.status);
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === 'user' && !busy) return <Navigate to={next} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(t(errorKey(err)));
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title={t('auth.loginTitle')}
      body={t('auth.loginBody')}
      error={error}
      switchText={t('auth.noAccount')}
      switchTo="/signup"
      switchLabel={t('auth.signup')}
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field id="email" label={t('auth.email')} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          id="password"
          label={t('auth.password')}
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn-primary mt-2" disabled={busy}>
          {busy ? t('auth.working') : t('auth.submitLogin')}
        </button>
      </form>
    </AuthCard>
  );
}
