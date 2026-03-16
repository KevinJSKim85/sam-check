'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorFallback } from '@/components/ui/error-fallback'
import { Input } from '@/components/ui/input'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { Textarea } from '@/components/ui/textarea'
import { CREDENTIAL_TYPE_LABELS } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'

type QueueStatus = 'PENDING' | 'UNDER_REVIEW'
type ReviewStatus = 'APPROVED' | 'REJECTED'

type QueueCredential = {
  id: string
  type: keyof typeof CREDENTIAL_TYPE_LABELS
  label: string
  scoreValue: string | null
  description: string | null
  status: QueueStatus
  submittedAt: string
  documentName: string | null
  documentSignedUrl: string | null
  tutor: {
    id: string
    name: string | null
    email: string | null
    profile: {
      headline: string | null
      bio: string | null
      subjects: string[]
      curricula: string[]
      university: string | null
      degree: string | null
    }
  }
}

type QueueResponse = {
  pendingCount: number
  credentials: QueueCredential[]
}

type DraftById = Record<string, { verificationNote: string; rejectionReason: string }>

function renderStatusBadge(status: QueueStatus, labels: { underReview: string; pending: string }) {
  if (status === 'UNDER_REVIEW') {
    return <Badge className="bg-blue-100 text-blue-800">{labels.underReview}</Badge>
  }

  return <Badge className="bg-amber-100 text-amber-800">{labels.pending}</Badge>
}

