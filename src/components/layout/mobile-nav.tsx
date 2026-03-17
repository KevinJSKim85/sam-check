'use client';

import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type MobileNavProps = {
  isAuthenticated: boolean;
};

export function MobileNav({ isAuthenticated }: MobileNavProps) {
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tLegal = useTranslations('legal');

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10" />}>
        <Menu />
        <span className="sr-only">{tCommon('openNavigation')}</span>
      </SheetTrigger>
      <SheetContent side="right" className="bg-primary-900 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">{tCommon('title')}</SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-2 px-4">
          <SheetClose render={<Link href="/" className="rounded-md px-3 py-2 hover:bg-white/10" />}>
            {tNav('home')}
          </SheetClose>
          <SheetClose render={<Link href="/tutors" className="rounded-md px-3 py-2 hover:bg-white/10" />}>
            {tNav('findTutor')}
          </SheetClose>
          <SheetClose render={<Link href="/privacy" className="rounded-md px-3 py-2 hover:bg-white/10" />}>
            {tLegal('privacyTitle')}
          </SheetClose>
          <SheetClose render={<Link href="/terms" className="rounded-md px-3 py-2 hover:bg-white/10" />}>
            {tLegal('termsTitle')}
          </SheetClose>
          {!isAuthenticated ? (
            <SheetClose
              render={<Link href="/auth/login" className="rounded-md bg-white/15 px-3 py-2 hover:bg-white/20" />}
            >
              {tCommon('login')}
            </SheetClose>
          ) : null}
          <div className="pt-2">
            <LanguageSwitcher />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
