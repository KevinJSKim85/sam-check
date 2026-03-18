import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SignupPageClient } from '@/components/features/auth/signup-page-client';

const SITE_URL = 'https://sam-check.vercel.app';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale = locale === 'en' ? 'en' : 'ko';
  const tAuth = await getTranslations({ locale: activeLocale, namespace: 'auth' });
  const title = tAuth('signupTitle');
  const description = tAuth('signupDescription');
  const path = `/${activeLocale}/auth/signup`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: {
        ko: `${SITE_URL}/ko/auth/signup`,
        en: `${SITE_URL}/en/auth/signup`,
      },
    },
    openGraph: {
      title,
      description,
      url: path,
      type: 'website',
      images: [{ url: '/logo-light.png', width: 400, height: 200, alt: title }],
    },
  };
}

export default function SignupPage() {
  return <SignupPageClient />;
}
