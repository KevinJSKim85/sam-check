'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { socialSignInAction } from '@/app/[locale]/auth/actions';

type Role = 'STUDENT' | 'TUTOR';

export default function SignupPage() {
  const t = useTranslations('auth');
  const locale = useLocale();

  const [role, setRole] = useState<Role>('STUDENT');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [credentialConsent, setCredentialConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const requiredChecked = role === 'TUTOR' ? privacyConsent && credentialConsent : privacyConsent;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-2xl items-center px-4 py-12 sm:px-6">
      <Card className="w-full border-primary/15 shadow-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">{t('signupTitle')}</CardTitle>
          <p className="text-sm text-body">{t('signupDescription')}</p>
        </CardHeader>
        <CardContent className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">{t('roleStepTitle')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`rounded-xl border p-4 text-left transition ${
                  role === 'STUDENT'
                    ? 'border-primary bg-primary-50 ring-2 ring-primary/20'
                    : 'border-slate-200 hover:border-primary/40'
                }`}
              >
                <p className="text-sm font-semibold text-primary">{t('student')}</p>
                <p className="mt-1 text-sm text-body">{t('studentDesc')}</p>
              </button>
              <button
                type="button"
                onClick={() => setRole('TUTOR')}
                className={`rounded-xl border p-4 text-left transition ${
                  role === 'TUTOR'
                    ? 'border-primary bg-primary-50 ring-2 ring-primary/20'
                    : 'border-slate-200 hover:border-primary/40'
                }`}
              >
                <p className="text-sm font-semibold text-primary">{t('tutor')}</p>
                <p className="mt-1 text-sm text-body">{t('tutorDesc')}</p>
              </button>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">{t('consentStepTitle')}</h2>

            <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(event) => setPrivacyConsent(event.target.checked)}
                className="mt-1 size-4 rounded border-slate-300 text-primary"
              />
              <span className="space-y-1 text-sm">
                <span className="font-medium text-slate-900">[{t('required')}] {t('privacyConsent')}</span>
                <span className="block text-body">{t('privacyDetail')}</span>
                <Link href="/privacy" className="inline-block text-primary hover:underline">
                  {t('viewPrivacy')}
                </Link>
              </span>
            </label>

            {role === 'TUTOR' ? (
              <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                <input
                  type="checkbox"
                  checked={credentialConsent}
                  onChange={(event) => setCredentialConsent(event.target.checked)}
                  className="mt-1 size-4 rounded border-slate-300 text-primary"
                />
                <span className="space-y-1 text-sm">
                  <span className="font-medium text-slate-900">[{t('required')}] {t('credentialConsent')}</span>
                  <span className="block text-body">{t('credentialDetail')}</span>
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
                <span className="font-medium text-slate-900">[{t('optional')}] {t('marketingConsent')}</span>
                <span className="block text-body">{t('marketingDetail')}</span>
              </span>
            </label>

            {!requiredChecked ? <p className="text-sm text-red-600">{t('requiredConsentMissing')}</p> : null}
          </section>

          <Separator />

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">{t('socialStepTitle')}</h2>
            <p className="text-sm text-body">{t('continueWithSocial')}</p>

            <form action={socialSignInAction} className="w-full">
              <input type="hidden" name="provider" value="naver" />
              <input type="hidden" name="redirectTo" value={`/${locale}`} />
              <input type="hidden" name="role" value={role} />
              <input type="hidden" name="privacyConsent" value={String(privacyConsent)} />
              <input type="hidden" name="credentialConsent" value={String(credentialConsent)} />
              <input type="hidden" name="marketingConsent" value={String(marketingConsent)} />
              <Button
                type="submit"
                variant="socialNaver"
                size="lg"
                className="w-full justify-center"
                disabled={!requiredChecked}
              >
                {t('signupWith', { provider: 'Naver' })}
              </Button>
            </form>

            <form action={socialSignInAction} className="w-full">
              <input type="hidden" name="provider" value="kakao" />
              <input type="hidden" name="redirectTo" value={`/${locale}`} />
              <input type="hidden" name="role" value={role} />
              <input type="hidden" name="privacyConsent" value={String(privacyConsent)} />
              <input type="hidden" name="credentialConsent" value={String(credentialConsent)} />
              <input type="hidden" name="marketingConsent" value={String(marketingConsent)} />
              <Button
                type="submit"
                variant="socialKakao"
                size="lg"
                className="w-full justify-center"
                disabled={!requiredChecked}
              >
                {t('signupWith', { provider: 'Kakao' })}
              </Button>
            </form>

            <form action={socialSignInAction} className="w-full">
              <input type="hidden" name="provider" value="google" />
              <input type="hidden" name="redirectTo" value={`/${locale}`} />
              <input type="hidden" name="role" value={role} />
              <input type="hidden" name="privacyConsent" value={String(privacyConsent)} />
              <input type="hidden" name="credentialConsent" value={String(credentialConsent)} />
              <input type="hidden" name="marketingConsent" value={String(marketingConsent)} />
              <Button
                type="submit"
                variant="socialGoogle"
                size="lg"
                className="w-full justify-center"
                disabled={!requiredChecked}
              >
                {t('signupWith', { provider: 'Google' })}
              </Button>
            </form>
          </section>

          <p className="text-center text-sm text-body">
            {t('hasAccount')}{' '}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">
              {t('loginTitle')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
