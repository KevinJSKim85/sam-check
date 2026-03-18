import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { routing } from "@/i18n/routing";
import "../globals.css";

const SITE_URL = "https://sam-check.vercel.app";
const SITE_NAME = "쌤체크 Sam-Check";
const DEFAULT_OG_IMAGE = "/logo-light.png";
const LOCALES = ["ko", "en"] as const;

type AppLocale = (typeof LOCALES)[number];

function isAppLocale(locale: string): locale is AppLocale {
	return LOCALES.includes(locale as AppLocale);
}

function localePath(locale: AppLocale, path = "") {
	return `/${locale}${path}`;
}

function localeAbsoluteUrl(locale: AppLocale, path = "") {
	return `${SITE_URL}${localePath(locale, path)}`;
}

function localeAlternates(path = "") {
	return {
		ko: localeAbsoluteUrl("ko", path),
		en: localeAbsoluteUrl("en", path),
	};
}

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
};

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const activeLocale: AppLocale = isAppLocale(locale) ? locale : "ko";
	const tCommon = await getTranslations({
		locale: activeLocale,
		namespace: "common",
	});

	const title = SITE_NAME;
	const description =
		activeLocale === "ko"
			? "인증된 튜터를 가장 빠르게 찾는 방법"
			: "The fastest way to find verified tutors for international curricula.";
	const canonicalPath = localePath(activeLocale);

	return {
		metadataBase: new URL(SITE_URL),
		title: {
			default: title,
			template: `%s | ${SITE_NAME}`,
		},
		description,
		keywords: [
			"쌤체크",
			"Sam-Check",
			"verified tutors",
			"international curriculum tutor",
			"SAT tutor",
			"AP tutor",
			"IB tutor",
			"online tutoring Korea",
		],
		alternates: {
			canonical: canonicalPath,
			languages: localeAlternates(),
		},
		icons: {
			icon: "/favicon.ico",
			apple: "/apple-touch-icon.png",
		},
		openGraph: {
			title,
			description,
			url: canonicalPath,
			siteName: SITE_NAME,
			locale: activeLocale,
			alternateLocale: LOCALES.filter((item) => item !== activeLocale),
			type: "website",
			images: [
				{
					url: DEFAULT_OG_IMAGE,
					width: 400,
					height: 200,
					alt: `${tCommon("title")} logo`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [DEFAULT_OG_IMAGE],
		},
	};
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
		notFound();
	}
	const messages = await getMessages();
	const organizationSchema = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: SITE_NAME,
		url: SITE_URL,
		logo: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
		sameAs: [],
	};

	return (
		<html lang={locale} className={inter.variable}>
			<body className="antialiased">
				<JsonLd data={organizationSchema} />
				<AuthSessionProvider>
					<NextIntlClientProvider messages={messages}>
						<div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50">
							<Header />
							<main className="flex-1">{children}</main>
							<Footer />
						</div>
					</NextIntlClientProvider>
				</AuthSessionProvider>
			</body>
		</html>
	);
}
