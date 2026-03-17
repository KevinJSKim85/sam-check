import { GraduationCap, MessageSquare, Search, ShieldCheck, Star, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { SUBJECTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SubjectIcon } from '@/components/features/home/subject-icon';

const STEP_ICONS = [Search, ShieldCheck, MessageSquare] as const;

export default function HomePage() {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-14 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-700 to-primary-900 px-6 py-16 text-white shadow-xl sm:px-12 sm:py-20">
        <div className="absolute -top-24 right-0 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 left-16 h-52 w-52 rounded-full bg-cta/20 blur-2xl" />
        <div className="absolute right-12 bottom-12 hidden h-40 w-40 rounded-full bg-accent/15 blur-2xl lg:block" />
        <div className="relative flex max-w-3xl flex-col gap-6">
          <Badge className="w-fit border-white/30 bg-white/15 text-white">{t('heroBadge')}</Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{t('heroTitle')}</h1>
          <p className="max-w-xl text-base text-white/90 sm:text-lg">{t('heroDescription')}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button variant="cta" size="lg" render={<Link href="/tutors" />} className="min-h-12 w-full px-8 text-base sm:w-auto">
              {t('heroPrimaryCta')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              render={<Link href="/auth/signup" />}
              className="min-h-12 w-full border-white/40 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
            >
              {t('heroSecondaryCta')}
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <ShieldCheck className="size-7 text-accent" />
          <p className="text-2xl font-bold text-slate-900">100%</p>
          <p className="text-sm text-body">{t('statVerifiedProfiles')}</p>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <GraduationCap className="size-7 text-primary" />
          <p className="text-2xl font-bold text-slate-900">7+</p>
          <p className="text-sm text-body">{t('statCredentialTypes')}</p>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <Users className="size-7 text-cta" />
          <p className="text-2xl font-bold text-slate-900">{SUBJECTS.length}+</p>
          <p className="text-sm text-body">{t('statSubjectsTaught')}</p>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <Star className="size-7 text-amber-400" />
          <p className="text-2xl font-bold text-slate-900">4.9</p>
          <p className="text-sm text-body">{t('statAvgRating')}</p>
        </div>
      </section>

      <section>
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-wide text-primary">{t('stepsLabel')}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            {t('stepsHeading')}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {(['search', 'verify', 'connect'] as const).map((step, index) => {
            const Icon = STEP_ICONS[index];
            return (
              <Card key={step} className="relative border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="space-y-3 p-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary-50">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900">{t(`steps.${step}Title`)}</h3>
                  </div>
                  <p className="text-body">{t(`steps.${step}Description`)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent-50 via-white to-accent-50 px-6 py-10 sm:px-10">
        <div className="flex items-start gap-4">
          <div className="hidden rounded-xl bg-accent-100 p-3 sm:block">
            <ShieldCheck className="size-8 text-accent-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-accent-900">{t('trustTitle')}</h2>
            <p className="mt-3 max-w-3xl text-body">{t('trustDescription')}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['SAT/ACT', 'AP/IB', 'TOEFL/DELF', t('trustBadgeSchoolCert'), t('trustBadgeExperience')].map((label) => (
                <Badge key={label} variant="outline" className="border-accent/30 bg-white px-3 py-1.5 text-accent-800">
                  <ShieldCheck className="mr-1 size-3" />
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">{t('subjectsTitle')}</h2>
          <p className="mt-2 text-body">{t('subjectsDescription')}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SUBJECTS.map((subject) => (
            <Link
              key={subject.value}
              href={`/tutors?subject=${subject.value}`}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 transition-colors group-hover:bg-primary-100">
                <SubjectIcon subject={subject.value} className="size-5 text-primary/70 transition group-hover:text-primary" />
              </div>
              <span className="text-sm font-semibold text-slate-900 sm:text-base">
                {locale === 'ko' ? subject.label.ko : subject.label.en}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-14 text-center text-white sm:px-10">
        <h2 className="text-3xl font-bold">{t('finalCtaTitle')}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/80">{t('finalCtaDescription')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="cta" size="lg" render={<Link href="/tutors" />} className="min-h-12 px-8 text-base">
            {t('heroPrimaryCta')}
          </Button>
          <Button variant="accent" size="lg" render={<Link href="/auth/signup" />} className="min-h-12 px-8 text-base">
            {t('heroSecondaryCta')}
          </Button>
        </div>
      </section>
    </div>
  );
}
