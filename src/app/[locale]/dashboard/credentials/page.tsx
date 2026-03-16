'use client'

import { useTranslations } from 'next-intl'
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CREDENTIAL_TYPE_LABELS, LANGUAGE_TESTS } from '@/lib/constants'

type CredentialType = 'SAT' | 'ACT' | 'AP' | 'IB' | 'LANGUAGE_TEST' | 'SCHOOL_CERT' | 'EXPERIENCE'
type CredentialStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'

type CredentialItem = {
  id: string
  type: CredentialType
  label: string
  scoreValue: string | null
  description: string | null
  status: CredentialStatus
  rejectionReason: string | null
  verificationNote: string | null
  createdAt: string
}

type CredentialResponse = {
  credentials: CredentialItem[]
}

type SchoolCertType = '재학' | '졸업' | '합격'

const CREDENTIAL_TYPES: CredentialType[] = [
  'SAT',
  'ACT',
  'AP',
  'IB',
  'LANGUAGE_TEST',
  'SCHOOL_CERT',
  'EXPERIENCE',
]

function statusBadge(status: CredentialStatus) {
  if (status === 'APPROVED') {
    return <Badge className="bg-emerald-100 text-emerald-800">인증됨</Badge>
  }

  if (status === 'REJECTED') {
    return <Badge className="bg-rose-100 text-rose-800">반려됨</Badge>
  }

  return <Badge className="bg-amber-100 text-amber-800">검토 중</Badge>
}

function buildPayload(params: {
  type: CredentialType
  score: string
  apSubject: string
  ibSubject: string
  languageTestName: string
  schoolName: string
  schoolCertType: SchoolCertType
  experienceDescription: string
  periodStart: string
  periodEnd: string
}) {
  const {
    type,
    score,
    apSubject,
    ibSubject,
    languageTestName,
    schoolName,
    schoolCertType,
    experienceDescription,
    periodStart,
    periodEnd,
  } = params

  if (type === 'SAT' || type === 'ACT') {
    return {
      label: `${type} Score`,
      scoreValue: score,
      description: '',
    }
  }

  if (type === 'AP') {
    return {
      label: `AP ${apSubject}`,
      scoreValue: score,
      description: '',
    }
  }

  if (type === 'IB') {
    return {
      label: `IB ${ibSubject || 'Total'}`,
      scoreValue: score,
      description: '',
    }
  }

  if (type === 'LANGUAGE_TEST') {
    return {
      label: languageTestName,
      scoreValue: score,
      description: '',
    }
  }

  if (type === 'SCHOOL_CERT') {
    return {
      label: `${schoolName} ${schoolCertType}`,
      scoreValue: '',
      description: `${schoolName} ${schoolCertType} 증빙`,
    }
  }

  return {
    label: 'Teaching Experience',
    scoreValue: '',
    description: `${experienceDescription}\n기간: ${periodStart} ~ ${periodEnd}`,
  }
}

