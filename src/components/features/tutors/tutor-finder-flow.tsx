'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ChevronLeft, GraduationCap, Users, UserCheck, Check } from 'lucide-react';

type UserMode = 'student' | 'parent';
type Step = 'role' | 'grade' | 'schoolType' | 'subjects' | 'level';

const GRADES = [
  { id: 'g1-3', label: { ko: 'G1-G3 (Y2-Y4)', en: 'G1-G3 (Y2-Y4)' }, desc: { ko: '초등 저학년', en: 'Lower Elementary' } },
  { id: 'g4-6', label: { ko: 'G4-G6 (Y5-Y7)', en: 'G4-G6 (Y5-Y7)' }, desc: { ko: '초등 고학년', en: 'Upper Elementary' } },
  { id: 'g7-9', label: { ko: 'G7-G9 (Y8-Y10)', en: 'G7-G9 (Y8-Y10)' }, desc: { ko: '중학교', en: 'Middle School' } },
  { id: 'g10-12', label: { ko: 'G10-G12 (Y11-Y13)', en: 'G10-G12 (Y11-Y13)' }, desc: { ko: '고등학교', en: 'High School' } },
];

const SCHOOL_TYPES = [
  { id: 'us', label: { ko: '미국식 커리큘럼', en: 'American Curriculum' } },
  { id: 'canada', label: { ko: '캐나다', en: 'Canadian Curriculum' } },
  { id: 'uk', label: { ko: '영국식', en: 'British Curriculum' } },
  { id: 'other', label: { ko: '기타 (일반고, 과학고, 특목고 등)', en: 'Other (General, Science, Special Purpose HS)' } },
];

const SUBJECT_OPTIONS = [
  { id: 'MATH', label: { ko: '수학', en: 'Math' }, icon: '📐' },
  { id: 'ENGLISH', label: { ko: '영어', en: 'English' }, icon: '📝' },
  { id: 'PHYSICS', label: { ko: '물리', en: 'Physics' }, icon: '⚛️' },
  { id: 'CHEMISTRY', label: { ko: '화학', en: 'Chemistry' }, icon: '🧪' },
  { id: 'BIOLOGY', label: { ko: '생물', en: 'Biology' }, icon: '🧬' },
  { id: 'HISTORY', label: { ko: '역사', en: 'History' }, icon: '📜' },
  { id: 'ECONOMICS', label: { ko: '경제', en: 'Economics' }, icon: '📊' },
  { id: 'COMPUTER_SCIENCE', label: { ko: 'CS', en: 'CS' }, icon: '💻' },
  { id: 'ESSAY', label: { ko: '에세이', en: 'Essay' }, icon: '✍️' },
  { id: 'FOREIGN_LANGUAGE', label: { ko: '외국어', en: 'Foreign Lang.' }, icon: '🌍' },
  { id: 'OTHER', label: { ko: '기타', en: 'Other' }, icon: '📚' },
];

const LEVEL_OPTIONS: Record<string, Array<{ id: string; label: string }>> = {
  us: [
    { id: 'IB', label: 'IB' },
    { id: 'AP', label: 'AP' },
    { id: 'SAT', label: 'SAT' },
    { id: 'ACT', label: 'ACT' },
  ],
  canada: [
    { id: 'OTHER', label: 'Provincial Exam' },
  ],
  uk: [
    { id: 'IGCSE', label: 'GCSE / IGCSE' },
    { id: 'A_LEVEL', label: 'A-Level' },
  ],
  other: [
    { id: 'OTHER', label: { ko: '내신 / 수능 / 기타', en: 'School Exam / Other' } as unknown as string },
  ],
};

function t(obj: { ko: string; en: string }, locale: string): string {
  return locale === 'ko' ? obj.ko : obj.en;
}

