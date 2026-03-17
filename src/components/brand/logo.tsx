import Image from 'next/image'
import { cn } from '@/lib/utils'

type LogoProps = {
  theme?: 'light' | 'dark'
  className?: string
}

export function Logo({ theme = 'light', className }: LogoProps) {
  const src = theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'

  return (
    <span className={cn('inline-flex shrink-0 items-center', className)}>
      <Image
        src={src}
        alt="SAM-CHECK"
        width={140}
        height={127}
        className="h-9 w-auto"
        priority
      />
    </span>
  )
}
