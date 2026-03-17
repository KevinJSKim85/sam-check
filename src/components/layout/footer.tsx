import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/brand/logo';

export function Footer() {
  const tLegal = useTranslations('legal');
  const tCommon = useTranslations('common');

  return (
    <footer className="mt-auto border-t border-white/20 bg-primary text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:px-6 lg:px-8">
        <Logo theme="dark" />
        <p className="text-white/80">© 2026 {tCommon('title')}. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/privacy" className="text-white/70 underline-offset-4 transition hover:text-white hover:underline">
            {tLegal('privacyTitle')}
          </Link>
          <Link href="/terms" className="text-white/70 underline-offset-4 transition hover:text-white hover:underline">
            {tLegal('termsTitle')}
          </Link>
        </div>
        <p className="text-white/60">help@samcheck.kr</p>
      </div>
    </footer>
  );
}
