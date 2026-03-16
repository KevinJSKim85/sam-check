'use client';

import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

export default function HomePage() {
  const t = useTranslations('common');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="flex items-center gap-4">
        <h1 className="text-4xl font-bold">{t('title')}</h1>
        <LanguageSwitcher />
      </div>
      <p className="text-lg text-gray-600">{t('description')}</p>
    </main>
  );
}
