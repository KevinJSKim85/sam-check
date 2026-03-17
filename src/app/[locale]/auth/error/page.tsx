'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function AuthErrorPage() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const isEmailRequired = error === 'EmailRequired';

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6">
      <h1 className="text-2xl font-semibold">{t('errorTitle')}</h1>
      {isEmailRequired ? (
        <>
          <p className="text-base text-red-600">{t('emailRequired')}</p>
          <p className="text-sm text-body">{t('emailRequiredFallback')}</p>
        </>
      ) : (
        <p className="text-base text-red-600">{t('genericError')}</p>
      )}
      <Link
        href="/auth/login"
        className="inline-flex min-h-11 items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
      >
        {t('loginTitle')}
      </Link>
    </main>
  );
}
