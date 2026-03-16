'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { reviewSchema } from '@/schemas/review'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from '@/components/features/reviews/star-rating'

type ReviewFormProps = {
  tutorProfileId: string
}

export function ReviewForm({ tutorProfileId }: ReviewFormProps) {
  const tReview = useTranslations('review')
  const tErrors = useTranslations('errors')
  const router = useRouter()

  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const parsed = reviewSchema.safeParse({ rating, content })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? tErrors('invalidReviewInput'))
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/tutors/${tutorProfileId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed.data),
      })

      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? tErrors('failedSubmitReview'))
      }

      setContent('')
      setRating(5)
      setSuccess(tReview('submitSuccess'))
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : tErrors('failedSubmitReview'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">{tReview('writeReview')}</p>
        <StarRating value={rating} onChange={setRating} disabled={saving} />
      </div>

      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={tReview('reviewPlaceholder')}
        rows={4}
        maxLength={1000}
        disabled={saving}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">{content.length}/1000</p>
        <Button type="submit" disabled={saving}>
          {saving ? '...' : tReview('submitReview')}
        </Button>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
    </form>
  )
}
