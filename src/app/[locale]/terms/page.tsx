import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

const SITE_URL = 'https://sam-check.vercel.app';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale = locale === 'en' ? 'en' : 'ko';
  const tLegal = await getTranslations({ locale: activeLocale, namespace: 'legal' });
  const title = tLegal('termsTitle');
  const description =
    activeLocale === 'ko'
      ? '쌤체크 이용약관을 확인하세요.'
      : 'Review Sam-Check Terms of Service.';
  const path = `/${activeLocale}/terms`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: {
        ko: `${SITE_URL}/ko/terms`,
        en: `${SITE_URL}/en/terms`,
      },
    },
    openGraph: {
      title,
      description,
      url: path,
      type: 'article',
      images: [{ url: '/logo-light.png', width: 400, height: 200, alt: title }],
    },
  };
}

export default function TermsPage() {
  const tLegal = useTranslations('legal');

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">{tLegal('termsTitle')}</h1>
      <p className="mt-2 text-sm text-body">{tLegal('updatedAt')}</p>

      <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">{tLegal('terms.section1Title')}</h2>
          <p>{tLegal('terms.section1Body')}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">{tLegal('terms.section2Title')}</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>{tLegal('terms.section2Item1')}</li>
            <li>{tLegal('terms.section2Item2')}</li>
            <li>{tLegal('terms.section2Item3')}</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">{tLegal('terms.section3Title')}</h2>
          <p>{tLegal('terms.section3Body')}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">{tLegal('terms.section4Title')}</h2>
          <p>{tLegal('terms.section4Body')}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">{tLegal('terms.section5Title')}</h2>
          <p>{tLegal('terms.section5Body')}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">{tLegal('terms.section6Title')}</h2>
          <p>{tLegal('terms.section6Body')}</p>
        </section>
      </div>

      <Link href="/" className="mt-10 inline-block text-sm font-medium text-primary hover:underline">
        {tLegal('backHome')}
      </Link>
    </article>
  );
}
