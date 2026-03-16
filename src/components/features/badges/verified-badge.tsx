'use client'

import { BadgeCheck, CircleHelp } from 'lucide-react'
import { useLocale } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { CredentialType, VerificationStatus } from '@/types/credential'

const DEFAULT_VERIFICATION_NOTE: Record<CredentialType, { ko: string; en: string }> = {
  SAT: {
    ko: 'CollegeBoard Score Report로 인증됨',
    en: 'Verified with College Board score report',
  },
  ACT: {
    ko: 'ACT 성적표로 인증됨',
    en: 'Verified with ACT score report',
  },
  AP: {
    ko: 'AP 성적표로 인증됨',
    en: 'Verified with AP score report',
  },
  IB: {
    ko: 'IB 성적표로 인증됨',
    en: 'Verified with IB score report',
  },
  LANGUAGE_TEST: {
    ko: '공인 어학 성적표로 인증됨',
    en: 'Verified with language test score report',
  },
  SCHOOL_CERT: {
    ko: '재학/졸업 증명서로 인증됨',
    en: 'Verified with school enrollment or graduation certificate',
  },
  EXPERIENCE: {
    ko: '경력 증빙 자료로 인증됨',
    en: 'Verified with teaching experience documentation',
  },
}

type VerifiedBadgeProps = {
  type: CredentialType
  label: string
  scoreValue: string | null
  verificationNote: string | null
  status: VerificationStatus
}

export function VerifiedBadge({
  type,
  label,
  scoreValue,
  verificationNote,
}: VerifiedBadgeProps) {
  const locale = useLocale()
  const activeLocale = locale === 'ko' ? 'ko' : 'en'

  const note =
    verificationNote?.trim() || DEFAULT_VERIFICATION_NOTE[type][activeLocale]

  return (
    <Badge
      variant="verified"
      className="h-auto min-h-8 gap-1.5 rounded-full px-3 py-1 text-sm"
    >
      <BadgeCheck className="size-3.5" />
      <span className="max-w-[180px] truncate">
        {scoreValue ? `${label} ${scoreValue}` : label} ✓
      </span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            aria-label="Verification details"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-green-800/80 outline-none transition hover:bg-green-200/70 focus-visible:ring-2 focus-visible:ring-green-700"
          >
            <CircleHelp className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent className="max-w-[240px] text-center leading-relaxed break-words">
            {note}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Badge>
  )
}
