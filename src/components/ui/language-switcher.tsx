'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(target: 'ko' | 'en') {
    if (target !== locale) {
      router.replace(pathname, { locale: target });
    }
  }

  return (
    <div className="flex items-center rounded-full border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
      <button
        type="button"
        onClick={() => switchTo('ko')}
        className={`rounded-full px-3 py-1 transition-all ${
          locale === 'ko'
            ? 'bg-primary text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        KO
      </button>
      <button
        type="button"
        onClick={() => switchTo('en')}
        className={`rounded-full px-3 py-1 transition-all ${
          locale === 'en'
            ? 'bg-primary text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        EN
      </button>
    </div>
  );
}
