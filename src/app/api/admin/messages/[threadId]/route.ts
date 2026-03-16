import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

type RouteContext = {
  params: Promise<{
    threadId: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin()

    const { threadId } = await context.params
    const ids = threadId.split('_')

    if (ids.length !== 2 || !ids[0] || !ids[1]) {
      return NextResponse.json({ error: 'Invalid threadId' }, { status: 400 })
    }

    const sortedUserIds = [ids[0], ids[1]].sort()
    const normalizedThreadId = `${sortedUserIds[0]}_${sortedUserIds[1]}`

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: sortedUserIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    })

    if (users.length !== 2) {
      return NextResponse.json({ error: 'Conversation participants not found' }, { status: 404 })
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: sortedUserIds[0],
            receiverId: sortedUserIds[1],
          },
          {
            senderId: sortedUserIds[1],
            receiverId: sortedUserIds[0],
          },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        content: true,
        createdAt: true,
        isRead: true,
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      threadId: normalizedThreadId,
      participants: users,
      messages: messages.map((message) => ({
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        senderName: message.sender.name,
        receiverName: message.receiver.name,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load conversation thread' },
      { status: 500 }
    )
  }
}
