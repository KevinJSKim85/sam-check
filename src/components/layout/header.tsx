import { use } from 'react';
import { auth } from '@/auth';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { prisma } from '@/lib/db';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/layout/user-menu';
import { MobileNav } from '@/components/layout/mobile-nav';

export function Header() {
  const session = use(auth());
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const unreadCount = use(
    session?.user
      ? prisma.message.count({
          where: {
            receiverId: session.user.id,
            isRead: false,
          },
        })
      : Promise.resolve(0)
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/20 bg-primary text-white shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight">
            쌤체크
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="/" className="text-white/90 transition hover:text-white">
              {tNav('home')}
            </Link>
            <Link href="/tutors" className="text-white/90 transition hover:text-white">
              {tNav('findTutor')}
            </Link>
            <Link
              href={session?.user ? '/messages' : '/auth/login'}
              className="inline-flex items-center gap-1 text-white/90 transition hover:text-white"
            >
              {tNav('messages')}
              {unreadCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </Link>
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          {session?.user ? (
            <div className="flex items-center gap-2">
              <span className="max-w-32 truncate text-sm text-white/90">{session.user.name}</span>
              <UserMenu user={session.user} />
            </div>
          ) : (
            <Button
              render={<Link href="/auth/login" />}
              className="bg-white text-primary hover:bg-white/90"
            >
              {tCommon('login')}
            </Button>
          )}
        </div>

        <div className="md:hidden">
          <MobileNav isAuthenticated={Boolean(session?.user)} />
        </div>
      </div>
    </header>
  );
}
