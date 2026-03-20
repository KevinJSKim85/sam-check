import { PaymentProvider } from '@prisma/client'

export const PLATFORM_FEE_BPS = 500
export const PAYOUT_HOLD_DAYS = 7

export function calculatePlatformFee(grossAmountKrw: number, feeBps = PLATFORM_FEE_BPS) {
  return Math.floor((grossAmountKrw * feeBps) / 10000)
}

export function calculateLessonAmounts(hourlyRateKrw: number, durationMinutes: number) {
  const grossAmountKrw = Math.floor((hourlyRateKrw * durationMinutes) / 60)
  const platformFeeAmountKrw = calculatePlatformFee(grossAmountKrw)
  const tutorNetAmountKrw = grossAmountKrw - platformFeeAmountKrw

  return {
    grossAmountKrw,
    platformFeeBps: PLATFORM_FEE_BPS,
    platformFeeAmountKrw,
    tutorNetAmountKrw,
  }
}

export function createMerchantOrderNo(bookingId: string) {
  const randomSuffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `SAM-${bookingId.slice(-8).toUpperCase()}-${randomSuffix}`
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://sam-check.vercel.app'
}

export function getTossClientKey() {
  return process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || ''
}

export function getTossSecretKey() {
  return process.env.TOSS_SECRET_KEY || ''
}

export function getDefaultPaymentProvider() {
  return PaymentProvider.TOSS_PAYMENTS
}

export function addHoldDays(date: Date, days = PAYOUT_HOLD_DAYS) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}
