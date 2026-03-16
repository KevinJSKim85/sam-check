import { CircleHelp, MessageSquare, Monitor, Star, UserRound } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { CREDENTIAL_TYPE_LABELS, CURRICULA, SUBJECTS, TEACHING_MODE_LABELS } from '@/lib/constants'
import { prisma } from '@/lib/db'

function getInitials(name: string | null) {
  if (!name) return 'T'
  return name
    .split(' ')
    .map((item) => item[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getSubjectLabel(value: string, locale: string) {
  const subject = SUBJECTS.find((item) => item.value === value)
  if (!subject) return value
  return locale === 'ko' ? subject.label.ko : subject.label.en
}

function getCurriculumLabel(value: string) {
  const curriculum = CURRICULA.find((item) => item.value === value)
  return curriculum?.label ?? value
}

function renderStars(rating: number) {
  return [1, 2, 3, 4, 5].map((star) => (
    <Star
      key={star}
      className={star <= Math.round(rating) ? 'size-4 fill-amber-400 text-amber-400' : 'size-4 text-slate-300'}
    />
  ))
}

export default async function TutorDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const session = await auth()
  const tTutor = await getTranslations('tutor')
  const activeLocale = locale

  const tutor = await prisma.tutorProfile.findFirst({
    where: {
      id,
      isPublished: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      credentials: {
        where: {
          status: 'APPROVED',
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      reviews: {
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!tutor) {
    notFound()
  }

  const messageHref = session?.user ? `/messages/${tutor.userId}` : '/auth/login'
  const visibleCredentialsMobile = tutor.credentials.slice(0, 3)

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 pb-28 sm:px-6 lg:px-8 lg:pb-10">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-accent-700 px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="absolute -top-16 right-8 h-44 w-44 rounded-full bg-white/15 blur-3xl" />
            <div className="absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-cta/30 blur-3xl" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="size-24 ring-4 ring-white/35 sm:size-28" size="lg">
                <AvatarImage src={tutor.user.image ?? undefined} alt={tutor.user.name ?? 'Tutor photo'} />
                <AvatarFallback className="text-3xl font-bold text-primary-700">{getInitials(tutor.user.name)}</AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{tutor.user.name ?? 'Tutor'}</h1>
                <p className="text-white/90">{tutor.university ?? '-'}</p>
                {tutor.headline ? <p className="max-w-3xl text-sm text-white/85 sm:text-base">{tutor.headline}</p> : null}
              </div>
            </div>
          </div>

          <div className="space-y-4 px-6 py-5 sm:px-10">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-700">Credentials</h2>
              <div className="flex flex-wrap gap-2 md:hidden">
                {visibleCredentialsMobile.map((credential) => (
                  <Badge key={credential.id} variant="verified" className="h-auto rounded-full px-3 py-1 text-sm">
                    {CREDENTIAL_TYPE_LABELS[credential.type][activeLocale === 'ko' ? 'ko' : 'en']} {credential.scoreValue ?? credential.label} ✓
                    <CircleHelp className="size-3.5" />
                  </Badge>
                ))}
              </div>
              <div className="hidden flex-wrap gap-2 md:flex">
                {tutor.credentials.map((credential) => (
                  <Badge key={credential.id} variant="verified" className="h-auto rounded-full px-3 py-1 text-sm">
                    {CREDENTIAL_TYPE_LABELS[credential.type][activeLocale === 'ko' ? 'ko' : 'en']} {credential.scoreValue ?? credential.label} ✓
                    <CircleHelp className="size-3.5" />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <div className="rounded-xl border border-primary/20 bg-primary-50 p-4">
                <p className="text-xs font-medium text-primary-700">{tTutor('hourlyRate')}</p>
                <p className="mt-1 text-2xl font-bold text-primary-900">
                  {tutor.hourlyRate ? `₩${tutor.hourlyRate.toLocaleString()}/시간` : '-'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-600">{tTutor('teachingMode')}</p>
                <div className="mt-1 flex items-center gap-2 text-slate-900">
                  {tutor.teachingMode === 'ONLINE' ? <Monitor className="size-4" /> : <UserRound className="size-4" />}
                  <p className="font-semibold">
                    {activeLocale === 'ko'
                      ? TEACHING_MODE_LABELS[tutor.teachingMode].ko
                      : TEACHING_MODE_LABELS[tutor.teachingMode].en}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-slate-200 bg-white py-0 shadow-sm">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-xl font-semibold text-slate-900">About</h2>
              <p className="text-body">{tutor.bio ?? '-'}</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white py-0 shadow-sm">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-xl font-semibold text-slate-900">{tTutor('subjects')} & {tTutor('curricula')}</h2>
              <div>
                <p className="text-xs font-semibold text-slate-600">{tTutor('subjects')}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tutor.subjects.map((subject) => (
                    <Badge key={subject} variant="outline" className="border-primary/30 bg-primary-50 text-primary-800">
                      {getSubjectLabel(subject, locale)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600">{tTutor('curricula')}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tutor.curricula.map((curriculum) => (
                    <Badge key={curriculum} variant="outline" className="border-accent/30 bg-accent-50 text-accent-800">
                      {getCurriculumLabel(curriculum)}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">{tTutor('reviews')}</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">{renderStars(tutor.averageRating)}</div>
              <p className="text-sm font-semibold text-slate-800">{tutor.averageRating.toFixed(1)}</p>
              <p className="text-sm text-body">({tutor.totalReviews})</p>
            </div>
          </div>

          {tutor.reviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-body">
              {tTutor('noReviews')}
            </div>
          ) : (
            <div className="space-y-3">
              {tutor.reviews.map((review) => (
                <Card key={review.id} className="border border-slate-200 bg-slate-50 py-0">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          <AvatarImage src={review.author.image ?? undefined} alt={review.author.name ?? 'Reviewer'} />
                          <AvatarFallback>{getInitials(review.author.name)}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-semibold text-slate-800">{review.author.name ?? 'Student'}</p>
                      </div>
                      <div className="flex items-center gap-0.5">{renderStars(review.rating)}</div>
                    </div>
                    <p className="text-sm text-body">{review.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <div className="hidden justify-end md:flex">
          <Button variant="cta" size="lg" render={<Link href={messageHref} />}>
            <MessageSquare className="size-4" />
            {tTutor('sendMessage')}
          </Button>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-6px_18px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
        <Button variant="cta" size="lg" className="w-full" render={<Link href={messageHref} />}>
          <MessageSquare className="size-4" />
          {tTutor('sendMessage')}
        </Button>
      </div>
    </>
  )
}
