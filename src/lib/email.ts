type VerificationEmailParams = {
  email: string
  verifyUrl: string
  locale: string
}

function getFromEmail() {
  return process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || 'Sam-Check <onboarding@resend.dev>'
}

function getResendApiKey() {
  return process.env.RESEND_API_KEY || ''
}

function getVerificationEmailSubject(locale: string) {
  return locale === 'en' ? 'Verify your Sam-Check account' : '쌤체크 이메일 인증을 완료해주세요'
}

function getVerificationEmailHtml({ verifyUrl, locale }: VerificationEmailParams) {
  if (locale === 'en') {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2>Verify your Sam-Check account</h2>
        <p>Thanks for joining Sam-Check. Click the button below to verify your email and activate your account.</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="display: inline-block; background: #312e81; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 10px; font-weight: 600;">Verify email</a>
        </p>
        <p>If the button does not work, open this link directly:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      </div>
    `
  }

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2>쌤체크 이메일 인증</h2>
      <p>쌤체크 가입을 완료하려면 아래 버튼을 눌러 이메일 인증을 진행해주세요.</p>
      <p style="margin: 24px 0;">
        <a href="${verifyUrl}" style="display: inline-block; background: #312e81; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 10px; font-weight: 600;">이메일 인증하기</a>
      </p>
      <p>버튼이 동작하지 않으면 아래 링크를 직접 열어주세요.</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    </div>
  `
}

export async function sendVerificationEmail(params: VerificationEmailParams) {
  const apiKey = getResendApiKey()

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: getFromEmail(),
      to: [params.email],
      subject: getVerificationEmailSubject(params.locale),
      html: getVerificationEmailHtml(params),
    }),
  })

  if (!response.ok) {
    const payload = (await response.text()) || 'Unknown email provider error'
    throw new Error(`Failed to send verification email: ${payload}`)
  }
}
