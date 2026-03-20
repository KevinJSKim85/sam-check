import { Suspense } from 'react'
import { PaymentSuccessContent } from '@/components/features/payments/payment-success-content'

export default function PaymentSuccessPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <h1 className="text-3xl font-bold text-emerald-900">결제 완료</h1>
        <p className="mt-2 text-sm text-emerald-800">결제 승인을 마무리하고 수업 상태를 확정하고 있습니다.</p>
      </div>

      <Suspense fallback={<p className="text-sm text-slate-600">결제 정보를 확인하는 중입니다...</p>}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  )
}
