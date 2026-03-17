'use client'

import { ArrowRight, ShieldCheck, Star } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { SUBJECTS, TEACHING_MODE_LABELS } from '@/lib/constants'
import { formatKrw } from '@/lib/format'
import type { TutorCard as TutorCardType } from '@/types/tutor'

type TutorCardProps = {
  tutor: TutorCardType
}

function getInitials(name: string | null) {
  if (!name) return 'T'

  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getSubjectLabel(value: string, locale: string) {
  const subject = SUBJECTS.find((item) => item.value === value)
  if (!subject) return value
  return locale === 'ko' ? subject.label.ko : subject.label.en
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
    <Star
      key={star}
      className={star <= Math.round(rating) ? 'size-3.5 fill-amber-400 text-amber-400' : 'size-3.5 text-slate-200'}
    />
  ))
}

export function TutorCard({ tutor }: TutorCardProps) {
  const locale = useLocale()
  const tTutor = useTranslations('tutor')
  const verified = tutor.verifiedCredentials.length

  return (
    <Link href={`/tutors/${tutor.id}`} className="group block">
      <Card className="overflow-hidden border-slate-200 bg-white py-0 transition-all group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-lg">
        <div className="flex flex-col lg:flex-row">
          {/* Avatar section */}
          <div className="flex shrink-0 items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100/80 to-accent-50 p-6 lg:w-48 lg:p-8">
            <Avatar className="size-20 ring-4 ring-white/70 lg:size-24" size="lg">
              <AvatarImage
                src={tutor.image ?? undefined}
                alt={tutor.name ?? tTutor('unknownTutor')}
                className="rounded-full object-cover"
              />
              <AvatarFallback className="text-3xl font-bold text-primary-700/60 lg:text-4xl">
                {getInitials(tutor.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Content section */}
          <CardContent className="flex min-w-0 flex-1 flex-col gap-2.5 p-4 lg:py-5 lg:pr-6">
            {/* Row 1: Name + verified badge + price (desktop) */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-lg font-bold text-slate-900 transition-colors group-hover:text-primary">
                    {tutor.name ?? tTutor('unknownTutor')}
                  </span>
                  {verified > 0 && (
                    <Badge className="shrink-0 gap-1 border-accent/30 bg-accent-50 text-accent-700">
                      <ShieldCheck className="size-3" />
                      {tTutor('verified')}
                    </Badge>
                  )}
                </div>
                {tutor.university && (
                  <p className="mt-0.5 text-sm text-body">{tutor.university}</p>
                )}
                {tutor.headline && (
                  <p className="mt-0.5 line-clamp-1 text-sm text-slate-600">{tutor.headline}</p>
                )}
              </div>
              <div className="hidden shrink-0 text-right lg:block">
                <p className="text-xl font-bold text-primary">
                  {tutor.hourlyRate ? formatKrw(tutor.hourlyRate, locale) : '-'}
                </p>
                <p className="text-xs text-body">/{tTutor('perHour')}</p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">{renderStars(tutor.averageRating)}</div>
              <span className="text-sm font-semibold text-slate-800">
                {tutor.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-body">({tutor.totalReviews})</span>
            </div>

            {/* Subjects */}
            <div className="flex flex-wrap gap-1.5">
              {tutor.subjects.slice(0, 3).map((subject) => (
                <Badge
                  key={subject}
                  variant="outline"
                  className="border-primary/20 bg-primary-50/80 text-primary-800"
                >
                  {getSubjectLabel(subject, locale)}
                </Badge>
              ))}
              {tutor.subjects.length > 3 && (
                <Badge variant="outline" className="border-slate-200 text-body">
                  +{tutor.subjects.length - 3}
                </Badge>
              )}
            </div>

            {/* Bottom: teaching mode + credentials + price(mobile) + arrow */}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2 text-sm text-body">
                <span>
                  {locale === 'ko'
                    ? TEACHING_MODE_LABELS[tutor.teachingMode].ko
                    : TEACHING_MODE_LABELS[tutor.teachingMode].en}
                </span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-accent" />
                  {locale === 'ko' ? `${tTutor('verified')} ${verified}` : `${verified} ${tTutor('verified')}`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile price */}
                <p className="text-lg font-bold text-primary lg:hidden">
                  {tutor.hourlyRate
                    ? `${formatKrw(tutor.hourlyRate, locale)}/${tTutor('perHour')}`
                    : '-'}
                </p>

                <ArrowRight className="size-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  )
}
