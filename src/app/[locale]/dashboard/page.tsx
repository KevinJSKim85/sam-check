import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getTranslations } from 'next-intl/server'
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
  const tDashboard = await getTranslations('dashboard')

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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{tDashboard('title')}</h1>
        <p className="mt-2 text-sm text-body">{tDashboard('subtitle')}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button render={<Link href="/dashboard/profile" />} variant="cta">{tDashboard('editProfile')}</Button>
          <Button render={<Link href="/dashboard/credentials" />} variant="outline">{tDashboard('manageCredentials')}</Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>{tDashboard('profileCompleteness')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{profileCompleteness}%</p>
            <p className="mt-2 text-sm text-body">{tDashboard('profileCompletenessHint')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tDashboard('credentialOverview')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-body">{tDashboard('submittedCount', { count: profile?.credentials.length ?? 0 })}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge className="bg-emerald-100 text-emerald-800">{tDashboard('approved')} {approvedCount}</Badge>
              <Badge className="bg-amber-100 text-amber-800">{tDashboard('pending')} {pendingCount}</Badge>
              <Badge className="bg-rose-100 text-rose-800">{tDashboard('rejected')} {rejectedCount}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tDashboard('unreadMessages')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{unreadMessages}</p>
            <p className="mt-2 text-sm text-body">{tDashboard('unreadMessagesHint')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tDashboard('recentReviews')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{recentReviews.length}</p>
            <p className="mt-2 text-sm text-body">{tDashboard('recentReviewsHint')}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{tDashboard('quickLinks')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">{tDashboard('quickProfileTitle')}</p>
              <p className="mt-1 text-body">{tDashboard('quickProfileDesc')}</p>
              <Link className="mt-2 inline-block text-primary hover:underline" href="/dashboard/profile">/dashboard/profile</Link>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">{tDashboard('quickCredentialTitle')}</p>
              <p className="mt-1 text-body">{tDashboard('quickCredentialDesc')}</p>
              <Link className="mt-2 inline-block text-primary hover:underline" href="/dashboard/credentials">/dashboard/credentials</Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tDashboard('recentReviewList')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentReviews.length === 0 ? (
              <p className="text-sm text-body">{tDashboard('noRecentReviews')}</p>
            ) : (
              recentReviews.map((review) => (
                <div key={review.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-medium text-slate-900">{review.author.name ?? tDashboard('anonymousStudent')} · {review.rating}/5</p>
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
