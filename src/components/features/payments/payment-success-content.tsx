'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'

type ConfirmState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; tutorUserId: string }

export function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [state, setState] = useState<ConfirmState>({ status: 'loading' })

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = Number(searchParams.get('amount') || 0)

    if (!paymentKey || !orderId || !amount) {
      setState({ status: 'error', message: '결제 확인에 필요한 값이 누락되었습니다.' })
      return
    }

    async function confirmPayment() {
      try {
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        })

        const data = (await response.json()) as { error?: string; tutorUserId?: string }

        if (!response.ok || !data.tutorUserId) {
          throw new Error(data.error || '결제 승인에 실패했습니다.')
        }

        setState({ status: 'success', tutorUserId: data.tutorUserId })
      } catch (error) {
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : '결제 승인에 실패했습니다.',
        })
      }
    }

    void confirmPayment()
  }, [searchParams])

  if (state.status === 'loading') {
    return <p className="text-sm text-slate-600">결제를 확인하는 중입니다...</p>
  }

  if (state.status === 'error') {
    return <p className="text-sm text-rose-600">{state.message}</p>
  }

  return (
    <div className="space-y-4">
      <p className="text-base text-slate-700">결제가 완료되었습니다. 이제 메시지에서 수업 일정을 이어가세요.</p>
      <div className="flex flex-wrap gap-3">
        <Button variant="cta" render={<Link href={`/messages/${state.tutorUserId}`} />}>
          대화방으로 이동
        </Button>
        <Button variant="outline" render={<Link href="/tutors" />}>
          다른 튜터 보기
        </Button>
      </div>
    </div>
  )
}
