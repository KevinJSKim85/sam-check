import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

type ThreadItem = {
  threadId: string
  userA: {
    id: string
    name: string | null
  }
  userB: {
    id: string
    name: string | null
  }
  lastMessage: {
    content: string
    createdAt: string
    senderId: string
  }
}

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim().toLowerCase() ?? ''

    const messages = await prisma.message.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        content: true,
        createdAt: true,
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

    const threadMap = new Map<string, ThreadItem>()

    for (const item of messages) {
      const sortedUserIds = [item.senderId, item.receiverId].sort()
      const threadId = `${sortedUserIds[0]}_${sortedUserIds[1]}`

      if (threadMap.has(threadId)) {
        continue
      }

      const userA =
        sortedUserIds[0] === item.sender.id
          ? { id: item.sender.id, name: item.sender.name }
          : { id: item.receiver.id, name: item.receiver.name }
      const userB =
        sortedUserIds[1] === item.receiver.id
          ? { id: item.receiver.id, name: item.receiver.name }
          : { id: item.sender.id, name: item.sender.name }

      if (query.length > 0) {
        const candidate = `${userA.name ?? ''} ${userB.name ?? ''}`.toLowerCase()
        if (!candidate.includes(query)) {
          continue
        }
      }

      threadMap.set(threadId, {
        threadId,
        userA,
        userB,
        lastMessage: {
          content: item.content,
          createdAt: item.createdAt.toISOString(),
          senderId: item.senderId,
        },
      })
    }

    return NextResponse.json({
      threads: Array.from(threadMap.values()),
      totalThreads: threadMap.size,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load admin message threads' },
      { status: 500 }
    )
  }
}
