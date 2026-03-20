import { MessageSquare, Monitor, ShieldCheck, UserRound } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/auth'
import { BadgeList } from '@/components/features/badges/badge-list'
import { ReviewCard } from '@/components/features/reviews/review-card'
import { ReviewForm } from '@/components/features/reviews/review-form'
import { StarDisplay } from '@/components/features/reviews/star-display'
import { LessonRequestPanel } from '@/components/features/payments/lesson-request-panel'
import { JsonLd } from '@/components/seo/json-ld'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Link } from '@/i18n/routing'
import { CREDENTIAL_TYPE_LABELS, CURRICULA, SUBJECTS, TEACHING_MODE_LABELS } from '@/lib/constants'
import { prisma } from '@/lib/db'
import { formatKrw } from '@/lib/format'

const SITE_URL = 'https://sam-check.vercel.app'

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

async function getPublishedTutorProfile(id: string) {
  return prisma.tutorProfile.findFirst({
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
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  const activeLocale = locale === 'en' ? 'en' : 'ko'
  const tTutor = await getTranslations({ locale: activeLocale, namespace: 'tutor' })
  const tutor = await prisma.tutorProfile.findFirst({
    where: {
      id,
      isPublished: true,
    },
    select: {
      id: true,
      user: {
        select: {
          name: true,
        },
      },
      headline: true,
      subjects: true,
      averageRating: true,
      totalReviews: true,
      updatedAt: true,
    },
  })

  if (!tutor) {
    return {
      title: tTutor('notFoundTitle'),
      description: tTutor('notFoundDescription'),
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const tutorName = tutor.user.name ?? tTutor('unknownTutor')
  const primarySubjects = tutor.subjects
    .slice(0, 3)
    .map((subject) => getSubjectLabel(subject, activeLocale))
  const title =
    primarySubjects.length > 0
      ? `${tutorName} - ${primarySubjects.join(', ')}`
      : tutorName
  const description =
    tutor.headline ??
    (activeLocale === 'ko'
      ? `${tutorName} 튜터의 과목, 리뷰, 인증 정보를 확인해보세요.`
      : `See ${tutorName}'s subjects, reviews, and verified credentials.`)
  const detailPath = `/${activeLocale}/tutors/${id}`

  return {
    title,
    description,
    alternates: {
      canonical: detailPath,
      languages: {
        ko: `${SITE_URL}/ko/tutors/${id}`,
        en: `${SITE_URL}/en/tutors/${id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: detailPath,
      type: 'profile',
      images: [{ url: '/logo-light.png', width: 400, height: 200, alt: tutorName }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/logo-light.png'],
    },
  }
}

export default async function TutorDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const session = await auth()
  const tTutor = await getTranslations('tutor')
  const tReview = await getTranslations('review')
  const activeLocale = locale

  const tutor = await getPublishedTutorProfile(id)

  if (!tutor) {
    notFound()
  }

  const messageHref = session?.user ? `/messages/${tutor.userId}` : '/auth/login'
  const hasReviewed = Boolean(
    session?.user && tutor.reviews.some((review) => review.authorId === session.user.id)
  )
  const canWriteReview = Boolean(
    session?.user &&
      session.user.role === 'STUDENT' &&
      session.user.id !== tutor.userId &&
      !hasReviewed
  )
  const tutorName = tutor.user.name ?? tTutor('unknownTutor')
  const tutorProfileUrl = `${SITE_URL}/${locale}/tutors/${id}`
  const tutorDetailSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: tutorName,
      description: tutor.headline ?? tutor.bio,
      image: tutor.user.image,
      url: tutorProfileUrl,
      knowsAbout: tutor.subjects.map((subject) => getSubjectLabel(subject, locale)),
      alumniOf: tutor.university
        ? {
            '@type': 'CollegeOrUniversity',
            name: tutor.university,
          }
        : undefined,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name:
        locale === 'ko'
          ? `${tutorName} 1:1 튜터링`
          : `${tutorName} 1:1 tutoring service`,
      provider: {
        '@type': 'Person',
        name: tutorName,
        url: tutorProfileUrl,
      },
      serviceType: locale === 'ko' ? '1:1 과외 수업' : '1:1 private tutoring',
      areaServed: 'KR',
      availableLanguage: ['ko', 'en'],
      offers: tutor.hourlyRate
        ? {
            '@type': 'Offer',
            price: tutor.hourlyRate,
            priceCurrency: 'KRW',
          }
        : undefined,
      aggregateRating:
        tutor.totalReviews > 0
          ? {
              '@type': 'AggregateRating',
              ratingValue: tutor.averageRating,
              reviewCount: tutor.totalReviews,
            }
          : undefined,
    },
  ]

  return (
    <>
      <JsonLd data={tutorDetailSchemas} />
      <div className="mx-auto w-full max-w-6xl px-4 py-10 pb-28 sm:px-6 lg:px-8 lg:pb-10">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative bg-primary px-6 py-8 text-primary-foreground sm:px-10 sm:py-10">
            <div className="absolute -top-16 right-8 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-cta/20 blur-3xl" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="size-24 ring-4 ring-white/35 sm:size-28" size="lg">
                <AvatarImage src={tutor.user.image ?? undefined} alt={tutor.user.name ?? tTutor('unknownTutor')} />
                <AvatarFallback className="border border-white/40 bg-white/90 text-3xl font-bold text-primary-700">{getInitials(tutor.user.name)}</AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{tutor.user.name ?? tTutor('unknownTutor')}</h1>
                  {tutor.credentials.length > 0 && (
                    <Badge className="shrink-0 gap-1 border-white/30 bg-white/20 text-white">
                      <ShieldCheck className="size-3.5" />
                      {tTutor('verified')}
                    </Badge>
                  )}
                </div>
                <p className="text-white/90">{tutor.university ?? '-'}</p>
                {tutor.headline ? <p className="max-w-3xl text-sm text-white/80 sm:text-base">{tutor.headline}</p> : null}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Card className="border-slate-200 bg-white py-0 shadow-sm">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-xl font-semibold text-slate-900">{tTutor('profileAbout')}</h2>
                <p className="whitespace-pre-line text-body">{tutor.bio ?? '-'}</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white py-0 shadow-sm">
              <CardContent className="space-y-5 p-6">
                <h2 className="text-xl font-semibold text-slate-900">{tTutor('subjects')} & {tTutor('curricula')}</h2>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{tTutor('subjects')}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tutor.subjects.map((subject) => (
                      <Badge key={subject} variant="outline" className="border-primary/30 bg-primary-50 px-3 py-1.5 text-primary-800">
                        {getSubjectLabel(subject, locale)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{tTutor('curricula')}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tutor.curricula.map((curriculum) => (
                      <Badge key={curriculum} variant="outline" className="border-accent/30 bg-accent-50 px-3 py-1.5 text-accent-800">
                        {getCurriculumLabel(curriculum)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {tutor.credentials.length > 0 && (
              <Card className="border-slate-200 bg-white py-0 shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-5 text-accent" />
                    <h2 className="text-xl font-semibold text-slate-900">{tTutor('credentials')}</h2>
                  </div>
                  <BadgeList
                    credentials={tutor.credentials.map((credential) => ({
                      ...credential,
                      createdAt: credential.createdAt.toISOString(),
                      label:
                        CREDENTIAL_TYPE_LABELS[credential.type][
                          activeLocale === 'ko' ? 'ko' : 'en'
                        ],
                    }))}
                  />
                </CardContent>
              </Card>
            )}

            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">{tTutor('reviews')}</h2>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={tutor.averageRating} />
                  <p className="text-sm font-semibold text-slate-800">{tutor.averageRating.toFixed(1)}</p>
                  <p className="text-sm text-body">({tutor.totalReviews})</p>
                </div>
              </div>

              {canWriteReview ? <ReviewForm tutorProfileId={tutor.id} /> : null}
              {!canWriteReview && hasReviewed ? (
                <p className="text-sm text-slate-600">{tReview('alreadyReviewed')}</p>
              ) : null}

              {tutor.reviews.length === 0 ? (
                <EmptyState message={tTutor('noReviews')} />
              ) : (
                <div className="space-y-3">
                  {tutor.reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      locale={locale}
                      review={{
                        id: review.id,
                        authorName: review.author.name,
                        authorImage: review.author.image,
                        rating: review.rating,
                        content: review.content,
                        createdAt: review.createdAt.toISOString(),
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <Card className="border-slate-200 bg-white py-0 shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <div className="rounded-xl border border-primary/20 bg-primary-50 p-4 text-center">
                    <p className="text-xs font-medium text-primary-700">{tTutor('hourlyRate')}</p>
                    <p className="mt-1 text-3xl font-bold text-primary-900">
                      {tutor.hourlyRate ? formatKrw(tutor.hourlyRate, locale) : '-'}
                    </p>
                    <p className="text-sm text-primary-700">/{tTutor('perHour')}</p>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      {tutor.teachingMode === 'ONLINE' ? <Monitor className="size-4" /> : <UserRound className="size-4" />}
                      <span className="font-medium">
                        {activeLocale === 'ko'
                          ? TEACHING_MODE_LABELS[tutor.teachingMode].ko
                          : TEACHING_MODE_LABELS[tutor.teachingMode].en}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <StarDisplay rating={tutor.averageRating} />
                    <span className="text-sm font-semibold text-slate-800">{tutor.averageRating.toFixed(1)}</span>
                    <span className="text-sm text-body">({tutor.totalReviews})</span>
                  </div>

                  {tutor.credentials.length > 0 && (
                    <div className="flex items-center justify-center gap-1.5 text-sm text-accent-700">
                      <ShieldCheck className="size-4" />
                      <span className="font-medium">
                        {activeLocale === 'ko'
                          ? `${tTutor('verified')} ${tutor.credentials.length}건`
                          : `${tutor.credentials.length} ${tTutor('verified')}`}
                      </span>
                    </div>
                  )}

                  <Button variant="cta" size="lg" className="min-h-12 w-full text-base" render={<Link href={messageHref} />}>
                    <MessageSquare className="size-4" />
                    {tTutor('sendMessage')}
                  </Button>

                  {session?.user?.role === 'STUDENT' ? (
                    <LessonRequestPanel
                      tutorProfileId={tutor.id}
                      tutorName={tutor.user.name ?? tTutor('unknownTutor')}
                      hourlyRateKrw={tutor.hourlyRate ?? 0}
                      subjects={tutor.subjects}
                      defaultSubject={tutor.subjects[0]}
                    />
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-6px_18px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-primary">
              {tutor.hourlyRate ? `${formatKrw(tutor.hourlyRate, locale)}/${tTutor('perHour')}` : '-'}
            </p>
          </div>
          <Button variant="cta" size="lg" className="min-h-11 shrink-0" render={<Link href={messageHref} />}>
            <MessageSquare className="size-4" />
            {tTutor('sendMessage')}
          </Button>
        </div>
      </div>
    </>
  )
}
