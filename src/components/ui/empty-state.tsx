import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'

type EmptyStateProps = {
  icon?: ReactNode
  message: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({ icon, message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        {icon ?? <Inbox className="size-5" />}
      </div>
      <p className="text-sm text-body">{message}</p>
      {actionLabel && actionHref ? (
        <div className="mt-4">
          <Button variant="outline" render={<Link href={actionHref} />}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
