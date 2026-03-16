import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await requireAuth()
    const { userId } = await params

    const result = await prisma.message.updateMany({
      where: {
        senderId: userId,
        receiverId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({ updatedCount: result.count })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}
