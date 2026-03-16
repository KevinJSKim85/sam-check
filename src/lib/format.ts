export function formatKrw(amount: number, locale: string) {
  return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDateTime(value: Date | string, locale: string) {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
