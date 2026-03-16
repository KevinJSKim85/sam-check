import { Skeleton } from '@/components/ui/skeleton'

type LoadingSkeletonProps = {
  variant: 'card-grid' | 'profile' | 'list'
  count?: number
  className?: string
}

export function LoadingSkeleton({ variant, count = 3, className }: LoadingSkeletonProps) {
  if (variant === 'card-grid') {
    return (
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 ${className ?? ''}`}>
        {Array.from({ length: count }, (_, item) => item + 1).map((item) => (
          <div key={`card-grid-${item}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <Skeleton className="h-44 w-full rounded-none" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'profile') {
    return (
      <div className={`space-y-4 ${className ?? ''}`}>
        <Skeleton className="h-56 w-full rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className ?? ''}`}>
      {Array.from({ length: count }, (_, item) => item + 1).map((item) => (
        <div key={`list-${item}`} className="rounded-xl border border-slate-200 bg-white p-4">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}
