import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await requireAuth()

    const profile = await prisma.tutorProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        credentials: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return NextResponse.json({ credentials: profile?.credentials ?? [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch credentials' },
      { status: 500 }
    )
  }
}
