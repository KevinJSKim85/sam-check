'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CREDENTIAL_TYPE_LABELS } from '@/lib/constants'

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

function renderStatusBadge(status: QueueStatus) {
  if (status === 'UNDER_REVIEW') {
    return <Badge className="bg-blue-100 text-blue-800">심사 중</Badge>
  }

  return <Badge className="bg-amber-100 text-amber-800">대기 중</Badge>
}

export default function AdminCredentialQueuePage() {
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
        throw new Error(data.error ?? '인증 큐를 불러오지 못했습니다.')
      }

      setCredentials(data.credentials)
      setPendingCount(data.pendingCount)
      initializeDraft(data.credentials)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [initializeDraft])

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
      setError('승인 시 검토 메모를 입력해주세요.')
      return
    }

    if (status === 'REJECTED' && draft.rejectionReason.trim().length === 0) {
      setError('반려 사유를 입력해주세요.')
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
        throw new Error(data.error ?? '상태 업데이트에 실패했습니다.')
      }

      setMessage(status === 'APPROVED' ? '인증을 승인했습니다.' : '인증을 반려했습니다.')
      await loadQueue()
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : '오류가 발생했습니다.')
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-10 sm:px-6 lg:px-8">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-900">자격 인증 검토 큐</CardTitle>
          <p className="text-sm text-body">대기/심사 중 인증을 오래된 순으로 확인하고 승인 또는 반려할 수 있습니다.</p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="font-medium text-slate-900">총 대기 건수: {pendingCount}</p>
          <p className="text-body">
            {oldestDate ? `최오래된 제출: ${new Date(oldestDate).toLocaleString('ko-KR')}` : '현재 대기 건이 없습니다.'}
          </p>
        </CardContent>
      </Card>

      {loading ? <p className="text-sm text-body">불러오는 중...</p> : null}
      {!loading && credentials.length === 0 ? <p className="text-sm text-body">검토할 인증이 없습니다.</p> : null}

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
                          {credential.tutor.name ?? '이름 없음'} · {CREDENTIAL_TYPE_LABELS[credential.type].ko}
                        </p>
                        <p className="mt-1 text-sm text-body">
                          점수: {credential.scoreValue ?? '-'} · 제출일: {new Date(credential.submittedAt).toLocaleString('ko-KR')}
                        </p>
                      </div>
                      {renderStatusBadge(credential.status)}
                    </div>
                  </summary>

                  <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-sm font-semibold text-slate-900">서류 미리보기</p>
                      {credential.documentSignedUrl ? (
                        <a
                          className="mt-2 inline-block text-sm text-primary hover:underline"
                          href={credential.documentSignedUrl}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {credential.documentName ?? '서류 보기'}
                        </a>
                      ) : (
                        <p className="mt-2 text-sm text-body">첨부된 서류가 없습니다.</p>
                      )}
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-sm font-semibold text-slate-900">튜터 프로필 요약</p>
                      <p className="mt-2 text-sm text-body">이메일: {credential.tutor.email ?? '-'}</p>
                      <p className="mt-1 text-sm text-body">헤드라인: {credential.tutor.profile.headline ?? '-'}</p>
                      <p className="mt-1 text-sm text-body">학력: {credential.tutor.profile.university ?? '-'} {credential.tutor.profile.degree ?? ''}</p>
                      <p className="mt-1 text-sm text-body">과목: {credential.tutor.profile.subjects.join(', ') || '-'}</p>
                      <p className="mt-1 text-sm text-body">커리큘럼: {credential.tutor.profile.curricula.join(', ') || '-'}</p>
                      <p className="mt-1 text-sm text-body">소개: {credential.tutor.profile.bio ?? credential.description ?? '-'}</p>
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
                          승인 메모
                        </label>
                        <Input
                          id={`verification-note-${credential.id}`}
                          placeholder="예: CollegeBoard Score Report로 인증됨"
                          value={draft.verificationNote}
                          onChange={(event) => updateDraft(credential.id, 'verificationNote', event.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-900" htmlFor={`rejection-reason-${credential.id}`}>
                          반려 사유
                        </label>
                        <Textarea
                          id={`rejection-reason-${credential.id}`}
                          placeholder="반려 시 필수 입력"
                          rows={3}
                          value={draft.rejectionReason}
                          onChange={(event) => updateDraft(credential.id, 'rejectionReason', event.target.value)}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button type="submit" variant="cta" disabled={submittingId === credential.id}>
                          승인
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={submittingId === credential.id}
                          onClick={() => {
                            void handleReview(credential.id, 'REJECTED')
                          }}
                        >
                          반려
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
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
