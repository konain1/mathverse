import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthCard, Field, errorKey } from '@/features/auth/AuthForm';
import { useT } from '@/i18n';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/state/auth';
import { useSettings } from '@/state/settings';
import { CLASS_LEVELS } from '@/topics/types';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const t = useT();
  const navigate = useNavigate();
  const status = useAuth((s) => s.status);
  const signup = useAuth((s) => s.signup);
  const savedClass = useSettings((s) => s.classLevel);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [classLevel, setClassLevel] = useState<number>(savedClass);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [badField, setBadField] = useState<string | undefined>();

  if (status === 'user' && !busy) return <Navigate to="/profile" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    // check on the device first, so students get instant feedback
    const field = name.trim().length < 2 ? 'name' : !EMAIL.test(email.trim()) ? 'email' : password.length < 8 ? 'password' : undefined;
    if (field) {
      setBadField(field);
      setError(t(errorKey(new ApiError('invalid_input', 400, field))));
      return;
    }
    setBusy(true);
    setError(null);
    setBadField(undefined);
    try {
      await signup({ name: name.trim(), email: email.trim(), password, classLevel });
      navigate('/profile', { replace: true });
    } catch (err) {
      setBadField(err instanceof ApiError ? err.field : undefined);
      setError(t(errorKey(err)));
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title={t('auth.signupTitle')}
      body={t('auth.signupBody')}
      error={error}
      switchText={t('auth.haveAccount')}
      switchTo="/login"
      switchLabel={t('auth.login')}
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field id="name" label={t('auth.name')} autoComplete="name" required invalid={badField === 'name'} value={name} onChange={(e) => setName(e.target.value)} />
        <Field
          id="email"
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          required
          invalid={badField === 'email'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="password"
          label={t('auth.password')}
          hint={t('auth.passwordHint')}
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          invalid={badField === 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <fieldset>
          <legend className="text-sm font-semibold">{t('auth.classLevel')}</legend>
          <div className="mt-1.5 grid grid-cols-3 gap-2" role="radiogroup">
            {CLASS_LEVELS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={classLevel === c}
                onClick={() => setClassLevel(c)}
                className={`min-h-[48px] rounded-control border text-sm font-bold ${classLevel === c ? 'border-accent bg-accent text-bg' : 'border-line text-ink hover:border-accent/70'}`}
              >
                {t('auth.classOption', { n: c })}
              </button>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="btn-primary mt-2" disabled={busy}>
          {busy ? t('auth.working') : t('auth.submitSignup')}
        </button>
      </form>
    </AuthCard>
  );
}
