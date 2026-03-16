import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

function getCompleteness(profile: {
  headline: string | null
  bio: string | null
  subjects: string[]
  curricula: string[]
  hourlyRate: number | null
  university: string | null
  degree: string | null
}) {
  const checks = [
    Boolean(profile.headline),
    Boolean(profile.bio),
    profile.subjects.length > 0,
    profile.curricula.length > 0,
    Boolean(profile.hourlyRate),
    Boolean(profile.university),
    Boolean(profile.degree),
  ]

  const completed = checks.filter(Boolean).length
  return Math.round((completed / checks.length) * 100)
}

export default async function DashboardPage() {
  const session = await requireAuth()

  const [profile, unreadMessages, recentReviews] = await Promise.all([
    prisma.tutorProfile.findUnique({
      where: { userId: session.user.id },
      include: { credentials: true },
    }),
    prisma.message.count({
      where: {
        receiverId: session.user.id,
        isRead: false,
      },
    }),
    prisma.review.findMany({
      where: {
        tutorProfile: { userId: session.user.id },
      },
      include: {
        author: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const approvedCount = profile?.credentials.filter((item) => item.status === 'APPROVED').length ?? 0
  const pendingCount = profile?.credentials.filter((item) => item.status === 'PENDING' || item.status === 'UNDER_REVIEW').length ?? 0
  const rejectedCount = profile?.credentials.filter((item) => item.status === 'REJECTED').length ?? 0
  const profileCompleteness = profile ? getCompleteness(profile) : 0

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-50 via-white to-accent-50 p-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">튜터 대시보드</h1>
        <p className="mt-2 text-sm text-body">프로필 완성도와 인증 상태를 관리하고 최근 활동을 확인하세요.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button render={<Link href="/dashboard/profile" />} variant="cta">프로필 수정</Button>
          <Button render={<Link href="/dashboard/credentials" />} variant="outline">인증 관리</Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>프로필 완성도</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{profileCompleteness}%</p>
            <p className="mt-2 text-sm text-body">핵심 정보 7개 기준으로 계산됩니다.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>인증 현황</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-body">총 {profile?.credentials.length ?? 0}건 제출</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge className="bg-emerald-100 text-emerald-800">인증 {approvedCount}</Badge>
              <Badge className="bg-amber-100 text-amber-800">검토 {pendingCount}</Badge>
              <Badge className="bg-rose-100 text-rose-800">반려 {rejectedCount}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>읽지 않은 쪽지</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{unreadMessages}</p>
            <p className="mt-2 text-sm text-body">학생 문의를 확인해보세요.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 리뷰</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{recentReviews.length}</p>
            <p className="mt-2 text-sm text-body">최근 작성된 리뷰 5건 기준</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>빠른 이동</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">프로필 정보 수정</p>
              <p className="mt-1 text-body">학력, 과목, 시급, 공개 여부를 업데이트합니다.</p>
              <Link className="mt-2 inline-block text-primary hover:underline" href="/dashboard/profile">/dashboard/profile</Link>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">인증 서류 제출/관리</p>
              <p className="mt-1 text-body">인증 상태 확인, 반려 건 재제출, 삭제를 진행합니다.</p>
              <Link className="mt-2 inline-block text-primary hover:underline" href="/dashboard/credentials">/dashboard/credentials</Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 리뷰 목록</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentReviews.length === 0 ? (
              <p className="text-sm text-body">아직 리뷰가 없습니다.</p>
            ) : (
              recentReviews.map((review) => (
                <div key={review.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-medium text-slate-900">{review.author.name ?? '익명 학생'} · {review.rating}/5</p>
                  <p className="mt-1 line-clamp-2 text-sm text-body">{review.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
