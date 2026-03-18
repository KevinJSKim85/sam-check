"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState } from "react";
import {
	credentialSignInAction,
	socialSignInAction,
} from "@/app/[locale]/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";

export function LoginPageClient() {
	const t = useTranslations("auth");
	const locale = useLocale();
	const [state, credentialAction, isPending] = useActionState(
		credentialSignInAction,
		{},
	);

	return (
		<div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center px-4 py-12 sm:px-6">
			<Card className="w-full border-primary/15 shadow-md">
				<CardHeader className="space-y-2 text-center">
					<CardTitle className="text-2xl">{t("loginTitle")}</CardTitle>
					<p className="text-sm text-body">{t("loginDescription")}</p>
				</CardHeader>
				<CardContent className="space-y-3">
					<form action={socialSignInAction} className="w-full">
						<input type="hidden" name="provider" value="kakao" />
						<input type="hidden" name="redirectTo" value={`/${locale}`} />
						<Button
							type="submit"
							variant="socialKakao"
							className="w-full justify-center gap-2"
							size="lg"
						>
							<svg
								viewBox="0 0 24 24"
								className="size-5"
								fill="currentColor"
								aria-hidden="true"
							>
								<path d="M12 3C6.48 3 2 6.34 2 10.5c0 2.73 1.82 5.12 4.55 6.47-.2.73-.72 2.64-.82 3.06-.13.52.19.51.4.37.17-.11 2.62-1.78 3.69-2.5.7.1 1.43.1 2.18.1 5.52 0 10-3.34 10-7.5S17.52 3 12 3z" />
							</svg>
							{t("loginWith", { provider: "Kakao" })}
						</Button>
					</form>

					<form action={socialSignInAction} className="w-full">
						<input type="hidden" name="provider" value="google" />
						<input type="hidden" name="redirectTo" value={`/${locale}`} />
						<Button
							type="submit"
							variant="socialGoogle"
							className="w-full justify-center gap-2"
							size="lg"
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
							{t("loginWith", { provider: "Google" })}
						</Button>
					</form>

					<div className="flex items-center gap-3 py-1">
						<Separator className="flex-1" />
						<span className="text-xs font-medium uppercase tracking-[0.08em] text-body">
							{t("or")}
						</span>
						<Separator className="flex-1" />
					</div>

					<form action={credentialAction} className="space-y-3">
						<input type="hidden" name="locale" value={locale} />
						<div className="space-y-2">
							<label
								htmlFor="email"
								className="text-sm font-medium text-slate-900"
							>
								{t("emailLabel")}
							</label>
							<Input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
							/>
						</div>
						<div className="space-y-2">
							<label
								htmlFor="password"
								className="text-sm font-medium text-slate-900"
							>
								{t("passwordLabel")}
							</label>
							<Input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
							/>
						</div>
						{state.error ? (
							<p className="text-sm text-red-600">{t(state.error)}</p>
						) : null}
						<Button
							type="submit"
							className="w-full"
							size="lg"
							disabled={isPending}
						>
							{isPending ? t("loggingIn") : t("loginWithEmail")}
						</Button>
					</form>

					<p className="pt-3 text-center text-sm text-body">
						{t("noAccount")}{" "}
						<Link
							href="/auth/signup"
							className="font-semibold text-primary hover:underline"
						>
							{t("signupTitle")}
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
