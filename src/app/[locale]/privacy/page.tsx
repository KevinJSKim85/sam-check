import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function PrivacyPolicyPage() {
  const tLegal = useTranslations('legal');

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">{tLegal('privacyTitle')}</h1>
      <p className="mt-2 text-sm text-body">{tLegal('updatedAt')}</p>

      <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">{tLegal('privacy.section1Title')}</h2>
          <p>{tLegal('privacy.section1Body')}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">{tLegal('privacy.section2Title')}</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>{tLegal('privacy.section2Item1')}</li>
            <li>{tLegal('privacy.section2Item2')}</li>
            <li>{tLegal('privacy.section2Item3')}</li>
          </ul>
          <p>{tLegal('privacy.section2Body')}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">{tLegal('privacy.section3Title')}</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>{tLegal('privacy.section3Item1')}</li>
            <li>{tLegal('privacy.section3Item2')}</li>
            <li>{tLegal('privacy.section3Item3')}</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">{tLegal('privacy.section4Title')}</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>{tLegal('privacy.section4Item1')}</li>
            <li>{tLegal('privacy.section4Item2')}</li>
            <li>{tLegal('privacy.section4Item3')}</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">{tLegal('privacy.section5Title')}</h2>
          <p>{tLegal('privacy.section5Body')}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">{tLegal('privacy.section6Title')}</h2>
          <p>{tLegal('privacy.section6Body')}</p>
        </section>
      </div>

      <Link href="/" className="mt-10 inline-block text-sm font-medium text-primary hover:underline">
        {tLegal('backHome')}
      </Link>
    </article>
  );
}