export function TutorFinderFlow() {
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState<Step>('role');
  const [mode, setMode] = useState<UserMode | null>(null);
  const [grade, setGrade] = useState<string | null>(null);
  const [schoolType, setSchoolType] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const steps: Step[] = ['role', 'grade', 'schoolType', 'subjects', 'level'];
  const currentIndex = steps.indexOf(step);
  const progressSteps = steps.length - 1; // exclude 'role'

  const goNext = useCallback((nextStep: Step) => {
    setDirection('forward');
    setTimeout(() => setStep(nextStep), 0);
  }, []);

  const goBack = useCallback(() => {
    setDirection('back');
    const prevIndex = Math.max(0, currentIndex - 1);
    const allSteps: Step[] = ['role', 'grade', 'schoolType', 'subjects', 'level'];
    setTimeout(() => setStep(allSteps[prevIndex]), 0);
  }, [currentIndex]);

  const handleRoleSelect = (role: 'teacher' | 'student' | 'parent') => {
    if (role === 'teacher') {
      router.push(`/${locale}/auth/login`);
      return;
    }
    setMode(role as UserMode);
    goNext('grade');
  };

  const handleGradeSelect = (gradeId: string) => {
    setGrade(gradeId);
    goNext('schoolType');
  };

  const handleSchoolTypeSelect = (typeId: string) => {
    setSchoolType(typeId);
    goNext('subjects');
  };

  const toggleSubject = (subjectId: string) => {
    setSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(s => s !== subjectId)
        : [...prev, subjectId]
    );
  };

  const toggleLevel = (levelId: string) => {
    setLevels(prev =>
      prev.includes(levelId)
        ? prev.filter(l => l !== levelId)
        : [...prev, levelId]
    );
  };

  const handleFinish = () => {
    const params = new URLSearchParams();
    if (subjects.length) params.set('subjects', subjects.join(','));
    if (levels.length) params.set('curricula', levels.join(','));
    params.set('fromFinder', '1');
    router.push(`/${locale}/tutors?${params.toString()}`);
  };

  const handleReset = () => {
    setStep('role');
    setMode(null);
    setGrade(null);
    setSchoolType(null);
    setSubjects([]);
    setLevels([]);
    setDirection('back');
  };

  const questionPrefix = mode === 'parent'
    ? (locale === 'ko' ? '자녀의' : "your child's")
    : (locale === 'ko' ? '당신의' : 'your');

  const slideClass = direction === 'forward'
    ? 'animate-slide-in-right'
    : 'animate-slide-in-left';

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-8">
      {/* Progress Bar */}
      {step !== 'role' && (
        <div className="mb-8 w-full max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-body hover:text-primary transition-colors"
            >
              <ChevronLeft className="size-4" />
              {locale === 'ko' ? '이전' : 'Back'}
            </button>
            {mode && (
              <button
                type="button"
                onClick={() => setMode(mode === 'student' ? 'parent' : 'student')}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {mode === 'student'
                  ? (locale === 'ko' ? '학생 모드' : 'Student Mode')
                  : (locale === 'ko' ? '학부모 모드' : 'Parent Mode')}
              </button>
            )}
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${((currentIndex) / progressSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Content */}
      <div key={step} className={`w-full max-w-3xl ${slideClass}`}>
        {/* Step 0: Role Selection */}
        {step === 'role' && (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold text-primary sm:text-4xl">
              {locale === 'ko' ? '어떤 도움이 필요하신가요?' : 'How can we help you?'}
            </h1>
            <p className="text-body">
              {locale === 'ko' ? '역할을 선택해 주세요' : 'Select your role to get started'}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  role: 'teacher' as const,
                  icon: <UserCheck className="size-10 text-accent" />,
                  title: { ko: '선생님', en: 'Teacher' },
                  desc: { ko: '프로필을 등록하고,\n학생을 만날 수 있어요', en: 'Register your profile\nand meet students' },
                },
                {
                  role: 'student' as const,
                  icon: <GraduationCap className="size-10 text-accent" />,
                  title: { ko: '학생', en: 'Student' },
                  desc: { ko: '선생님을 찾고,\n수업을 받을 수 있어요', en: 'Find tutors and\nstart learning' },
                },
                {
                  role: 'parent' as const,
                  icon: <Users className="size-10 text-accent" />,
                  title: { ko: '학부모', en: 'Parent' },
                  desc: { ko: '자녀의 선생님을\n찾아보세요', en: "Find the right tutor\nfor your child" },
                },
              ].map(({ role, icon, title, desc }) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-8 transition-all duration-200 hover:border-primary hover:shadow-lg"
                >
                  <div className="rounded-full bg-accent/10 p-4 transition-colors group-hover:bg-accent/20">
                    {icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{t(title, locale)}</h3>
                  <p className="whitespace-pre-line text-sm text-body">{t(desc, locale)}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Grade Level */}
        {step === 'grade' && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-primary sm:text-3xl">
              {locale === 'ko'
                ? `${questionPrefix} 학년을 선택해 주세요`
                : `Select ${questionPrefix} grade level`}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {GRADES.map(g => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => handleGradeSelect(g.id)}
                  className="group flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white p-6 transition-all duration-200 hover:border-primary hover:shadow-lg"
                >
                  <span className="text-lg font-bold text-slate-900">{t(g.label, locale)}</span>
                  <span className="text-sm text-body">{t(g.desc, locale)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: School Type */}
        {step === 'schoolType' && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-primary sm:text-3xl">
              {locale === 'ko'
                ? (mode === 'parent' ? '자녀가 어떤 학교에 다니나요?' : '어떤 학교에 다니시나요?')
                : (mode === 'parent' ? "What school does your child attend?" : 'What type of school do you attend?')}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SCHOOL_TYPES.map(s => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => handleSchoolTypeSelect(s.id)}
                  className="rounded-xl border-2 border-slate-200 bg-white px-6 py-4 text-left font-medium text-slate-900 transition-all duration-200 hover:border-primary hover:shadow-md"
                >
                  {t(s.label, locale)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Subjects (multi-select) */}
        {step === 'subjects' && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-primary sm:text-3xl">
              {locale === 'ko'
                ? (mode === 'parent' ? '자녀가 어떤 과목을 배우면 좋겠나요?' : '어떤 과목을 배우고 싶으세요?')
                : (mode === 'parent' ? 'What subjects should your child learn?' : 'What subjects do you want to learn?')}
            </h2>
            <p className="text-sm text-body">
              {locale === 'ko' ? '여러 개 선택 가능합니다' : 'You can select multiple'}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {SUBJECT_OPTIONS.map(s => {
                const selected = subjects.includes(s.id);
                return (
                    <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleSubject(s.id)}
                    className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${
                      selected
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-slate-200 bg-white hover:border-primary/50 hover:shadow-sm'
                    }`}
                  >
                    {selected && (
                      <div className="absolute right-2 top-2 rounded-full bg-primary p-0.5">
                        <Check className="size-3 text-white" />
                      </div>
                    )}
                    <span className="text-2xl">{s.icon}</span>
                    <span className="text-sm font-medium text-slate-900">{t(s.label, locale)}</span>
                  </button>
                );
              })}
            </div>
            <Button
              variant="cta"
              size="lg"
              onClick={() => goNext('level')}
              disabled={subjects.length === 0}
              className="mt-4 min-w-[200px]"
            >
              {locale === 'ko' ? '다음' : 'Next'}
            </Button>
          </div>
        )}

        {/* Step 4: Level/Exam (dynamic) */}
        {step === 'level' && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-primary sm:text-3xl">
              {locale === 'ko' ? '수준이나 시험을 선택해 주세요' : 'Select your level or exam'}
            </h2>
            <p className="text-sm text-body">
              {locale === 'ko' ? '여러 개 선택 가능합니다' : 'You can select multiple'}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {(LEVEL_OPTIONS[schoolType || 'us'] || LEVEL_OPTIONS.us).map(l => {
                const selected = levels.includes(l.id);
                const labelText = typeof l.label === 'object' ? t(l.label as { ko: string; en: string }, locale) : l.label;
                return (
                  <button
                    type="button"
                    key={l.id}
                    onClick={() => toggleLevel(l.id)}
                    className={`relative rounded-xl border-2 px-6 py-4 font-medium transition-all duration-200 ${
                      selected
                        ? 'border-primary bg-primary/5 text-primary shadow-md'
                        : 'border-slate-200 bg-white text-slate-900 hover:border-primary/50 hover:shadow-sm'
                    }`}
                  >
                    {selected && (
                      <div className="absolute right-2 top-2 rounded-full bg-primary p-0.5">
                        <Check className="size-3 text-white" />
                      </div>
                    )}
                    {labelText}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleFinish}
                className="min-w-[140px]"
              >
                {locale === 'ko' ? '건너뛰기' : 'Skip'}
              </Button>
              <Button
                variant="cta"
                size="lg"
                onClick={handleFinish}
                disabled={levels.length === 0}
                className="min-w-[200px]"
              >
                {locale === 'ko' ? '튜터 찾기' : 'Find Tutors'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
