type IconPaths = React.ReactNode

const icons: Record<string, IconPaths> = {
  MATH: (
    <>
      <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M17 2l-5 5-5-5" /><path d="M2 17l5-5 5 5" />
    </>
  ),
  PHYSICS: (
    <>
      <circle cx="12" cy="12" r="3" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </>
  ),
  CHEMISTRY: (
    <>
      <path d="M9 3h6v7l4 8a2 2 0 0 1-1.8 2.8H6.8A2 2 0 0 1 5 18l4-8V3z" />
      <line x1="9" y1="3" x2="15" y2="3" />
      <path d="M8 16h8" />
    </>
  ),
  BIOLOGY: (
    <>
      <path d="M12 22c-4-3-8-6-8-11a8 8 0 0 1 16 0c0 5-4 8-8 11z" />
      <path d="M12 11V2" /><path d="M8 7l4 4 4-4" />
    </>
  ),
  ENGLISH: (
    <>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 7h6" /><path d="M8 11h8" />
    </>
  ),
  HISTORY: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  ECONOMICS: (
    <>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </>
  ),
  COMPUTER_SCIENCE: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </>
  ),
  ESSAY: (
    <>
      <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  FOREIGN_LANGUAGE: (
    <>
      <path d="M5 8l6 6" /><path d="M4 14l6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" />
      <path d="M22 22l-5-10-5 10" /><path d="M14 18h6" />
    </>
  ),
  OTHER: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
}

export function SubjectIcon({ subject, className }: { subject: string; className?: string }) {
  const paths = icons[subject] ?? icons.OTHER
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths}
    </svg>
  )
}
