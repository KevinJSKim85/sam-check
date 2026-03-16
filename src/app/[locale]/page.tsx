import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { SUBJECTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-14 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-700 to-primary-900 px-6 py-16 text-white shadow-xl sm:px-12">
        <div className="absolute -top-24 right-0 h-60 w-60 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-20 left-16 h-52 w-52 rounded-full bg-cta/30 blur-2xl" />
        <div className="relative flex max-w-3xl flex-col gap-6">
          <Badge className="w-fit border-white/30 bg-white/15 text-white">{t('heroBadge')}</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('heroTitle')}</h1>
          <p className="max-w-xl text-base text-white/90 sm:text-lg">{t('heroDescription')}</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="cta" size="lg" render={<Link href="/tutors" />}>
              {t('heroPrimaryCta')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              render={<Link href="/auth/signup" />}
              className="border-white/40 bg-white/10 text-white hover:bg-white/20"
            >
              {t('heroSecondaryCta')}
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 bg-white shadow-sm">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm font-semibold text-primary">01</p>
            <h2 className="text-xl font-semibold">{t('steps.searchTitle')}</h2>
            <p className="text-body">{t('steps.searchDescription')}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-white shadow-sm">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm font-semibold text-primary">02</p>
            <h2 className="text-xl font-semibold">{t('steps.verifyTitle')}</h2>
            <p className="text-body">{t('steps.verifyDescription')}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-white shadow-sm">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm font-semibold text-primary">03</p>
            <h2 className="text-xl font-semibold">{t('steps.connectTitle')}</h2>
            <p className="text-body">{t('steps.connectDescription')}</p>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-3xl border border-accent/30 bg-accent-50 px-6 py-10 sm:px-10">
        <h2 className="text-2xl font-bold text-accent-900">{t('trustTitle')}</h2>
        <p className="mt-3 max-w-3xl text-body">{t('trustDescription')}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900">{t('subjectsTitle')}</h2>
        <p className="mt-2 text-body">{t('subjectsDescription')}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SUBJECTS.map((subject) => (
            <Link
              key={subject.value}
              href={`/tutors?subject=${subject.value}`}
              className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <p className="font-semibold text-slate-900">
                {locale === 'ko' ? subject.label.ko : subject.label.en}
              </p>
              <p className="mt-1 text-sm text-body group-hover:text-primary">{t('subjectCardAction')}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-slate-900 px-6 py-12 text-center text-white sm:px-10">
        <h2 className="text-3xl font-bold">{t('finalCtaTitle')}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/80">{t('finalCtaDescription')}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="cta" size="lg" render={<Link href="/tutors" />}>
            {t('heroPrimaryCta')}
          </Button>
          <Button variant="accent" size="lg" render={<Link href="/auth/signup" />}>
            {t('heroSecondaryCta')}
          </Button>
        </div>
      </section>
    </div>
  );
}
