export const CURRICULA = [
  { value: 'IB', label: 'IB (International Baccalaureate)' },
  { value: 'AP', label: 'AP (Advanced Placement)' },
  { value: 'SAT', label: 'SAT' },
  { value: 'ACT', label: 'ACT' },
  { value: 'IGCSE', label: 'IGCSE' },
  { value: 'A_LEVEL', label: 'A-Level' },
  { value: 'OTHER', label: 'Other' },
] as const

export const SUBJECTS = [
  { value: 'MATH', label: { ko: '수학', en: 'Mathematics' } },
  { value: 'PHYSICS', label: { ko: '물리', en: 'Physics' } },
  { value: 'CHEMISTRY', label: { ko: '화학', en: 'Chemistry' } },
  { value: 'BIOLOGY', label: { ko: '생물', en: 'Biology' } },
  { value: 'ENGLISH', label: { ko: '영어', en: 'English' } },
  { value: 'HISTORY', label: { ko: '역사', en: 'History' } },
  { value: 'ECONOMICS', label: { ko: '경제', en: 'Economics' } },
  { value: 'COMPUTER_SCIENCE', label: { ko: '컴퓨터 과학', en: 'Computer Science' } },
  { value: 'ESSAY', label: { ko: '에세이/논술', en: 'Essay Writing' } },
  { value: 'FOREIGN_LANGUAGE', label: { ko: '외국어', en: 'Foreign Language' } },
  { value: 'OTHER', label: { ko: '기타', en: 'Other' } },
] as const

export const LANGUAGE_TESTS = [
  { value: 'TOEFL', label: 'TOEFL' },
  { value: 'IELTS', label: 'IELTS' },
  { value: 'DELF', label: 'DELF/DALF' },
  { value: 'HSK', label: 'HSK' },
  { value: 'JPT', label: 'JPT/JLPT' },
  { value: 'NLE', label: 'NLE (National Latin Exam)' },
  { value: 'TOEIC', label: 'TOEIC' },
  { value: 'OTHER', label: 'Other' },
] as const

export const CREDENTIAL_TYPE_LABELS: Record<string, { ko: string; en: string }> = {
  SAT: { ko: 'SAT', en: 'SAT' },
  ACT: { ko: 'ACT', en: 'ACT' },
  AP: { ko: 'AP', en: 'AP' },
  IB: { ko: 'IB', en: 'IB' },
  LANGUAGE_TEST: { ko: '공인 어학 시험', en: 'Language Test' },
  SCHOOL_CERT: { ko: '학교 증명서', en: 'School Certificate' },
  EXPERIENCE: { ko: '경력/이력', en: 'Experience' },
}

export const VERIFICATION_STATUS_LABELS: Record<string, { ko: string; en: string }> = {
  PENDING: { ko: '검토 중', en: 'Pending Review' },
  UNDER_REVIEW: { ko: '심사 중', en: 'Under Review' },
  APPROVED: { ko: '인증됨', en: 'Verified' },
  REJECTED: { ko: '반려됨', en: 'Rejected' },
}

export const TEACHING_MODE_LABELS: Record<string, { ko: string; en: string }> = {
  ONLINE: { ko: '온라인', en: 'Online' },
  OFFLINE: { ko: '대면', en: 'In-person' },
  BOTH: { ko: '온라인/대면', en: 'Online & In-person' },
}
