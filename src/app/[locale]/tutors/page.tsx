import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { use } from "react";
import { TutorFinderFlow } from "@/components/features/tutors/tutor-finder-flow";
import { TutorsListingClient } from "@/components/features/tutors/tutors-listing-client";

const SITE_URL = "https://sam-check.vercel.app";

function tutorsAlternates() {
	return {
		ko: `${SITE_URL}/ko/tutors`,
		en: `${SITE_URL}/en/tutors`,
	};
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const activeLocale = locale === "en" ? "en" : "ko";
	const tTutor = await getTranslations({
		locale: activeLocale,
		namespace: "tutor",
	});
	const title = activeLocale === "ko" ? "튜터 찾기" : "Find Tutors";
	const description =
		activeLocale === "ko"
			? "과목, 커리큘럼, 수업 방식으로 검증된 튜터를 검색하고 비교해보세요."
			: "Search and compare verified tutors by subject, curriculum, and teaching mode.";

	return {
		title,
		description,
		alternates: {
			canonical: `/${activeLocale}/tutors`,
			languages: tutorsAlternates(),
		},
		openGraph: {
			title,
			description,
			url: `/${activeLocale}/tutors`,
			type: "website",
			images: [
				{
					url: "/logo-light.png",
					width: 400,
					height: 200,
					alt: tTutor("tutorsCount", { count: 1 }),
				},
			],
		},
	};
}

export default function TutorsPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const params = use(searchParams);
	const hasFilters = Object.keys(params).length > 0;

	if (hasFilters) {
		return <TutorsListingClient initialSearchParams={params} />;
	}

	return <TutorFinderFlow />;
}
