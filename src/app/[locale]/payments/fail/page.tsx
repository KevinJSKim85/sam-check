import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'

export default function PaymentFailPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <h1 className="text-3xl font-bold text-rose-900">결제가 완료되지 않았습니다</h1>
        <p className="mt-2 text-sm text-rose-800">카드사 인증 취소, 한도 초과, 또는 결제창 종료로 인해 결제가 중단되었습니다.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="cta" render={<Link href="/tutors" />}>
          다시 수업 찾기
        </Button>
        <Button variant="outline" render={<Link href="/messages" />}>
          메시지로 돌아가기
        </Button>
      </div>
    </div>
  )
}
