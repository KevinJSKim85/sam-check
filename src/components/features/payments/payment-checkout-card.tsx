'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestPayment: (
        method: string,
        options: Record<string, unknown>
      ) => Promise<void>
    }
  }
}

type PaymentCheckoutCardProps = {
  orderId: string
  amountKrw: number
  orderName: string
  customerName: string
  customerEmail: string
  successUrl: string
  failUrl: string
  tossClientKey: string
}

export function PaymentCheckoutCard({
  orderId,
  amountKrw,
  orderName,
  customerName,
  customerEmail,
  successUrl,
  failUrl,
  tossClientKey,
}: PaymentCheckoutCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sdkReady, setSdkReady] = useState(false)

  useEffect(() => {
    if (!tossClientKey) {
      return
    }

    if (window.TossPayments) {
      setSdkReady(true)
      return
    }

    const existing = document.querySelector('script[data-toss-payments]')
    if (existing) {
      existing.addEventListener('load', () => setSdkReady(true), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://js.tosspayments.com/v1/payment'
    script.async = true
    script.dataset.tossPayments = 'true'
    script.addEventListener('load', () => setSdkReady(true), { once: true })
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [tossClientKey])

  async function handleCheckout() {
    if (!window.TossPayments || !tossClientKey) {
      setError('Toss Payments client key is missing. Set NEXT_PUBLIC_TOSS_CLIENT_KEY first.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const toss = window.TossPayments(tossClientKey)
      await toss.requestPayment('카드', {
        amount: amountKrw,
        orderId,
        orderName,
        customerName,
        customerEmail,
        successUrl,
        failUrl,
      })
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Failed to start payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">수업 결제</h2>
        <p className="mt-2 text-sm text-slate-600">국내 카드 결제로 바로 결제하고, 플랫폼이 5% 수수료를 정산합니다.</p>
      </div>

      <div className="rounded-xl bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-slate-600">결제 주문번호</span>
          <span className="font-mono text-sm text-slate-900">{orderId}</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="text-sm text-slate-600">결제 금액</span>
          <span className="text-xl font-bold text-slate-900">{amountKrw.toLocaleString('ko-KR')}원</span>
        </div>
      </div>

      <Button variant="cta" size="lg" className="w-full min-h-12 text-base" disabled={loading || !sdkReady} onClick={() => void handleCheckout()}>
        {loading ? '결제 창 여는 중...' : '토스페이먼츠로 결제하기'}
      </Button>

      {!tossClientKey ? <p className="text-sm text-amber-700">`NEXT_PUBLIC_TOSS_CLIENT_KEY` 설정이 필요합니다.</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  )
}
