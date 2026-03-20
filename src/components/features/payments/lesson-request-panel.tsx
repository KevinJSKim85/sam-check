'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type LessonRequestPanelProps = {
  tutorProfileId: string
  tutorName: string
  hourlyRateKrw: number
  subjects: string[]
  defaultSubject?: string
  onCreated?: () => Promise<void> | void
}

export function LessonRequestPanel({
  tutorProfileId,
  tutorName,
  hourlyRateKrw,
  subjects,
  defaultSubject,
  onCreated,
}: LessonRequestPanelProps) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState(defaultSubject || subjects[0] || '')
  const [curriculum, setCurriculum] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('60')
  const [requestedMessage, setRequestedMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const canRequest = hourlyRateKrw > 0 && subjects.length > 0

  const grossAmountKrw = Math.floor((hourlyRateKrw * Number(durationMinutes || '60')) / 60)
  const feeAmountKrw = Math.floor(grossAmountKrw * 0.05)

  async function handleSubmit() {
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/lesson-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorProfileId,
          subject,
          curriculum,
          startsAt: new Date(startsAt).toISOString(),
          durationMinutes: Number(durationMinutes),
          requestedMessage,
        }),
      })

      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request lesson')
      }

      setOpen(false)
      setStartsAt('')
      setRequestedMessage('')
      if (onCreated) {
        await onCreated()
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to request lesson')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cta px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-cta-600">
        {canRequest ? '수업 요청하기' : '결제 준비중'}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{tutorName} 튜터에게 수업 요청</DialogTitle>
          <DialogDescription>
            수업 시간과 과목을 정하면, 튜터가 승인한 뒤 결제를 진행할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900" htmlFor="lesson-subject">
              과목
            </label>
            <select
              id="lesson-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
            >
              {subjects.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900" htmlFor="lesson-curriculum">
              과정/시험
            </label>
            <Input id="lesson-curriculum" value={curriculum} onChange={(event) => setCurriculum(event.target.value)} placeholder="예: AP, IB, 수능" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900" htmlFor="lesson-starts-at">
                희망 시작 시간
              </label>
              <Input id="lesson-starts-at" type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900" htmlFor="lesson-duration">
                수업 길이
              </label>
              <select
                id="lesson-duration"
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                <option value="60">60분</option>
                <option value="90">90분</option>
                <option value="120">120분</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="flex items-center justify-between gap-4">
              <span>예상 결제 금액</span>
              <span className="font-semibold text-slate-900">{grossAmountKrw.toLocaleString('ko-KR')}원</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-4 text-xs text-slate-500">
              <span>플랫폼 수수료</span>
              <span>5% ({feeAmountKrw.toLocaleString('ko-KR')}원)</span>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-900" htmlFor="lesson-message">
              요청 메시지
            </label>
            <Textarea
              id="lesson-message"
              value={requestedMessage}
              onChange={(event) => setRequestedMessage(event.target.value)}
              maxLength={1000}
              placeholder="원하는 수업 목표나 현재 상황을 적어 주세요."
            />
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {!canRequest ? <p className="text-sm text-amber-700">튜터가 아직 유료 수업 설정을 완료하지 않았습니다.</p> : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="cta"
            disabled={submitting || !canRequest || !subject || !startsAt}
            onClick={() => void handleSubmit()}
          >
            {submitting ? '요청 중...' : '수업 요청 보내기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
