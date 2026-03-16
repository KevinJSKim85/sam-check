import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }
  return session
}

export async function requireRole(role: string) {
  const session = await requireAuth()
  if (session.user.role !== role) {
    redirect('/')
  }
  return session
}

export async function requireAdmin() {
  return requireRole('ADMIN')
}

export async function getCurrentUser() {
  const session = await auth()
  return session?.user || null
}

export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  return user?.role === 'ADMIN'
}
