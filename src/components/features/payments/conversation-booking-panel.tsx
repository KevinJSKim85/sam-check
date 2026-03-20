'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LessonRequestPanel } from '@/components/features/payments/lesson-request-panel'
import { Link } from '@/i18n/routing'

type BookingRecord = {
  id: string
  studentId: string
  tutorUserId: string
  tutorProfileId: string
  subject: string
  curriculum: string | null
  requestedMessage: string | null
  startsAt: string
  endsAt: string
  durationMinutes: number
  grossAmountKrw: number
  platformFeeAmountKrw: number
  tutorNetAmountKrw: number
  status: string
  order: {
    merchantOrderNo: string
    status: string
    payment: {
      status: string
    } | null
  } | null
}

type ConversationBookingPanelProps = {
  partnerId: string
  partnerName: string | null
  tutorProfileId: string | null
  tutorHourlyRate: number | null
  tutorSubjects: string[]
  currentUserId: string
  currentUserRole: string
  locale: string
}

function statusLabel(status: string) {
  switch (status) {
    case 'REQUESTED':
      return '승인 대기'
    case 'ACCEPTED':
      return '결제 대기'
    case 'CONFIRMED':
      return '결제 완료'
    case 'COMPLETED':
      return '수업 완료'
    case 'DECLINED':
      return '거절됨'
    case 'CANCELED':
      return '취소됨'
    default:
      return status
  }
}

export function ConversationBookingPanel({
  partnerId,
  partnerName,
  tutorProfileId,
  tutorHourlyRate,
  tutorSubjects,
  currentUserId,
  currentUserRole,
  locale,
}: ConversationBookingPanelProps) {
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/lesson-requests?partnerId=${partnerId}`)
      const data = (await response.json()) as { bookings?: BookingRecord[]; error?: string }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load lesson requests')
      }

      setBookings(data.bookings || [])
      setError('')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load lesson requests')
    } finally {
      setLoading(false)
    }
  }, [partnerId])

  useEffect(() => {
    void loadBookings()
  }, [loadBookings])

  const latestBooking = useMemo(() => bookings[0] ?? null, [bookings])

  async function updateBooking(id: string, action: 'accept' | 'decline' | 'cancel' | 'complete') {
    try {
      setActingId(id)
      const response = await fetch(`/api/lesson-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update lesson request')
      }

      await loadBookings()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Failed to update lesson request')
    } finally {
      setActingId(null)
    }
  }

  const canRequestLesson = currentUserRole === 'STUDENT' && Boolean(tutorProfileId)

  return (
    <div className="space-y-3 border-x border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">수업 결제</p>
          <p className="text-xs text-slate-600">메시지 안에서 수업 요청, 승인, 결제를 이어갈 수 있습니다.</p>
        </div>
        {canRequestLesson ? (
          <LessonRequestPanel
            tutorProfileId={tutorProfileId!}
            tutorName={partnerName || '튜터'}
            hourlyRateKrw={tutorHourlyRate || 0}
            subjects={tutorSubjects.length > 0 ? tutorSubjects : ['상담 후 선택']}
            onCreated={loadBookings}
          />
        ) : null}
      </div>

      {loading ? <p className="text-sm text-slate-500">수업 요청을 불러오는 중...</p> : null}
      {!loading && !latestBooking ? <p className="text-sm text-slate-500">아직 생성된 수업 요청이 없습니다.</p> : null}

      {latestBooking ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900">{latestBooking.subject}</p>
              <p className="text-sm text-slate-600">
                {new Date(latestBooking.startsAt).toLocaleString('ko-KR')} / {latestBooking.durationMinutes}분
              </p>
            </div>
            <Badge variant="outline">{statusLabel(latestBooking.status)}</Badge>
          </div>

          <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
            <div>
              <span className="text-slate-500">총 결제금액</span>
              <p className="font-semibold text-slate-900">{latestBooking.grossAmountKrw.toLocaleString('ko-KR')}원</p>
            </div>
            <div>
              <span className="text-slate-500">플랫폼 수수료</span>
              <p>{latestBooking.platformFeeAmountKrw.toLocaleString('ko-KR')}원</p>
            </div>
            <div>
              <span className="text-slate-500">튜터 정산 예정</span>
              <p>{latestBooking.tutorNetAmountKrw.toLocaleString('ko-KR')}원</p>
            </div>
          </div>

          {latestBooking.requestedMessage ? (
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{latestBooking.requestedMessage}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {currentUserId === latestBooking.tutorUserId && latestBooking.status === 'REQUESTED' ? (
              <>
                <Button variant="cta" disabled={actingId === latestBooking.id} onClick={() => void updateBooking(latestBooking.id, 'accept')}>
                  승인 후 결제 요청
                </Button>
                <Button variant="outline" disabled={actingId === latestBooking.id} onClick={() => void updateBooking(latestBooking.id, 'decline')}>
                  거절
                </Button>
              </>
            ) : null}

            {currentUserId === latestBooking.studentId && latestBooking.status === 'ACCEPTED' && latestBooking.order ? (
              <Button variant="cta" render={<Link href={`/payments/${latestBooking.order.merchantOrderNo}`} locale={locale} />}>
                지금 결제하기
              </Button>
            ) : null}

            {latestBooking.status === 'CONFIRMED' ? (
              <Button variant="outline" disabled={actingId === latestBooking.id} onClick={() => void updateBooking(latestBooking.id, 'complete')}>
                수업 완료 처리
              </Button>
            ) : null}

            {['REQUESTED', 'ACCEPTED'].includes(latestBooking.status) ? (
              <Button variant="ghost" disabled={actingId === latestBooking.id} onClick={() => void updateBooking(latestBooking.id, 'cancel')}>
                요청 취소
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  )
}
