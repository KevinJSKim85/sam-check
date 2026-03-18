import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LoginPageClient } from '@/components/features/auth/login-page-client';

const SITE_URL = 'https://sam-check.vercel.app';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale = locale === 'en' ? 'en' : 'ko';
  const tAuth = await getTranslations({ locale: activeLocale, namespace: 'auth' });
  const title = tAuth('loginTitle');
  const description = tAuth('loginDescription');
  const path = `/${activeLocale}/auth/login`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: {
        ko: `${SITE_URL}/ko/auth/login`,
        en: `${SITE_URL}/en/auth/login`,
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

export default function LoginPage() {
  return <LoginPageClient />;
}
