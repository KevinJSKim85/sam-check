'use client';

import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const fallbackMessages = {
  ko: {
    generic: '로그인 중 오류가 발생했습니다. 다시 시도해주세요.',
    emailRequiredEn: 'Email sharing consent is required to continue.',
  },
  en: {
    generic: 'An error occurred while signing in. Please try again.',
    emailRequiredKo: '계속하려면 이메일 제공 동의가 필요합니다.',
  },
};

export default function AuthErrorPage() {
  const t = useTranslations('auth');
  const locale = useLocale() as 'ko' | 'en';
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const isEmailRequired = error === 'EmailRequired';

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Auth Error</h1>
      {isEmailRequired ? (
        <>
          <p className="text-base text-red-600">{t('emailRequired')}</p>
          <p className="text-sm text-gray-600">
            {locale === 'ko'
              ? fallbackMessages.ko.emailRequiredEn
              : fallbackMessages.en.emailRequiredKo}
          </p>
        </>
      ) : (
        <p className="text-base text-red-600">{fallbackMessages[locale].generic}</p>
      )}
      <Link
        href="/auth/login"
        className="inline-flex rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
      >
        {t('loginTitle')}
      </Link>
    </main>
  );
}
