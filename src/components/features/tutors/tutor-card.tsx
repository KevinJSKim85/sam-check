'use client'

import { BadgeCheck, Star } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { SUBJECTS, TEACHING_MODE_LABELS } from '@/lib/constants'
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
      className={star <= Math.round(rating) ? 'size-3.5 fill-amber-400 text-amber-400' : 'size-3.5 text-slate-300'}
    />
  ))
}

export function TutorCard({ tutor }: TutorCardProps) {
  const locale = useLocale()
  const tTutor = useTranslations('tutor')

  return (
    <Card className="overflow-hidden border-slate-200 bg-white py-0 transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/tutors/${tutor.id}`} className="block">
        <div className="relative h-48 bg-gradient-to-br from-primary-100 via-primary-200 to-accent-100">
          <div className="flex h-full w-full items-center justify-center">
            <Avatar className="size-28 ring-4 ring-white/70" size="lg">
              <AvatarImage src={tutor.image ?? undefined} alt={tutor.name ?? 'Tutor photo'} className="rounded-full object-cover" />
              <AvatarFallback className="text-4xl font-bold text-primary-700/70">
                {getInitials(tutor.name)}
              </AvatarFallback>
            </Avatar>
          </div>
          {!tutor.image && (
            <div className="absolute inset-0 -z-10 flex h-full w-full items-center justify-center text-5xl font-bold text-primary-700/20">
              {getInitials(tutor.name)}
            </div>
          )}
        </div>
      </Link>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/tutors/${tutor.id}`} className="text-lg font-semibold text-slate-900 hover:text-primary">
              {tutor.name ?? 'Tutor'}
            </Link>
            {tutor.university ? <p className="text-sm text-body">{tutor.university}</p> : null}
          </div>
          <p className="text-sm font-semibold text-primary">
            {tutor.hourlyRate ? `₩${tutor.hourlyRate.toLocaleString()}/${locale === 'ko' ? '시간' : 'hr'}` : '-'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">{renderStars(tutor.averageRating)}</div>
          <span className="text-xs font-medium text-slate-700">{tutor.averageRating.toFixed(1)}</span>
          <span className="text-xs text-body">({tutor.totalReviews})</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tutor.subjects.slice(0, 3).map((subject) => (
            <Badge key={subject} variant="outline" className="border-primary/30 bg-primary-50 text-primary-800">
              {getSubjectLabel(subject, locale)}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <p className="text-xs text-body">
            {locale === 'ko'
              ? TEACHING_MODE_LABELS[tutor.teachingMode].ko
              : TEACHING_MODE_LABELS[tutor.teachingMode].en}
          </p>
          <Badge variant="verified" className="gap-1">
            <BadgeCheck className="size-3" />
            {tTutor('verified')} {tutor.verifiedCredentials.length}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
