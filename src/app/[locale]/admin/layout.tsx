import { requireAdmin } from '@/lib/auth-utils'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  return <div className="admin-layout">{children}</div>
}
