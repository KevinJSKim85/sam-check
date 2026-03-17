import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { socialSignInAction } from '@/app/[locale]/auth/actions';

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  const t = await getTranslations('auth');

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center px-4 py-12 sm:px-6">
      <Card className="w-full border-primary/15 shadow-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">{t('loginTitle')}</CardTitle>
          <p className="text-sm text-body">{t('loginDescription')}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <form action={socialSignInAction} className="w-full">
            <input type="hidden" name="provider" value="kakao" />
            <input type="hidden" name="redirectTo" value={`/${locale}`} />
            <Button type="submit" variant="socialKakao" className="w-full justify-center" size="lg">
              {t('loginWith', { provider: 'Kakao' })}
            </Button>
          </form>

          <form action={socialSignInAction} className="w-full">
            <input type="hidden" name="provider" value="google" />
            <input type="hidden" name="redirectTo" value={`/${locale}`} />
            <Button type="submit" variant="socialGoogle" className="w-full justify-center" size="lg">
              {t('loginWith', { provider: 'Google' })}
            </Button>
          </form>

          <p className="pt-3 text-center text-sm text-body">
            {t('noAccount')}{' '}
            <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
              {t('signupTitle')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
