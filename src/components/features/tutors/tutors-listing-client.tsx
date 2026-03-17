"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	ChevronLeft,
	ChevronRight,
	Search,
	SlidersHorizontal,
	X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { TutorCard } from "@/components/features/tutors/tutor-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorFallback } from "@/components/ui/error-fallback";
import { Input } from "@/components/ui/input";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { usePathname, useRouter } from "@/i18n/routing";
import { CURRICULA, SUBJECTS } from "@/lib/constants";
import type { TeachingMode, TutorCard as TutorCardType } from "@/types/tutor";

type SortOption = "newest" | "rating" | "priceLow" | "priceHigh";

type ListingApiResponse = {
	items: TutorCardType[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
};

function parseArrayParams(searchParams: URLSearchParams, key: string) {
	return searchParams
		.getAll(key)
		.flatMap((value) => value.split(","))
		.map((value) => value.trim())
		.filter(Boolean);
}

function getSubjectLabel(value: string, locale: string) {
	const subject = SUBJECTS.find((item) => item.value === value);
	if (!subject) return value;
	return locale === "ko" ? subject.label.ko : subject.label.en;
}

function getCurriculumLabel(value: string) {
	const curriculum = CURRICULA.find((item) => item.value === value);
	return curriculum ? curriculum.label : value;
}

function buildPageNumbers(current: number, total: number) {
	if (total <= 1) return [1];

	const pages = new Set<number>([1, total]);
	pages.add(current);
	pages.add(Math.max(1, current - 1));
	pages.add(Math.min(total, current + 1));

	return Array.from(pages).sort((a, b) => a - b);
}

function formatPriceLabel(value: string) {
	const amount = Number(value);
	if (!Number.isFinite(amount)) return value;
	return `₩${amount.toLocaleString()}`;
}

function FiltersPanel({
	locale,
	selectedCurricula,
	selectedSubjects,
	minPrice,
	maxPrice,
	teachingMode,
	verifiedOnly,
	onToggleCurriculum,
	onToggleSubject,
	onPriceChange,
	onTeachingModeChange,
	onVerifiedOnlyChange,
	onClear,
}: {
	locale: string;
	selectedCurricula: string[];
	selectedSubjects: string[];
	minPrice: string;
	maxPrice: string;
	teachingMode: "" | TeachingMode;
	verifiedOnly: boolean;
	onToggleCurriculum: (value: string) => void;
	onToggleSubject: (value: string) => void;
	onPriceChange: (type: "minPrice" | "maxPrice", value: string) => void;
	onTeachingModeChange: (value: "" | TeachingMode) => void;
	onVerifiedOnlyChange: (value: boolean) => void;
	onClear: () => void;
}) {
	const tTutor = useTranslations("tutor");

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-sm font-semibold text-slate-900">
					{tTutor("filter")}
				</h2>
				<Button
					variant="ghost"
					size="sm"
					onClick={onClear}
					className="min-h-11"
				>
					{tTutor("clearFilters")}
				</Button>
			</div>

			<div className="space-y-3">
				<h3 className="text-sm font-semibold text-slate-700">
					{tTutor("curricula")}
				</h3>
				<div className="space-y-2">
					{CURRICULA.map((curriculum) => (
						<label
							key={curriculum.value}
							className="flex min-h-11 items-center gap-2 py-1 text-sm text-slate-700"
						>
							<input
								type="checkbox"
								className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
								checked={selectedCurricula.includes(curriculum.value)}
								onChange={() => onToggleCurriculum(curriculum.value)}
							/>
							{curriculum.label}
						</label>
					))}
				</div>
			</div>

			<div className="space-y-3">
				<h3 className="text-sm font-semibold text-slate-700">
					{tTutor("subjects")}
				</h3>
				<div className="space-y-2">
					{SUBJECTS.map((subject) => (
						<label
							key={subject.value}
							className="flex min-h-11 items-center gap-2 py-1 text-sm text-slate-700"
						>
							<input
								type="checkbox"
								className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
								checked={selectedSubjects.includes(subject.value)}
								onChange={() => onToggleSubject(subject.value)}
							/>
							{locale === "ko" ? subject.label.ko : subject.label.en}
						</label>
					))}
				</div>
			</div>

			<div className="space-y-3">
				<h3 className="text-sm font-semibold text-slate-700">
					{tTutor("hourlyRate")}
				</h3>
				<div className="grid grid-cols-2 gap-2">
					<Input
						value={minPrice}
						onChange={(event) => onPriceChange("minPrice", event.target.value)}
						placeholder="10000"
						className="h-11"
					/>
					<Input
						value={maxPrice}
						onChange={(event) => onPriceChange("maxPrice", event.target.value)}
						placeholder="200000"
						className="h-11"
					/>
				</div>
			</div>

			<div className="space-y-3">
				<h3 className="text-sm font-semibold text-slate-700">
					{tTutor("teachingMode")}
				</h3>
				<div className="space-y-2 text-sm text-slate-700">
					<label className="flex min-h-11 items-center gap-2 py-1">
						<input
							type="radio"
							name="teachingMode"
							className="size-4 border-slate-300 text-primary focus:ring-primary"
							checked={teachingMode === ""}
							onChange={() => onTeachingModeChange("")}
						/>
						{tTutor("allTeachingModes")}
					</label>
					<label className="flex min-h-11 items-center gap-2 py-1">
						<input
							type="radio"
							name="teachingMode"
							className="size-4 border-slate-300 text-primary focus:ring-primary"
							checked={teachingMode === "ONLINE"}
							onChange={() => onTeachingModeChange("ONLINE")}
						/>
						{tTutor("online")}
					</label>
					<label className="flex min-h-11 items-center gap-2 py-1">
						<input
							type="radio"
							name="teachingMode"
							className="size-4 border-slate-300 text-primary focus:ring-primary"
							checked={teachingMode === "OFFLINE"}
							onChange={() => onTeachingModeChange("OFFLINE")}
						/>
						{tTutor("offline")}
					</label>
					<label className="flex min-h-11 items-center gap-2 py-1">
						<input
							type="radio"
							name="teachingMode"
							className="size-4 border-slate-300 text-primary focus:ring-primary"
							checked={teachingMode === "BOTH"}
							onChange={() => onTeachingModeChange("BOTH")}
						/>
						{tTutor("both")}
					</label>
				</div>
			</div>

			<label className="flex min-h-11 items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
				<span className="font-medium text-slate-700">{tTutor("verifiedOnly")}</span>
				<input
					type="checkbox"
					className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
					checked={verifiedOnly}
					onChange={(event) => onVerifiedOnlyChange(event.target.checked)}
				/>
			</label>
		</div>
	);
}

