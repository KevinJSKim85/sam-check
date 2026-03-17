import { use } from 'react';
import { auth } from '@/auth';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { prisma } from '@/lib/db';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/layout/user-menu';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Logo } from '@/components/brand/logo';

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
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-white shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Logo theme="light" />
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-semibold md:flex">
            <Link href="/tutors" className="rounded-lg px-3 py-2 text-primary/70 transition hover:bg-primary/5 hover:text-primary">
              {tNav('findTutor')}
            </Link>
            <Link href="/tutor-mode" className="rounded-lg px-3 py-2 text-primary/70 transition hover:bg-primary/5 hover:text-primary">
              {tNav('tutorMode')}
            </Link>
            <Link
              href={session?.user ? '/messages' : '/auth/login'}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-primary/70 transition hover:bg-primary/5 hover:text-primary"
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
              <span className="max-w-32 truncate text-sm text-body">{session.user.name}</span>
              <UserMenu user={session.user} />
            </div>
          ) : (
            <Button
              render={<Link href="/auth/login" />}
              className="bg-primary text-white hover:bg-primary-600"
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
