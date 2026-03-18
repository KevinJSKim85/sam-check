"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import {
	registerWithEmailAction,
	socialSignInAction,
} from "@/app/[locale]/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";

type Role = "STUDENT" | "TUTOR";

export function SignupPageClient() {
	const t = useTranslations("auth");
	const locale = useLocale();
	const [registerState, registerAction, registerPending] = useActionState(
		registerWithEmailAction,
		{},
	);

	const [role, setRole] = useState<Role>("STUDENT");
	const [privacyConsent, setPrivacyConsent] = useState(false);
	const [credentialConsent, setCredentialConsent] = useState(false);
	const [marketingConsent, setMarketingConsent] = useState(false);

	const requiredChecked =
		role === "TUTOR" ? privacyConsent && credentialConsent : privacyConsent;

	return (
		<div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-2xl items-center px-4 py-12 sm:px-6">
			<Card className="w-full border-primary/15 shadow-md">
				<CardHeader className="space-y-2">
					<CardTitle className="text-2xl">{t("signupTitle")}</CardTitle>
					<p className="text-sm text-body">{t("signupDescription")}</p>
				</CardHeader>
				<CardContent className="space-y-8">
					<section className="space-y-3">
						<h2 className="text-base font-semibold text-slate-900">
							{t("roleStepTitle")}
						</h2>
						<div className="grid gap-3 sm:grid-cols-2">
							<button
								type="button"
								onClick={() => setRole("STUDENT")}
								className={`rounded-xl border p-4 text-left transition ${
									role === "STUDENT"
										? "border-primary bg-primary-50 ring-2 ring-primary/20"
										: "border-slate-200 hover:border-primary/40"
								}`}
							>
								<p className="text-sm font-semibold text-primary">
									{t("student")}
								</p>
								<p className="mt-1 text-sm text-body">{t("studentDesc")}</p>
							</button>
							<button
								type="button"
								onClick={() => setRole("TUTOR")}
								className={`rounded-xl border p-4 text-left transition ${
									role === "TUTOR"
										? "border-primary bg-primary-50 ring-2 ring-primary/20"
										: "border-slate-200 hover:border-primary/40"
								}`}
							>
								<p className="text-sm font-semibold text-primary">
									{t("tutor")}
								</p>
								<p className="mt-1 text-sm text-body">{t("tutorDesc")}</p>
							</button>
						</div>
					</section>

					<Separator />

					<section className="space-y-4">
						<h2 className="text-base font-semibold text-slate-900">
							{t("consentStepTitle")}
						</h2>

						<label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
							<input
								type="checkbox"
								checked={privacyConsent}
								onChange={(event) => setPrivacyConsent(event.target.checked)}
								className="mt-1 size-4 rounded border-slate-300 text-primary"
							/>
							<span className="space-y-1 text-sm">
								<span className="font-medium text-slate-900">
									[{t("required")}] {t("privacyConsent")}
								</span>
								<span className="block text-body">{t("privacyDetail")}</span>
								<Link
									href="/privacy"
									className="inline-block text-primary hover:underline"
								>
									{t("viewPrivacy")}
								</Link>
							</span>
						</label>

						{role === "TUTOR" ? (
							<label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
								<input
									type="checkbox"
									checked={credentialConsent}
									onChange={(event) =>
										setCredentialConsent(event.target.checked)
									}
									className="mt-1 size-4 rounded border-slate-300 text-primary"
								/>
								<span className="space-y-1 text-sm">
									<span className="font-medium text-slate-900">
										[{t("required")}] {t("credentialConsent")}
									</span>
									<span className="block text-body">
										{t("credentialDetail")}
									</span>
								</span>
							</label>
						) : null}

						<label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
							<input
								type="checkbox"
								checked={marketingConsent}
								onChange={(event) => setMarketingConsent(event.target.checked)}
								className="mt-1 size-4 rounded border-slate-300 text-primary"
							/>
							<span className="space-y-1 text-sm">
								<span className="font-medium text-slate-900">
									[{t("optional")}] {t("marketingConsent")}
								</span>
								<span className="block text-body">{t("marketingDetail")}</span>
							</span>
						</label>

						{!requiredChecked ? (
							<p className="text-sm text-red-600">
								{t("requiredConsentMissing")}
							</p>
						) : null}
					</section>

					<Separator />

					<section className="space-y-3">
						<h2 className="text-base font-semibold text-slate-900">
							{t("socialStepTitle")}
						</h2>
						<p className="text-sm text-body">{t("continueWithSocial")}</p>

						<form action={socialSignInAction} className="w-full">
							<input type="hidden" name="provider" value="kakao" />
							<input type="hidden" name="redirectTo" value={`/${locale}`} />
							<input type="hidden" name="role" value={role} />
							<input
								type="hidden"
								name="privacyConsent"
								value={String(privacyConsent)}
							/>
							<input
								type="hidden"
								name="credentialConsent"
								value={String(credentialConsent)}
							/>
							<input
								type="hidden"
								name="marketingConsent"
								value={String(marketingConsent)}
							/>
							<Button
								type="submit"
								variant="socialKakao"
								size="lg"
								className="w-full justify-center gap-2"
								disabled={!requiredChecked}
							>
								<svg
									viewBox="0 0 24 24"
									className="size-5"
									fill="currentColor"
									aria-hidden="true"
								>
									<path d="M12 3C6.48 3 2 6.34 2 10.5c0 2.73 1.82 5.12 4.55 6.47-.2.73-.72 2.64-.82 3.06-.13.52.19.51.4.37.17-.11 2.62-1.78 3.69-2.5.7.1 1.43.1 2.18.1 5.52 0 10-3.34 10-7.5S17.52 3 12 3z" />
								</svg>
								{t("signupWith", { provider: "Kakao" })}
							</Button>
						</form>

						<form action={socialSignInAction} className="w-full">
							<input type="hidden" name="provider" value="google" />
							<input type="hidden" name="redirectTo" value={`/${locale}`} />
							<input type="hidden" name="role" value={role} />
							<input
								type="hidden"
								name="privacyConsent"
								value={String(privacyConsent)}
							/>
							<input
								type="hidden"
								name="credentialConsent"
								value={String(credentialConsent)}
							/>
							<input
								type="hidden"
								name="marketingConsent"
								value={String(marketingConsent)}
							/>
							<Button
								type="submit"
								variant="socialGoogle"
								size="lg"
								className="w-full justify-center gap-2"
								disabled={!requiredChecked}
							>
								<svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
									<path
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
										fill="#4285F4"
									/>
									<path
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										fill="#34A853"
									/>
									<path
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
										fill="#FBBC05"
									/>
									<path
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										fill="#EA4335"
									/>
								</svg>
								{t("signupWith", { provider: "Google" })}
							</Button>
						</form>

						<div className="flex items-center gap-3 py-1">
							<Separator className="flex-1" />
							<span className="text-xs font-medium uppercase tracking-[0.08em] text-body">
								{t("or")}
							</span>
							<Separator className="flex-1" />
						</div>

						<form action={registerAction} className="space-y-3">
							<input type="hidden" name="locale" value={locale} />
							<input type="hidden" name="role" value={role} />
							<div className="space-y-2">
								<label
									htmlFor="name"
									className="text-sm font-medium text-slate-900"
								>
									{t("nameLabelOptional")}
								</label>
								<Input id="name" name="name" autoComplete="name" />
							</div>
							<div className="space-y-2">
								<label
									htmlFor="signup-email"
									className="text-sm font-medium text-slate-900"
								>
									{t("emailLabel")}
								</label>
								<Input
									id="signup-email"
									name="email"
									type="email"
									autoComplete="email"
									required
								/>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="signup-password"
									className="text-sm font-medium text-slate-900"
								>
									{t("passwordLabel")}
								</label>
								<Input
									id="signup-password"
									name="password"
									type="password"
									autoComplete="new-password"
									required
								/>
								<p className="text-xs text-body">{t("passwordHint")}</p>
							</div>
							{registerState.error ? (
								<p className="text-sm text-red-600">{t(registerState.error)}</p>
							) : null}
							<Button
								type="submit"
								size="lg"
								className="w-full"
								disabled={!requiredChecked || registerPending}
							>
								{registerPending ? t("creatingAccount") : t("signupWithEmail")}
							</Button>
						</form>
					</section>

					<p className="text-center text-sm text-body">
						{t("hasAccount")}{" "}
						<Link
							href="/auth/login"
							className="font-semibold text-primary hover:underline"
						>
							{t("loginTitle")}
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
