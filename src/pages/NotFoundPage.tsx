import { Link } from 'react-router-dom';
import { useT } from '@/i18n';

export default function NotFoundPage() {
  const t = useT();
  return (
    <section className="mx-auto flex max-w-xl flex-col items-start gap-4 px-4 py-24 sm:px-6">
      <p className="num text-6xl font-bold text-accent">404</p>
      <h1 className="text-3xl font-extrabold">{t('notFound.title')}</h1>
      <p className="text-muted">{t('notFound.body')}</p>
      <Link to="/" className="btn-primary mt-2">
        {t('notFound.home')}
      </Link>
    </section>
  );
}
