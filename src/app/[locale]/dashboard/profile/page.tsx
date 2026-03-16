'use client'

import { useLocale, useTranslations } from 'next-intl'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { Textarea } from '@/components/ui/textarea'
import { CURRICULA, SUBJECTS } from '@/lib/constants'
import { formatKrw } from '@/lib/format'
import { tutorProfileSchema } from '@/schemas'

type UniversityEntry = {
  id: string
  status: 'ENROLLED' | 'GRADUATED'
  enrollmentYear: number
  schoolName: string
  major: string
  isPrimary: boolean
}

type ProfileResponse = {
  user: {
    name: string | null
  }
  tutorProfile: {
    headline: string | null
    bio: string | null
    highSchool?: string | null
    activities?: string | null
    subjects: string[]
    curricula: string[]
    hourlyRate: number | null
    teachingMode: 'ONLINE' | 'OFFLINE' | 'BOTH'
    university: string | null
    degree: string | null
    isPublished: boolean
    universities?: Array<Omit<UniversityEntry, 'id'>>
  } | null
}

function splitName(name: string | null) {
  if (!name) {
    return { firstName: '', lastName: '' }
  }

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.at(-1) ?? '',
  }
}

function createUniversityEntry(isPrimary = false): UniversityEntry {
  return {
    id: crypto.randomUUID(),
    status: 'ENROLLED',
    enrollmentYear: new Date().getFullYear(),
    schoolName: '',
    major: '',
    isPrimary,
  }
}

