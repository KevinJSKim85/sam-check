'use server';

import { signIn } from '@/auth';

const allowedProviders = ['naver', 'kakao', 'google'] as const;
type Provider = (typeof allowedProviders)[number];

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
