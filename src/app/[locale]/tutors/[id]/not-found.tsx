import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'

export default function TutorNotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center sm:px-6 lg:px-8">
      <p className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">404</p>
      <h1 className="text-3xl font-bold text-slate-900">튜터를 찾을 수 없습니다</h1>
      <p className="text-body">요청하신 튜터 프로필이 없거나 비공개 상태입니다.</p>
      <Button variant="cta" render={<Link href="/tutors" />}>
        튜터 목록으로 돌아가기
      </Button>
    </div>
  )
}
