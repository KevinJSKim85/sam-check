import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await requireAuth()

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    const threadMap = new Map<
      string,
      {
        partnerId: string
        partnerName: string | null
        partnerImage: string | null
        lastMessage: string
        lastMessageAt: string
        unreadCount: number
      }
    >()

    let unreadTotal = 0

    for (const message of messages) {
      const isSent = message.senderId === session.user.id
      const partner = isSent ? message.receiver : message.sender

      const existing = threadMap.get(partner.id)
      if (!existing) {
        threadMap.set(partner.id, {
          partnerId: partner.id,
          partnerName: partner.name,
          partnerImage: partner.image,
          lastMessage: message.content,
          lastMessageAt: message.createdAt.toISOString(),
          unreadCount: !isSent && !message.isRead ? 1 : 0,
        })
      } else if (!isSent && !message.isRead) {
        existing.unreadCount += 1
      }

      if (!isSent && !message.isRead) {
        unreadTotal += 1
      }
    }

    const threads = Array.from(threadMap.values()).sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    )

    return NextResponse.json({ threads, unreadTotal })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load threads' },
      { status: 500 }
    )
  }
}
