'use client';

import { useLocale, useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import { Link } from '@/i18n/routing';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type UserMenuProps = {
  user: {
    name?: string | null;
    image?: string | null;
    role?: string;
  };
};

export function UserMenu({ user }: UserMenuProps) {
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const locale = useLocale();

  const initials = (user.name ?? 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer ring-2 ring-white/20 hover:ring-white/40">
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User avatar'} />
          <AvatarFallback className="bg-white/15 text-white">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{user.name ?? 'User'}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/my-page" />}>{tCommon('myPage')}</DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard" />}>{tCommon('dashboard')}</DropdownMenuItem>
        {user.role === 'ADMIN' ? (
          <DropdownMenuItem render={<Link href="/admin" />}>{tNav('admin')}</DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
        >
          {tCommon('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