export default function CredentialsDashboardPage() {
  const tCredential = useTranslations('credential')

  const [credentials, setCredentials] = useState<CredentialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [resubmitId, setResubmitId] = useState<string | null>(null)

  const [type, setType] = useState<CredentialType>('SAT')
  const [score, setScore] = useState('')
  const [apSubject, setApSubject] = useState('')
  const [ibSubject, setIbSubject] = useState('')
  const [languageTestName, setLanguageTestName] = useState('TOEFL')
  const [schoolName, setSchoolName] = useState('')
  const [schoolCertType, setSchoolCertType] = useState<SchoolCertType>('재학')
  const [experienceDescription, setExperienceDescription] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [documentFile, setDocumentFile] = useState<File | null>(null)

  const isApprovedTarget = useMemo(
    () => credentials.find((item) => item.id === resubmitId)?.status === 'APPROVED',
    [credentials, resubmitId]
  )

  const loadCredentials = useCallback(async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/credentials/me')
      if (!response.ok) {
        throw new Error('인증 목록을 불러오지 못했습니다.')
      }

      const data = (await response.json()) as CredentialResponse
      setCredentials(data.credentials)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCredentials()
  }, [loadCredentials])

  const resetForm = () => {
    setType('SAT')
    setScore('')
    setApSubject('')
    setIbSubject('')
    setLanguageTestName('TOEFL')
    setSchoolName('')
    setSchoolCertType('재학')
    setExperienceDescription('')
    setPeriodStart('')
    setPeriodEnd('')
    setDocumentFile(null)
    setResubmitId(null)
  }

  const openResubmit = (credential: CredentialItem) => {
    setType(credential.type)
    setScore(credential.scoreValue ?? '')
    setResubmitId(credential.id)
    setDialogOpen(true)
    setError('')
    setMessage('')
  }

  const handleDelete = async (credential: CredentialItem) => {
    if (credential.status === 'APPROVED') {
      return
    }

    setError('')
    setMessage('')

    try {
      const response = await fetch(`/api/credentials/${credential.id}`, {
        method: 'DELETE',
      })

      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? '삭제에 실패했습니다.')
      }

      setMessage('인증 항목을 삭제했습니다.')
      await loadCredentials()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '오류가 발생했습니다.')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isApprovedTarget) {
      setError('인증된 항목은 수정할 수 없습니다.')
      return
    }

    if (!documentFile && type !== 'EXPERIENCE') {
      setError('증빙 파일을 업로드해주세요.')
      return
    }

    if (!documentFile && resubmitId) {
      setError('재제출 시 파일을 다시 업로드해주세요.')
      return
    }

    const payload = buildPayload({
      type,
      score,
      apSubject,
      ibSubject,
      languageTestName,
      schoolName,
      schoolCertType,
      experienceDescription,
      periodStart,
      periodEnd,
    })

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const formData = new FormData()
      formData.set('type', type)
      formData.set('label', payload.label)
      formData.set('scoreValue', payload.scoreValue)
      formData.set('description', payload.description)

      if (documentFile) {
        formData.set('file', documentFile)
      }

      const endpoint = resubmitId ? `/api/credentials/${resubmitId}` : '/api/credentials'
      const method = resubmitId ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        body: formData,
      })

      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(data.error ?? '저장에 실패했습니다.')
      }

      setDialogOpen(false)
      resetForm()
      setMessage(resubmitId ? '재제출이 완료되었습니다.' : '인증을 제출했습니다.')
      await loadCredentials()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="text-2xl">{tCredential('myCredentials')}</CardTitle>
            <p className="mt-1 text-sm text-body">제출한 인증 상태를 확인하고 재제출을 관리하세요.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button variant="cta" className="min-h-11 w-full sm:w-auto" />} onClick={resetForm}>
              {tCredential('addCredential')}
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{resubmitId ? '인증 재제출' : tCredential('addCredential')}</DialogTitle>
                <DialogDescription>
                  유형별 필수 정보를 입력하고 증빙 서류를 업로드하세요.
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900" htmlFor="credential-type">유형</label>
                  <select
                    id="credential-type"
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                    value={type}
                    onChange={(event) => setType(event.target.value as CredentialType)}
                  >
                    {CREDENTIAL_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {CREDENTIAL_TYPE_LABELS[item].ko}
                      </option>
                    ))}
                  </select>
                </div>

                {(type === 'SAT' || type === 'ACT') ? (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-900" htmlFor="score-number">점수</label>
                    <Input
                      id="score-number"
                      type="number"
                      value={score}
                      onChange={(event) => setScore(event.target.value)}
                    />
                  </div>
                ) : null}

                {type === 'AP' ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-900" htmlFor="ap-subject">과목</label>
                      <Input id="ap-subject" value={apSubject} onChange={(event) => setApSubject(event.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-900" htmlFor="ap-score">점수 (1-5)</label>
                      <Input id="ap-score" type="number" min={1} max={5} value={score} onChange={(event) => setScore(event.target.value)} />
                    </div>
                  </div>
                ) : null}

                {type === 'IB' ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-900" htmlFor="ib-subject">과목 (또는 Total)</label>
                      <Input id="ib-subject" value={ibSubject} onChange={(event) => setIbSubject(event.target.value)} placeholder="예: Math AA HL / Total" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-900" htmlFor="ib-score">점수 (1-7 또는 1-45)</label>
                      <Input id="ib-score" value={score} onChange={(event) => setScore(event.target.value)} />
                    </div>
                  </div>
                ) : null}

                {type === 'LANGUAGE_TEST' ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-900" htmlFor="language-test">시험명</label>
                      <select
                        id="language-test"
                        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                        value={languageTestName}
                        onChange={(event) => setLanguageTestName(event.target.value)}
                      >
                        {LANGUAGE_TESTS.filter((item) => ['TOEFL', 'DELF', 'HSK', 'JPT', 'NLE'].includes(item.value)).map((item) => (
                          <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-900" htmlFor="language-score">점수</label>
                      <Input id="language-score" value={score} onChange={(event) => setScore(event.target.value)} />
                    </div>
                  </div>
                ) : null}

                {type === 'SCHOOL_CERT' ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-sm font-medium text-slate-900" htmlFor="school-name">학교명</label>
                      <Input id="school-name" value={schoolName} onChange={(event) => setSchoolName(event.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-900" htmlFor="school-cert-type">구분</label>
                      <select
                        id="school-cert-type"
                        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                        value={schoolCertType}
                        onChange={(event) => setSchoolCertType(event.target.value as SchoolCertType)}
                      >
                        <option value="재학">재학</option>
                        <option value="졸업">졸업</option>
                        <option value="합격">합격</option>
                      </select>
                    </div>
                  </div>
                ) : null}

                {type === 'EXPERIENCE' ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-900" htmlFor="experience-description">경력 설명</label>
                      <Textarea
                        id="experience-description"
                        value={experienceDescription}
                        onChange={(event) => setExperienceDescription(event.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-900" htmlFor="period-start">시작일</label>
                        <Input id="period-start" type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-900" htmlFor="period-end">종료일</label>
                        <Input id="period-end" type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} />
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-900" htmlFor="document-file">{tCredential('uploadDocument')}</label>
                  <Input
                    id="document-file"
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)}
                  />
                  <p className="text-xs text-muted-foreground">{tCredential('fileTypes')}</p>
                  <p className="text-sm text-amber-700">⚠️ 주민등록번호가 포함된 서류는 번호를 가린 후 업로드해주세요</p>
                </div>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}

                <div className="flex flex-col justify-end gap-2 sm:flex-row">
                  <Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto" onClick={() => setDialogOpen(false)}>
                    닫기
                  </Button>
                  <Button type="submit" variant="cta" className="min-h-11 w-full sm:w-auto" disabled={saving || isApprovedTarget}>
                    {saving ? '제출 중...' : '제출'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {loading ? <p className="text-sm text-body">불러오는 중...</p> : null}

          {!loading && credentials.length === 0 ? (
            <p className="text-sm text-body">아직 제출한 인증이 없습니다.</p>
          ) : null}

          <div className="space-y-3">
            {credentials.map((credential) => (
              <div key={credential.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{credential.label}</p>
                    <p className="text-sm text-body">{CREDENTIAL_TYPE_LABELS[credential.type].ko}</p>
                  </div>
                  {statusBadge(credential.status)}
                </div>

                {credential.status === 'APPROVED' ? (
                  <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                    <p>인증된 항목은 수정할 수 없습니다. 수정이 필요한 경우 관리자에게 이메일로 문의해주세요. (help@samcheck.kr)</p>
                    {credential.verificationNote ? <p className="mt-1">검토 메모: {credential.verificationNote}</p> : null}
                  </div>
                ) : null}

                {credential.status === 'REJECTED' ? (
                  <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                    <p>반려 사유: {credential.rejectionReason ?? '사유 없음'}</p>
                  </div>
                ) : null}

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  {credential.status === 'REJECTED' ? (
                    <Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto" onClick={() => openResubmit(credential)}>
                      {tCredential('resubmit')}
                    </Button>
                  ) : null}

                  {credential.status !== 'APPROVED' ? (
                    <Button type="button" variant="destructive" className="min-h-11 w-full sm:w-auto" onClick={() => handleDelete(credential)}>
                      삭제
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {message ? <p className="mt-4 text-sm text-emerald-600">{message}</p> : null}
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}
