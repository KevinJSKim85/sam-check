'use server';

import { randomBytes } from 'node:crypto';
import { hash } from 'bcryptjs';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { prisma } from '@/lib/db';

const allowedProviders = ['kakao', 'google'] as const;
type Provider = (typeof allowedProviders)[number];

type EmailAuthState = {
  error?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getLocaleValue(formData: FormData) {
  const locale = getStringValue(formData, 'locale');
  return locale === 'en' || locale === 'ko' ? locale : 'ko';
}

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.AUTH_URL) {
    return process.env.AUTH_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

async function createEmailVerificationToken(email: string, locale: string) {
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  const verifyUrl = `${getBaseUrl()}/${locale}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  console.log(`[auth] Verification email URL for ${email}: ${verifyUrl}`);
}

function isProvider(value: string): value is Provider {
  return allowedProviders.includes(value as Provider);
}

export async function socialSignInAction(formData: FormData) {
  const providerValue = formData.get('provider');
  const redirectToValue = formData.get('redirectTo');

  if (typeof providerValue !== 'string' || !isProvider(providerValue)) {
    throw new Error('Invalid provider');
  }

  const redirectTo =
    typeof redirectToValue === 'string' && redirectToValue.startsWith('/')
      ? redirectToValue
      : '/';

  await signIn(providerValue, { redirectTo });
}

export async function registerWithEmailAction(
  _prevState: EmailAuthState,
  formData: FormData,
): Promise<EmailAuthState> {
  const locale = getLocaleValue(formData);
  const redirectTo = `/${locale}`;
  const email = getStringValue(formData, 'email').toLowerCase();
  const password = getStringValue(formData, 'password');
  const name = getStringValue(formData, 'name');
  const roleValue = getStringValue(formData, 'role');
  const role = roleValue === 'TUTOR' ? 'TUTOR' : 'STUDENT';

  if (!email || !EMAIL_REGEX.test(email)) {
    return { error: 'invalidEmail' };
  }

  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return { error: 'passwordTooShort' };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: 'emailAlreadyInUse' };
  }

  const hashedPassword = await hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
      role,
      locale,
    },
  });

  await createEmailVerificationToken(email, locale);

  redirect(`/${locale}/auth/verify-email?status=sent&email=${encodeURIComponent(email)}&redirectTo=${encodeURIComponent(redirectTo)}`);
}

export async function credentialSignInAction(
  _prevState: EmailAuthState,
  formData: FormData,
): Promise<EmailAuthState> {
  const locale = getLocaleValue(formData);
  const email = getStringValue(formData, 'email').toLowerCase();
  const password = getStringValue(formData, 'password');

  if (!email || !password) {
    return { error: 'invalidCredentials' };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: `/${locale}`,
    });

    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'invalidCredentials' };
    }

    throw error;
  }
}
