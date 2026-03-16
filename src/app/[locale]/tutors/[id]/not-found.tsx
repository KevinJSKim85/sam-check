import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

export default function TutorNotFoundPage() {
  const tTutor = useTranslations('tutor')

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center sm:px-6 lg:px-8">
      <p className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">404</p>
      <h1 className="text-3xl font-bold text-slate-900">{tTutor('notFoundTitle')}</h1>
      <p className="text-body">{tTutor('notFoundDescription')}</p>
      <Button variant="cta" render={<Link href="/tutors" />}>
        {tTutor('backToList')}
      </Button>
    </div>
  )
}