export default function TutorProfilePage() {
  const tCommon = useTranslations('common')
  const tTutor = useTranslations('tutor')
  const tDashboard = useTranslations('dashboard')
  const tErrors = useTranslations('errors')
  const locale = useLocale()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [highSchool, setHighSchool] = useState('')
  const [activities, setActivities] = useState('')
  const [universities, setUniversities] = useState<UniversityEntry[]>([createUniversityEntry(true)])
  const [subjects, setSubjects] = useState<string[]>([])
  const [curricula, setCurricula] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState('50000')
  const [teachingMode, setTeachingMode] = useState<'ONLINE' | 'OFFLINE' | 'BOTH'>('BOTH')
  const [isPublished, setIsPublished] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      try {
        const response = await fetch('/api/tutors/me')
        if (!response.ok) {
          throw new Error(tErrors('failedLoadProfile'))
        }

        const data = (await response.json()) as ProfileResponse
        if (!mounted) {
          return
        }

        const names = splitName(data.user.name)
        setFirstName(names.firstName)
        setLastName(names.lastName)

        const profile = data.tutorProfile
        if (!profile) {
          setLoading(false)
          return
        }

        setHeadline(profile.headline ?? '')
        setBio(profile.bio ?? '')
        setHighSchool(profile.highSchool ?? '')
        setActivities(profile.activities ?? '')
        setSubjects(profile.subjects)
        setCurricula(profile.curricula)
        setHourlyRate(profile.hourlyRate ? String(profile.hourlyRate) : '50000')
        setTeachingMode(profile.teachingMode)
        setIsPublished(profile.isPublished)

        if (profile.universities && profile.universities.length > 0) {
          setUniversities(
            profile.universities.slice(0, 3).map((item) => ({
              ...item,
              id: crypto.randomUUID(),
            }))
          )
        } else if (profile.university || profile.degree) {
          setUniversities([
            {
              ...createUniversityEntry(true),
              schoolName: profile.university ?? '',
              major: profile.degree ?? '',
            },
          ])
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : tErrors('failedLoadProfile'))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      mounted = false
    }
  }, [tErrors])

  const parsedHourlyRate = useMemo(() => {
    const value = Number(hourlyRate)
    return Number.isFinite(value) ? value : 0
  }, [hourlyRate])

  const toggleSubject = (value: string) => {
    setSubjects((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    )
  }

  const toggleCurriculum = (value: string) => {
    setCurricula((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    )
  }

  const setPrimaryUniversity = (index: number) => {
    setUniversities((prev) => prev.map((item, idx) => ({ ...item, isPrimary: idx === index })))
  }

  const updateUniversity = <K extends keyof UniversityEntry>(index: number, key: K, value: UniversityEntry[K]) => {
    setUniversities((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    )
  }

  const addUniversity = () => {
    setUniversities((prev) => {
      if (prev.length >= 3) {
        return prev
      }

      return [...prev, createUniversityEntry(prev.length === 0)]
    })
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const cleanedUniversities = universities
      .map((item) => ({
        status: item.status,
        enrollmentYear: item.enrollmentYear,
        schoolName: item.schoolName.trim(),
        major: item.major.trim(),
        isPrimary: item.isPrimary,
      }))
      .filter((item) => item.schoolName && item.major)

    const primary =
      cleanedUniversities.find((item) => item.isPrimary) ?? cleanedUniversities[0]

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      headline: headline.trim(),
      bio: bio.trim(),
      highSchool: highSchool.trim(),
      universities: cleanedUniversities,
      activities: activities.trim(),
      subjects,
      curricula,
      hourlyRate: parsedHourlyRate,
      teachingMode,
      university: primary?.schoolName,
      degree: primary?.major,
      isPublished,
    }

    const validationResult = tutorProfileSchema.safeParse(payload)
    if (!validationResult.success) {
      setError(validationResult.error.issues[0]?.message ?? tErrors('checkInput'))
      setSaving(false)
      return
    }

    try {
      const response = await fetch('/api/tutors/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? tErrors('failedSave'))
      }

      setSuccess(tDashboard('saveSuccess'))
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : tErrors('failedSave'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <LoadingSkeleton variant="profile" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Card className="border-primary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{tDashboard('profilePageTitle')}</CardTitle>
          <p className="text-sm text-body">{tDashboard('profilePageSubtitle')}</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={onSubmit}>
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 text-sm">
                <label className="font-medium text-slate-900" htmlFor="first-name">{tDashboard('firstName')} *</label>
                <Input id="first-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
              </div>
              <div className="space-y-1 text-sm">
                <label className="font-medium text-slate-900" htmlFor="last-name">{tDashboard('lastName')} *</label>
                <Input id="last-name" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-1 text-sm">
                <label className="font-medium text-slate-900" htmlFor="headline">{tDashboard('headline')}</label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                  maxLength={100}
                  placeholder={tDashboard('headlinePlaceholder')}
                />
                <span className="text-xs text-muted-foreground">{headline.length}/100</span>
              </div>
              <div className="space-y-1 text-sm">
                <label className="font-medium text-slate-900" htmlFor="bio">{tDashboard('bio')}</label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  maxLength={2000}
                  rows={8}
                  placeholder={tDashboard('bioPlaceholder')}
                />
                <span className="text-xs text-muted-foreground">{bio.length}/2000</span>
              </div>
            </section>

            <section className="space-y-4 rounded-xl border border-slate-200 p-4">
              <h2 className="text-base font-semibold text-slate-900">{tDashboard('education')}</h2>
              <div className="space-y-1 text-sm">
                <label className="font-medium text-slate-900" htmlFor="high-school">{tDashboard('highSchool')}</label>
                <Input
                  id="high-school"
                  value={highSchool}
                  onChange={(event) => setHighSchool(event.target.value)}
                  placeholder={tDashboard('highSchoolPlaceholder')}
                />
              </div>

              {universities.map((entry, index) => (
                <div key={entry.id} className="space-y-3 rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap gap-3 text-sm">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name={`status-${index}`}
                        checked={entry.status === 'ENROLLED'}
                        onChange={() => updateUniversity(index, 'status', 'ENROLLED')}
                      />
                      {tDashboard('enrolled')}
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name={`status-${index}`}
                        checked={entry.status === 'GRADUATED'}
                        onChange={() => updateUniversity(index, 'status', 'GRADUATED')}
                      />
                      {tDashboard('graduated')}
                    </label>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1 text-sm">
                      <label className="font-medium text-slate-900" htmlFor={`enrollment-year-${entry.id}`}>{tDashboard('enrollmentYear')}</label>
                      <Input
                        id={`enrollment-year-${entry.id}`}
                        type="number"
                        value={entry.enrollmentYear}
                        onChange={(event) => updateUniversity(index, 'enrollmentYear', Number(event.target.value))}
                      />
                    </div>
                    <div className="space-y-1 text-sm">
                      <label className="font-medium text-slate-900" htmlFor={`school-name-${entry.id}`}>{tDashboard('schoolName')}</label>
                      <Input
                        id={`school-name-${entry.id}`}
                        value={entry.schoolName}
                        onChange={(event) => updateUniversity(index, 'schoolName', event.target.value)}
                      />
                    </div>
                    <div className="space-y-1 text-sm sm:col-span-2">
                      <label className="font-medium text-slate-900" htmlFor={`major-${entry.id}`}>{tDashboard('major')}</label>
                      <Input
                        id={`major-${entry.id}`}
                        value={entry.major}
                        onChange={(event) => updateUniversity(index, 'major', event.target.value)}
                      />
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm text-body">
                    <input
                      type="checkbox"
                      checked={entry.isPrimary}
                      onChange={() => setPrimaryUniversity(index)}
                    />
                    {tDashboard('setPrimaryEducation')}
                  </label>
                </div>
              ))}

              <Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto" onClick={addUniversity} disabled={universities.length >= 3}>
                {tDashboard('addUniversity')}
              </Button>
            </section>

            <section className="space-y-4">
              <div className="space-y-1 text-sm">
                <label className="font-medium text-slate-900" htmlFor="activities">{tDashboard('activities')}</label>
                <Textarea
                  id="activities"
                  value={activities}
                  onChange={(event) => setActivities(event.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder={tDashboard('activitiesPlaceholder')}
                />
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900">{tTutor('subjects')}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SUBJECTS.map((subject) => (
                    <label key={subject.value} className="inline-flex items-center gap-2 text-sm text-body">
                      <input
                        type="checkbox"
                        checked={subjects.includes(subject.value)}
                        onChange={() => toggleSubject(subject.value)}
                      />
                      {locale === 'ko' ? subject.label.ko : subject.label.en}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900">{tTutor('curricula')}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CURRICULA.map((item) => (
                    <label key={item.value} className="inline-flex items-center gap-2 text-sm text-body">
                      <input
                        type="checkbox"
                        checked={curricula.includes(item.value)}
                        onChange={() => toggleCurriculum(item.value)}
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 text-sm">
                <label className="font-medium text-slate-900" htmlFor="hourly-rate">{tDashboard('hourlyRateKrw')}</label>
                <Input
                  id="hourly-rate"
                  type="number"
                  min={10000}
                  max={500000}
                  value={hourlyRate}
                  onChange={(event) => setHourlyRate(event.target.value)}
                />
                <span className="text-xs text-muted-foreground">
                  {parsedHourlyRate > 0 ? formatKrw(parsedHourlyRate, locale) : formatKrw(0, locale)}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <p className="font-medium text-slate-900">{tDashboard('teachingMode')}</p>
                <div className="space-y-2 rounded-lg border border-slate-200 p-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="teaching-mode"
                      checked={teachingMode === 'ONLINE'}
                      onChange={() => setTeachingMode('ONLINE')}
                    />
                    {tTutor('online')}
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="teaching-mode"
                      checked={teachingMode === 'OFFLINE'}
                      onChange={() => setTeachingMode('OFFLINE')}
                    />
                    {tTutor('offline')}
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="teaching-mode"
                      checked={teachingMode === 'BOTH'}
                      onChange={() => setTeachingMode('BOTH')}
                    />
                    {tTutor('both')}
                  </label>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 p-4">
              <label className="inline-flex items-center gap-2 text-sm text-slate-900">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(event) => setIsPublished(event.target.checked)}
                />
                {tDashboard('publishProfile')}
              </label>
            </section>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

            <Button type="submit" variant="cta" className="min-h-11 w-full sm:w-auto" disabled={saving}>
              {saving ? tDashboard('saving') : tCommon('save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
