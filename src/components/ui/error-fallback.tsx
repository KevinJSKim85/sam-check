'use client'

import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

type ErrorFallbackProps = {
  message?: string
  onRetry?: () => void
}

export function ErrorFallback({ message, onRetry }: ErrorFallbackProps) {
  const tCommon = useTranslations('common')

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
      <AlertTriangle className="mx-auto mb-2 size-5 text-rose-600" />
      <p className="text-sm text-rose-700">{message}</p>
      {onRetry ? (
        <div className="mt-3">
          <Button type="button" variant="outline" onClick={onRetry}>
            {tCommon('retry')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