export default function AdminCredentialQueuePage() {
  const locale = useLocale()
  const tAdmin = useTranslations('admin')
  const tErrors = useTranslations('errors')
  const isKo = locale === 'ko'

  const [credentials, setCredentials] = useState<QueueCredential[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [draftById, setDraftById] = useState<DraftById>({})

  const initializeDraft = useCallback((items: QueueCredential[]) => {
    setDraftById((prev) => {
      const next: DraftById = { ...prev }
      for (const item of items) {
        if (!next[item.id]) {
          next[item.id] = { verificationNote: '', rejectionReason: '' }
        }
      }
      return next
    })
  }, [])

  const loadQueue = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/credentials')
      const data = (await response.json()) as QueueResponse & { error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? tErrors('failedLoadQueue'))
      }

      setCredentials(data.credentials)
      setPendingCount(data.pendingCount)
      initializeDraft(data.credentials)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : tErrors('failedLoadQueue'))
    } finally {
      setLoading(false)
    }
  }, [initializeDraft, tErrors])

  useEffect(() => {
    void loadQueue()
  }, [loadQueue])

  const oldestDate = useMemo(() => {
    if (credentials.length === 0) {
      return null
    }
    return credentials[0]?.submittedAt ?? null
  }, [credentials])

  const updateDraft = (id: string, field: 'verificationNote' | 'rejectionReason', value: string) => {
    setDraftById((prev) => ({
      ...prev,
      [id]: {
        verificationNote: prev[id]?.verificationNote ?? '',
        rejectionReason: prev[id]?.rejectionReason ?? '',
        [field]: value,
      },
    }))
  }

  const handleReview = async (credentialId: string, status: ReviewStatus) => {

    const draft = draftById[credentialId] ?? { verificationNote: '', rejectionReason: '' }

    if (status === 'APPROVED' && draft.verificationNote.trim().length === 0) {
      setError(tErrors('approveNoteRequired'))
      return
    }

    if (status === 'REJECTED' && draft.rejectionReason.trim().length === 0) {
      setError(tErrors('rejectReasonRequired'))
      return
    }

    setSubmittingId(credentialId)
    setError('')
    setMessage('')

    try {
      const response = await fetch(`/api/admin/credentials/${credentialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          verificationNote: draft.verificationNote,
          rejectionReason: draft.rejectionReason,
        }),
      })

      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(data.error ?? tErrors('failedUpdateStatus'))
      }

      setMessage(status === 'APPROVED' ? tAdmin('approveSuccess') : tAdmin('rejectSuccess'))
      await loadQueue()
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : tErrors('failedUpdateStatus'))
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-10 sm:px-6 lg:px-8">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-900">{tAdmin('queueTitle')}</CardTitle>
          <p className="text-sm text-body">{tAdmin('queueSubtitle')}</p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="font-medium text-slate-900">{tAdmin('totalPending', { count: pendingCount })}</p>
          <p className="text-body">
            {oldestDate
              ? tAdmin('oldestSubmitted', { datetime: formatDateTime(oldestDate, locale) })
              : tAdmin('noPending')}
          </p>
        </CardContent>
      </Card>

      {loading ? <LoadingSkeleton variant="list" count={3} /> : null}
      {!loading && error ? <ErrorFallback message={error} onRetry={() => void loadQueue()} /> : null}
      {!loading && !error && credentials.length === 0 ? <EmptyState message={tAdmin('noPending')} /> : null}

      <div className="space-y-4">
        {credentials.map((credential) => {
          const draft = draftById[credential.id] ?? { verificationNote: '', rejectionReason: '' }

          return (
            <Card key={credential.id}>
              <CardContent className="pt-4">
                <details className="group">
                  <summary className="cursor-pointer list-none">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{credential.label}</p>
                        <p className="mt-1 text-sm text-body">
                           {credential.tutor.name ?? tAdmin('noName')} · {CREDENTIAL_TYPE_LABELS[credential.type][isKo ? 'ko' : 'en']}
                        </p>
                        <p className="mt-1 text-sm text-body">
                          {tAdmin('scoreAndDate', { score: credential.scoreValue ?? '-', datetime: formatDateTime(credential.submittedAt, locale) })}
                        </p>
                      </div>
                      {renderStatusBadge(credential.status, {
                        underReview: tAdmin('underReview'),
                        pending: tAdmin('pending'),
                      })}
                    </div>
                  </summary>

                  <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-sm font-semibold text-slate-900">{tAdmin('documentPreview')}</p>
                      {credential.documentSignedUrl ? (
                        <a
                          className="mt-2 inline-block text-sm text-primary hover:underline"
                          href={credential.documentSignedUrl}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {credential.documentName ?? tAdmin('viewDocument')}
                        </a>
                      ) : (
                        <p className="mt-2 text-sm text-body">{tAdmin('noDocument')}</p>
                      )}
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-sm font-semibold text-slate-900">{tAdmin('tutorProfileSummary')}</p>
                      <p className="mt-2 text-sm text-body">{tAdmin('email')}: {credential.tutor.email ?? '-'}</p>
                      <p className="mt-1 text-sm text-body">{tAdmin('headline')}: {credential.tutor.profile.headline ?? '-'}</p>
                      <p className="mt-1 text-sm text-body">{tAdmin('education')}: {credential.tutor.profile.university ?? '-'} {credential.tutor.profile.degree ?? ''}</p>
                      <p className="mt-1 text-sm text-body">{tAdmin('subjects')}: {credential.tutor.profile.subjects.join(', ') || '-'}</p>
                      <p className="mt-1 text-sm text-body">{tAdmin('curricula')}: {credential.tutor.profile.curricula.join(', ') || '-'}</p>
                      <p className="mt-1 text-sm text-body">{tAdmin('intro')}: {credential.tutor.profile.bio ?? credential.description ?? '-'}</p>
                    </div>

                    <form
                      className="space-y-3"
                      onSubmit={(event) => {
                        event.preventDefault()
                        void handleReview(credential.id, 'APPROVED')
                      }}
                    >
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-900" htmlFor={`verification-note-${credential.id}`}>
                          {tAdmin('approveNote')}
                        </label>
                        <Input
                          id={`verification-note-${credential.id}`}
                          placeholder={tAdmin('approveNotePlaceholder')}
                          value={draft.verificationNote}
                          onChange={(event) => updateDraft(credential.id, 'verificationNote', event.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-900" htmlFor={`rejection-reason-${credential.id}`}>
                          {tAdmin('rejectReason')}
                        </label>
                        <Textarea
                          id={`rejection-reason-${credential.id}`}
                          placeholder={tAdmin('rejectReasonPlaceholder')}
                          rows={3}
                          value={draft.rejectionReason}
                          onChange={(event) => updateDraft(credential.id, 'rejectionReason', event.target.value)}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button type="submit" variant="cta" disabled={submittingId === credential.id}>
                          {tAdmin('approve')}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={submittingId === credential.id}
                          onClick={() => {
                            void handleReview(credential.id, 'REJECTED')
                          }}
                        >
                          {tAdmin('reject')}
                        </Button>
                      </div>
                    </form>
                  </div>
                </details>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
    </div>
  )
}