export function TutorsListingClient({
	initialSearchParams,
}: {
	initialSearchParams: Record<string, string | string[] | undefined>;
}) {
	const locale = useLocale();
	const tTutor = useTranslations("tutor");
	const router = useRouter();
	const pathname = usePathname();

	const [data, setData] = useState<ListingApiResponse>({
		items: [],
		pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [sheetOpen, setSheetOpen] = useState(false);

	const initialParams = useMemo(() => {
		const params = new URLSearchParams();
		Object.entries(initialSearchParams).forEach(([key, value]) => {
			if (typeof value === "string") {
				params.set(key, value);
			}
			if (Array.isArray(value)) {
				value.forEach((item) => {
					params.append(key, item);
				});
			}
		});
		return params;
	}, [initialSearchParams]);

	const [searchState, setSearchState] = useState(initialParams);
	const [keywordInput, setKeywordInput] = useState(
		searchState.get("keyword") ?? "",
	);

	const selectedCurricula = parseArrayParams(searchState, "curricula");
	const selectedSubjects = parseArrayParams(searchState, "subjects");
	const minPrice = searchState.get("minPrice") ?? "";
	const maxPrice = searchState.get("maxPrice") ?? "";
	const teachingMode =
		(searchState.get("teachingMode") as "" | TeachingMode | null) ?? "";
	const verifiedOnly = searchState.get("verifiedOnly") === "true";
	const sort = (searchState.get("sort") as SortOption | null) ?? "newest";
	const currentPage = Number(searchState.get("page") ?? "1");

	const replaceSearchState = useCallback(
		(next: URLSearchParams) => {
			setSearchState(next);
			const queryString = next.toString();
			router.replace(queryString ? `${pathname}?${queryString}` : pathname);
		},
		[pathname, router],
	);

	useEffect(() => {
		const onPopState = () => {
			setSearchState(new URLSearchParams(window.location.search));
		};

		window.addEventListener("popstate", onPopState);
		return () => window.removeEventListener("popstate", onPopState);
	}, []);

	const updateParam = useCallback(
		(key: string, value: string | null, resetPage = true) => {
			const next = new URLSearchParams(searchState.toString());
			if (!value) next.delete(key);
			else next.set(key, value);
			if (resetPage) next.delete("page");
			replaceSearchState(next);
		},
		[replaceSearchState, searchState],
	);

	const updateArrayParam = useCallback(
		(key: string, value: string, resetPage = true) => {
			const next = new URLSearchParams(searchState.toString());
			const current = parseArrayParams(next, key);
			const exists = current.includes(value);
			const updated = exists
				? current.filter((item) => item !== value)
				: [...current, value];

			next.delete(key);
			updated.forEach((item) => {
				next.append(key, item);
			});
			if (resetPage) next.delete("page");
			replaceSearchState(next);
		},
		[replaceSearchState, searchState],
	);

	const keywordFromUrl = searchState.get("keyword") ?? "";

	useEffect(() => {
		if (keywordFromUrl !== keywordInput) {
			setKeywordInput(keywordFromUrl);
		}
	}, [keywordFromUrl, keywordInput]);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			if (keywordInput !== keywordFromUrl) {
				updateParam("keyword", keywordInput.trim() || null);
			}
		}, 300);

		return () => window.clearTimeout(timer);
	}, [keywordFromUrl, keywordInput, updateParam]);

	useEffect(() => {
		let mounted = true;

		const fetchTutors = async () => {
			setLoading(true);
			setError("");
			const queryString = searchState.toString();
			const response = await fetch(
				`/api/tutors${queryString ? `?${queryString}` : ""}`,
				{ cache: "no-store" },
			);

			if (!response.ok) {
				if (mounted) {
					setError("request_failed");
					setData({
						items: [],
						pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
					});
					setLoading(false);
				}
				return;
			}

			const result = (await response.json()) as ListingApiResponse;

			if (mounted) {
				setData(result);
				setLoading(false);
			}
		};

		fetchTutors().catch(() => {
			if (mounted) {
				setError("request_failed");
				setData({
					items: [],
					pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
				});
				setLoading(false);
			}
		});

		return () => {
			mounted = false;
		};
	}, [searchState]);

	const pageNumbers = buildPageNumbers(
		data.pagination.page,
		data.pagination.totalPages,
	);

	const activeFilterTags = useMemo(() => {
		const tags: Array<{
			key: string;
			label: string;
			onRemove: () => void;
		}> = [];

		selectedCurricula.forEach((item) => {
			tags.push({
				key: `curricula-${item}`,
				label: getCurriculumLabel(item),
				onRemove: () => updateArrayParam("curricula", item),
			});
		});

		selectedSubjects.forEach((item) => {
			tags.push({
				key: `subjects-${item}`,
				label: getSubjectLabel(item, locale),
				onRemove: () => updateArrayParam("subjects", item),
			});
		});

		if (minPrice) {
			tags.push({
				key: "minPrice",
				label:
					locale === "ko"
						? `${formatPriceLabel(minPrice)} 이상`
						: `${formatPriceLabel(minPrice)}+`,
				onRemove: () => updateParam("minPrice", null),
			});
		}

		if (maxPrice) {
			tags.push({
				key: "maxPrice",
				label:
					locale === "ko"
						? `${formatPriceLabel(maxPrice)} 이하`
						: `up to ${formatPriceLabel(maxPrice)}`,
				onRemove: () => updateParam("maxPrice", null),
			});
		}

		if (teachingMode) {
			tags.push({
				key: "teachingMode",
				label:
					teachingMode === "ONLINE"
						? tTutor("online")
						: teachingMode === "OFFLINE"
							? tTutor("offline")
							: tTutor("both"),
				onRemove: () => updateParam("teachingMode", null),
			});
		}

		if (verifiedOnly) {
			tags.push({
				key: "verifiedOnly",
				label: tTutor("verifiedOnly"),
				onRemove: () => updateParam("verifiedOnly", null),
			});
		}

		return tags;
	}, [
		locale,
		maxPrice,
		minPrice,
		tTutor,
		teachingMode,
		selectedCurricula,
		selectedSubjects,
		updateArrayParam,
		updateParam,
		verifiedOnly,
	]);

	const activeFilterCount =
		selectedCurricula.length +
		selectedSubjects.length +
		(minPrice ? 1 : 0) +
		(maxPrice ? 1 : 0) +
		(teachingMode ? 1 : 0) +
		(verifiedOnly ? 1 : 0);

	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
			<div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
				<div className="relative">
					<Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-slate-400" />
					<Input
						value={keywordInput}
						onChange={(event) => setKeywordInput(event.target.value)}
						placeholder={tTutor("searchPlaceholder")}
						className="h-12 rounded-xl border-slate-200 pl-11 text-base"
					/>
				</div>
			</div>

			<div className="mb-4 flex flex-wrap items-center gap-2">
				<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
					<SheetTrigger
						render={
							<Button
								variant="outline"
								className="relative min-h-10 gap-1.5 rounded-full border-slate-200 px-4"
							/>
						}
					>
						<SlidersHorizontal className="size-4" />
						{tTutor("filter")}
						{activeFilterCount > 0 && (
							<span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
								{activeFilterCount}
							</span>
						)}
					</SheetTrigger>
					<SheetContent
						side="right"
						className="w-full max-w-sm overflow-y-auto"
					>
						<SheetHeader>
							<SheetTitle>{tTutor("filter")}</SheetTitle>
						</SheetHeader>
						<div className="px-4 pb-8">
							<FiltersPanel
								locale={locale}
								selectedCurricula={selectedCurricula}
								selectedSubjects={selectedSubjects}
								minPrice={minPrice}
								maxPrice={maxPrice}
								teachingMode={teachingMode}
								verifiedOnly={verifiedOnly}
								onToggleCurriculum={(value) =>
									updateArrayParam("curricula", value)
								}
								onToggleSubject={(value) =>
									updateArrayParam("subjects", value)
								}
								onPriceChange={(type, value) =>
									updateParam(type, value || null)
								}
								onTeachingModeChange={(value) =>
									updateParam("teachingMode", value || null)
								}
								onVerifiedOnlyChange={(value) =>
									updateParam("verifiedOnly", value ? "true" : null)
								}
								onClear={() => replaceSearchState(new URLSearchParams())}
							/>
						</div>
					</SheetContent>
				</Sheet>

				<label className="hidden min-h-10 cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 transition-colors hover:border-primary/40 md:inline-flex">
					<input
						type="checkbox"
						className="size-3.5 rounded border-slate-300 text-primary focus:ring-primary"
						checked={verifiedOnly}
						onChange={(event) =>
							updateParam("verifiedOnly", event.target.checked ? "true" : null)
						}
					/>
					{tTutor("verifiedOnly")}
				</label>

				<div className="ml-auto flex items-center gap-2">
					<p className="hidden text-sm text-body sm:block">
						{tTutor("tutorsCount", { count: data.pagination.total })}
					</p>
					<Select
						value={sort}
						onValueChange={(value) => updateParam("sort", value)}
					>
						<SelectTrigger className="h-10 w-[140px] rounded-full border-slate-200 bg-white text-sm">
							<SelectValue placeholder={tTutor("sortBy")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="newest">{tTutor("sortNewest")}</SelectItem>
							<SelectItem value="rating">{tTutor("sortRating")}</SelectItem>
							<SelectItem value="priceLow">{tTutor("sortPriceLow")}</SelectItem>
							<SelectItem value="priceHigh">{tTutor("sortPriceHigh")}</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{activeFilterTags.length > 0 && (
				<div className="mb-6 flex flex-wrap gap-2">
					{activeFilterTags.map((tag) => (
						<button
							key={tag.key}
							type="button"
							onClick={tag.onRemove}
							className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary-50 px-3 py-1 text-sm text-primary-800 transition-colors hover:bg-primary-100"
						>
							{tag.label}
							<X className="size-3.5" />
						</button>
					))}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => replaceSearchState(new URLSearchParams())}
						className="min-h-8 rounded-full text-body"
					>
						{tTutor("clearFilters")}
					</Button>
				</div>
			)}

			<p className="mb-4 text-sm text-body sm:hidden">
				{tTutor("tutorsCount", { count: data.pagination.total })}
			</p>

			{loading ? (
				<LoadingSkeleton variant="card-grid" count={4} />
			) : error ? (
				<ErrorFallback
					message={tTutor("noTutors")}
					onRetry={() => {
						const next = new URLSearchParams(searchState.toString());
						replaceSearchState(next);
					}}
				/>
			) : data.items.length === 0 ? (
				<EmptyState message={tTutor("noTutors")} />
			) : (
				<>
					<div className="space-y-4">
						{data.items.map((tutor) => (
							<TutorCard key={tutor.id} tutor={tutor} />
						))}
					</div>

					{data.pagination.totalPages > 1 ? (
						<div className="mt-10 flex items-center justify-center gap-2">
							<Button
								variant="outline"
								size="sm"
								className="min-h-10 rounded-full"
								disabled={currentPage <= 1}
								onClick={() =>
									updateParam(
										"page",
										String(Math.max(1, currentPage - 1)),
										false,
									)
								}
							>
								<ChevronLeft className="size-4" />
							</Button>
							{pageNumbers.map((pageNumber) => (
								<Button
									key={pageNumber}
									variant={
										pageNumber === currentPage ? "default" : "outline"
									}
									size="sm"
									className="min-h-10 min-w-10 rounded-full"
									onClick={() =>
										updateParam("page", String(pageNumber), false)
									}
								>
									{pageNumber}
								</Button>
							))}
							<Button
								variant="outline"
								size="sm"
								className="min-h-10 rounded-full"
								disabled={currentPage >= data.pagination.totalPages}
								onClick={() =>
									updateParam(
										"page",
										String(
											Math.min(data.pagination.totalPages, currentPage + 1),
										),
										false,
									)
								}
							>
								<ChevronRight className="size-4" />
							</Button>
						</div>
					) : null}
				</>
			)}
		</div>
	);
}
