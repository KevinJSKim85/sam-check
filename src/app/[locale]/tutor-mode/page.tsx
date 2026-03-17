import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function TutorModePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role === 'ADMIN' || session.user.role === 'TUTOR') {
    redirect('/admin');
  }

  return <TutorModeAccessDenied />;
}

function TutorModeAccessDenied() {
  const t = useTranslations('tutorMode');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-red-50 p-4">
        <ShieldX className="size-10 text-red-400" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">{t('accessDeniedTitle')}</h1>
      <p className="mt-3 max-w-md text-body">{t('accessDeniedDescription')}</p>
      <div className="mt-8 flex gap-3">
        <Button render={<Link href="/" />} variant="outline">
          {t('goHome')}
        </Button>
        <Button render={<Link href="/auth/signup" />} variant="cta">
          {t('registerAsTutor')}
        </Button>
      </div>
    </div>
  );
}
