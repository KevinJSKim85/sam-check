import {
	GraduationCap,
	MessageSquare,
	Search,
	ShieldCheck,
	Star,
	Users,
} from "lucide-react";
import type { Metadata } from "next";
import { useLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { SubjectIcon } from "@/components/features/home/subject-icon";
import { TutorFinderFlow } from "@/components/features/tutors/tutor-finder-flow";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { SUBJECTS } from "@/lib/constants";

const STEP_ICONS = [Search, ShieldCheck, MessageSquare] as const;
const SITE_URL = "https://sam-check.vercel.app";
const SITE_NAME = "쌤체크 Sam-Check";

function homepageAlternates() {
	return {
		ko: `${SITE_URL}/ko`,
		en: `${SITE_URL}/en`,
	};
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const activeLocale = locale === "en" ? "en" : "ko";
	const tHome = await getTranslations({
		locale: activeLocale,
		namespace: "home",
	});

	return {
		title: tHome("heroTitle"),
		description: tHome("heroDescription"),
		alternates: {
			canonical: `/${activeLocale}`,
			languages: homepageAlternates(),
		},
		openGraph: {
			title: tHome("heroTitle"),
			description: tHome("heroDescription"),
			url: `/${activeLocale}`,
			type: "website",
			images: [
				{
					url: "/logo-light.png",
					width: 400,
					height: 200,
					alt: `${SITE_NAME} logo`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: tHome("heroTitle"),
			description: tHome("heroDescription"),
			images: ["/logo-light.png"],
		},
	};
}

export default function HomePage() {
	const t = useTranslations("home");
	const locale = useLocale();
	const educationalOrganizationSchema = {
		"@context": "https://schema.org",
		"@type": "EducationalOrganization",
		name: SITE_NAME,
		url: SITE_URL,
		logo: `${SITE_URL}/logo-light.png`,
		description: t("heroDescription"),
		areaServed: "KR",
		availableLanguage: ["ko", "en"],
		makesOffer: {
			"@type": "Offer",
			category:
				locale === "ko"
					? "검증된 튜터 매칭 서비스"
					: "Verified tutor matching service",
		},
	};

	return (
		<div className="flex w-full flex-col">
			<JsonLd data={educationalOrganizationSchema} />
			<TutorFinderFlow />

			<div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-14 sm:px-6 lg:px-8">
				<section className="grid grid-cols-2 gap-4 md:grid-cols-4">
					<div className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
						<ShieldCheck className="size-7 text-accent" />
						<p className="text-2xl font-bold text-slate-900">100%</p>
						<p className="text-sm text-body">{t("statVerifiedProfiles")}</p>
					</div>
					<div className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
						<GraduationCap className="size-7 text-primary" />
						<p className="text-2xl font-bold text-slate-900">7+</p>
						<p className="text-sm text-body">{t("statCredentialTypes")}</p>
					</div>
					<div className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
						<Users className="size-7 text-cta" />
						<p className="text-2xl font-bold text-slate-900">
							{SUBJECTS.length}+
						</p>
						<p className="text-sm text-body">{t("statSubjectsTaught")}</p>
					</div>
					<div className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
						<Star className="size-7 text-amber-400" />
						<p className="text-2xl font-bold text-slate-900">4.9</p>
						<p className="text-sm text-body">{t("statAvgRating")}</p>
					</div>
				</section>

				<section>
					<div className="mb-8 text-center">
						<p className="text-sm font-semibold tracking-wide text-primary">
							{t("stepsLabel")}
						</p>
						<h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
							{t("stepsHeading")}
						</h2>
					</div>
					<div className="grid gap-6 md:grid-cols-3">
						{(["search", "verify", "connect"] as const).map((step, index) => {
							const Icon = STEP_ICONS[index];
							return (
								<Card
									key={step}
									className="relative border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
								>
									<CardContent className="space-y-3 p-6">
										<div className="flex size-12 items-center justify-center rounded-xl bg-primary-50">
											<Icon className="size-6 text-primary" />
										</div>
										<div className="flex items-center gap-2">
											<span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
												{index + 1}
											</span>
											<h3 className="text-lg font-semibold text-slate-900">
												{t(`steps.${step}Title`)}
											</h3>
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
							<h2 className="text-2xl font-bold text-accent-900">
								{t("trustTitle")}
							</h2>
							<p className="mt-3 max-w-3xl text-body">
								{t("trustDescription")}
							</p>
							<div className="mt-5 flex flex-wrap gap-2">
								{[
									"SAT/ACT",
									"AP/IB",
									"TOEFL/DELF",
									t("trustBadgeSchoolCert"),
									t("trustBadgeExperience"),
								].map((label) => (
									<Badge
										key={label}
										variant="outline"
										className="h-auto border-accent/30 bg-white px-4 py-2 text-sm text-accent-800"
									>
										<ShieldCheck className="mr-1.5 size-4" />
										{label}
									</Badge>
								))}
							</div>
						</div>
					</div>
				</section>

				<section>
					<div className="mb-6">
						<h2 className="text-2xl font-bold text-slate-900">
							{t("subjectsTitle")}
						</h2>
						<p className="mt-2 text-body">{t("subjectsDescription")}</p>
					</div>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
						{SUBJECTS.map((subject) => (
							<Link
								key={subject.value}
								href={`/tutors?subject=${subject.value}`}
								className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
							>
								<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 transition-colors group-hover:bg-primary-100">
									<SubjectIcon
										subject={subject.value}
										className="size-5 text-primary/70 transition group-hover:text-primary"
									/>
								</div>
								<span className="text-sm font-semibold text-slate-900 sm:text-base">
									{locale === "ko" ? subject.label.ko : subject.label.en}
								</span>
							</Link>
						))}
					</div>
				</section>

				<section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-14 text-center text-white sm:px-10">
					<h2 className="text-3xl font-bold">{t("finalCtaTitle")}</h2>
					<p className="mx-auto mt-3 max-w-2xl text-white/80">
						{t("finalCtaDescription")}
					</p>
					<div className="mt-8 flex flex-wrap justify-center gap-3">
						<Button
							variant="cta"
							size="lg"
							render={<Link href="/tutors" />}
							className="min-h-12 px-8 text-base"
						>
							{t("heroPrimaryCta")}
						</Button>
						<Button
							variant="accent"
							size="lg"
							render={<Link href="/auth/signup" />}
							className="min-h-12 px-8 text-base"
						>
							{t("heroSecondaryCta")}
						</Button>
					</div>
				</section>
			</div>
		</div>
	);
}
