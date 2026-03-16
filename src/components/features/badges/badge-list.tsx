'use client'

import { Badge } from '@/components/ui/badge'
import type { CredentialDisplay } from '@/types/credential'
import { VerifiedBadge } from './verified-badge'

type BadgeListProps = {
  credentials: CredentialDisplay[]
  maxVisible?: number
}

export function BadgeList({ credentials, maxVisible }: BadgeListProps) {
  const hasLimit = typeof maxVisible === 'number'
  const visibleLimit = hasLimit ? maxVisible : credentials.length
  const visibleCredentials = credentials.slice(0, visibleLimit)
  const hiddenCount = hasLimit ? Math.max(credentials.length - visibleLimit, 0) : 0

  if (credentials.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visibleCredentials.map((credential) => (
        <VerifiedBadge
          key={credential.id}
          type={credential.type}
          label={credential.label}
          scoreValue={credential.scoreValue}
          verificationNote={credential.verificationNote}
          status={credential.status}
        />
      ))}
      {hiddenCount > 0 ? (
        <Badge variant="outline" className="h-auto min-h-8 rounded-full px-3 py-1 text-sm">
          +{hiddenCount} 더보기
        </Badge>
      ) : null}
    </div>
  )
}
