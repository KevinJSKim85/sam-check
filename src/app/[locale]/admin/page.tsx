import { UserRole, VerificationStatus } from '@prisma/client'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { prisma } from '@/lib/db'

export default async function AdminPage() {
  const tAdmin = await getTranslations('admin')

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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{tAdmin('dashboardTitle')}</h1>
        <p className="mt-2 text-sm text-body">{tAdmin('dashboardSubtitle')}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>{tAdmin('pendingCredentials')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{pendingCredentials}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tAdmin('totalTutors')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{totalTutors}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tAdmin('totalStudents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{totalStudents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tAdmin('totalMessages')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{totalMessages}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{tAdmin('credentialQueueTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-body">{tAdmin('credentialQueueDesc')}</p>
            <Link className="inline-block text-sm font-semibold text-primary hover:underline" href="/admin/credentials">
              {tAdmin('goToCredentials')}
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tAdmin('messageOversightTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-body">{tAdmin('messageOversightDesc')}</p>
            <Link className="inline-block text-sm font-semibold text-primary hover:underline" href="/admin/messages">
              {tAdmin('goToMessages')}
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
