import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'

export default function LocalizedNotFoundPage() {
  const tErrors = useTranslations('errors')
  const tCommon = useTranslations('common')

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center sm:px-6 lg:px-8">
      <p className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">404</p>
      <h1 className="text-3xl font-bold text-slate-900">{tErrors('notFoundTitle')}</h1>
      <p className="text-body">{tErrors('notFoundDescription')}</p>
      <Button variant="cta" render={<Link href="/" />}>
        {tCommon('backHome')}
      </Button>
    </div>
  )
}
