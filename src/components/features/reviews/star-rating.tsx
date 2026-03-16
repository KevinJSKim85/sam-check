'use client'

import { Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

type StarRatingProps = {
  value: number
  onChange: (rating: number) => void
  disabled?: boolean
}

export function StarRating({ value, onChange, disabled = false }: StarRatingProps) {
  const tReview = useTranslations('review')

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => {
        const active = star <= value

        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            className="rounded-md p-1 transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`${tReview('rating')} ${star}`}
          >
            <Star
              className={`size-6 transition ${
                active ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-300'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
