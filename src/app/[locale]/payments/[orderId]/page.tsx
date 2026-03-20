import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { PaymentCheckoutCard } from '@/components/features/payments/payment-checkout-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getBaseUrl, getTossClientKey } from '@/lib/payments'
import { prisma } from '@/lib/db'

export default async function PaymentCheckoutPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>
}) {
  const { locale, orderId } = await params
  const session = await auth()

  if (!session?.user) {
    notFound()
  }

  const payment = await prisma.payment.findUnique({
    where: { merchantOrderNo: orderId },
    include: {
      order: {
        include: {
          booking: true,
          sellerTutor: { select: { id: true, name: true, email: true } },
        },
      },
    },
  })

  if (!payment || (payment.order.buyerId !== session.user.id && session.user.role !== 'ADMIN')) {
    notFound()
  }

  const baseUrl = getBaseUrl()
  const successUrl = `${baseUrl}/${locale}/payments/success`
  const failUrl = `${baseUrl}/${locale}/payments/fail`

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>수업 결제 안내</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>튜터가 수업 요청을 승인했습니다. 결제를 완료하면 수업이 최종 확정됩니다.</p>
          <p>총 결제금액에서 플랫폼 수수료 5%를 제외한 금액이 튜터 정산 예정 금액으로 적립됩니다.</p>
        </CardContent>
      </Card>

      <PaymentCheckoutCard
        orderId={payment.merchantOrderNo}
        amountKrw={payment.requestedAmountKrw}
        orderName={`${payment.order.booking.subject} ${payment.order.booking.durationMinutes}분 수업`}
        customerName={session.user.name || 'Sam-Check Student'}
        customerEmail={session.user.email || ''}
        successUrl={successUrl}
        failUrl={failUrl}
        tossClientKey={getTossClientKey()}
      />

      <Card>
        <CardHeader>
          <CardTitle>정산 구조</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-slate-500">총 결제금액</p>
            <p className="font-semibold text-slate-900">{payment.order.grossAmountKrw.toLocaleString('ko-KR')}원</p>
          </div>
          <div>
            <p className="text-slate-500">플랫폼 수수료</p>
            <p className="font-semibold text-slate-900">{payment.order.platformFeeAmountKrw.toLocaleString('ko-KR')}원</p>
          </div>
          <div>
            <p className="text-slate-500">튜터 정산 예정</p>
            <p className="font-semibold text-slate-900">{payment.order.tutorNetAmountKrw.toLocaleString('ko-KR')}원</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
