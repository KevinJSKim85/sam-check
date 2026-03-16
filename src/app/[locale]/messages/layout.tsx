import { requireAuth } from '@/lib/auth-utils'

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  return <>{children}</>
}
