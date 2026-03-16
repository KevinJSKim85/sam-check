import { UserRole, VerificationStatus } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { prisma } from '@/lib/db'

export default async function AdminPage() {
  const [pendingCredentials, totalTutors, totalStudents, totalMessages] = await Promise.all([
    prisma.credential.count({
      where: {
        status: {
          in: [VerificationStatus.PENDING, VerificationStatus.UNDER_REVIEW],
        },
      },
    }),
    prisma.user.count({
      where: {
        role: UserRole.TUTOR,
      },
    }),
    prisma.user.count({
      where: {
        role: UserRole.STUDENT,
      },
    }),
    prisma.message.count(),
  ])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-50 via-white to-accent-50 p-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">관리자 대시보드</h1>
        <p className="mt-2 text-sm text-body">인증 심사 현황과 플랫폼 메시지 현황을 한눈에 관리합니다.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>대기 인증</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{pendingCredentials}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>전체 튜터</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{totalTutors}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>전체 학생</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{totalStudents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>전체 메시지</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{totalMessages}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>자격 인증 심사 큐</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-body">PENDING/UNDER_REVIEW 상태 인증을 검토하고 승인 또는 반려합니다.</p>
            <Link className="inline-block text-sm font-semibold text-primary hover:underline" href="/admin/credentials">
              /admin/credentials 이동
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>대화 모니터링</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-body">플랫폼 전체 대화를 읽기 전용으로 조회하고 이슈를 점검합니다.</p>
            <Link className="inline-block text-sm font-semibold text-primary hover:underline" href="/admin/messages">
              /admin/messages 이동
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
