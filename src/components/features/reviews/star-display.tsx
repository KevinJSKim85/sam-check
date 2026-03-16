import { Star } from 'lucide-react'

type StarDisplayProps = {
  rating: number
  sizeClassName?: string
}

export function StarDisplay({ rating, sizeClassName = 'size-4' }: StarDisplayProps) {
  const rounded = Math.round(rating)

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
        <Star
          key={star}
          className={`${sizeClassName} ${
            star <= rounded ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
          }`}
        />
      ))}
    </div>
  )
}
