import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/db';

type VerifyEmailPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type VerificationStatus = 'sent' | 'required' | 'verified' | 'expired' | 'invalid';

function getFirst(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function confirmEmailVerification(token: string, email: string): Promise<VerificationStatus> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  });

  if (!verificationToken) {
    return 'invalid';
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    });

    return 'expired';
  }

  await prisma.$transaction([
    prisma.user.updateMany({
      where: { email },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    }),
  ]);

  return 'verified';
}

export default async function VerifyEmailPage({ params, searchParams }: VerifyEmailPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations('auth');

  const email = getFirst(query.email);
  const token = getFirst(query.token);
  const statusFromQuery = getFirst(query.status);
  const redirectTo = getFirst(query.redirectTo);

  let status: VerificationStatus = statusFromQuery === 'required' ? 'required' : 'sent';

  if (token && email) {
    status = await confirmEmailVerification(token, email);
  }

  const safeRedirect = redirectTo?.startsWith('/') ? redirectTo : `/${locale}`;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center px-4 py-12 sm:px-6">
      <Card className="w-full border-primary/15 shadow-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">{t(`verifyStatusTitle.${status}`)}</CardTitle>
          <p className="text-sm text-body">{t(`verifyStatusDescription.${status}`)}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {email ? <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{email}</p> : null}

          <Button render={<Link href="/auth/login" />} className="w-full" size="lg">
            {status === 'verified' ? t('loginTitle') : t('goToLogin')}
          </Button>
          <Button render={<Link href={safeRedirect} />} variant="outline" className="w-full" size="lg">
            {t('backHome')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
