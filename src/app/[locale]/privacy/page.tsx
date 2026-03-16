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
          <h2 className="text-lg font-semibold text-slate-900">1. 수집 목적</h2>
          <p>
            쌤체크는 회원 식별, 튜터 인증, 서비스 제공 및 운영, 고객 문의 응대를 위해 개인정보를 수집·이용합니다.
            수집 목적 범위를 벗어난 이용은 하지 않습니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">2. 수집 항목</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>공통: 이름, 이메일, 프로필 이미지, 로그인 제공자 정보</li>
            <li>튜터 인증: 학력/점수/경력 증빙 자료, 검증 관련 메모</li>
            <li>서비스 이용 과정: 접속 로그, 기기/브라우저 정보, 메시지 발송 기록</li>
          </ul>
          <p>쌤체크는 주민등록번호를 수집하지 않습니다.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">3. 보유 및 이용 기간</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>회원정보: 회원 탈퇴 후 30일 이내 파기</li>
            <li>인증 자료: 인증 목적 달성 또는 회원 탈퇴 후 90일 이내 파기</li>
            <li>관계 법령에 따른 보관 필요 시 해당 기간 동안 별도 보관</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">4. 개인정보 처리 위탁 업체</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Supabase: 파일 저장 및 데이터 처리</li>
            <li>Vercel: 서비스 호스팅 및 배포</li>
            <li>Naver, Kakao, Google: 소셜 로그인 인증 처리</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">5. 이용자 권리</h2>
          <p>
            이용자는 언제든지 개인정보 열람, 정정, 삭제, 처리정지를 요청할 수 있으며, 쌤체크는 관련 법령에 따라
            지체 없이 처리합니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">6. 개인정보 보호책임자(CPO)</h2>
          <p>이메일: privacy@samcheck.kr</p>
        </section>
      </div>

      <Link href="/" className="mt-10 inline-block text-sm font-medium text-primary hover:underline">
        {tLegal('backHome')}
      </Link>
    </article>
  );
}
