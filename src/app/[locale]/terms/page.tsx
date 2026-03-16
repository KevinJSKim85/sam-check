import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function TermsPage() {
  const tLegal = useTranslations('legal');

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">{tLegal('termsTitle')}</h1>
      <p className="mt-2 text-sm text-body">{tLegal('updatedAt')}</p>

      <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">1. 서비스 소개</h2>
          <p>
            쌤체크는 국제 커리큘럼 기반 학습을 위한 튜터 매칭 플랫폼으로, 튜터 인증 정보를 바탕으로 이용자가
            신뢰할 수 있는 튜터를 탐색하고 연락할 수 있도록 지원합니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">2. 이용자 의무</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>타인의 정보를 도용하거나 허위 정보를 등록해서는 안 됩니다.</li>
            <li>관련 법령 및 본 약관을 준수해야 하며 서비스 운영을 방해하는 행위를 해서는 안 됩니다.</li>
            <li>쪽지 기능을 통한 스팸, 욕설, 불법 콘텐츠 전송을 금지합니다.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">3. 인증 절차</h2>
          <p>
            튜터는 학력, 점수, 경력 관련 증빙을 제출해야 하며, 관리자는 제출된 자료를 검토하여 인증 상태를
            부여합니다. 인증 상태는 서비스 신뢰도 향상을 위한 정보로 제공됩니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">4. 인증 항목 수정 제한</h2>
          <p>
            승인 완료된 인증 항목은 이용자가 직접 수정할 수 없습니다. 수정이 필요한 경우 관리자 이메일
            help@samcheck.kr로 문의해야 합니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">5. 관리자 열람 권한</h2>
          <p>
            서비스 안전 및 분쟁 대응을 위해 관리자에게 이용자 간 메시지(쪽지) 열람 권한이 있을 수 있음을
            고지합니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">6. 면책 조항</h2>
          <p>
            쌤체크는 플랫폼 중개자로서 이용자 간 수업 계약, 수업 결과, 분쟁에 대해 직접적인 책임을 지지 않으며,
            법령에서 정한 범위를 제외하고 손해배상 책임이 제한될 수 있습니다.
          </p>
        </section>
      </div>

      <Link href="/" className="mt-10 inline-block text-sm font-medium text-primary hover:underline">
        {tLegal('backHome')}
      </Link>
    </article>
  );
}
