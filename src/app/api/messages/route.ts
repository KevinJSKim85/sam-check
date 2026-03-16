import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { messageSchema } from '@/schemas/message'

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const json = await request.json()

    const parsed = messageSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid message payload' },
        { status: 400 }
      )
    }

    if (parsed.data.receiverId === session.user.id) {
      return NextResponse.json({ error: 'You cannot message yourself' }, { status: 400 })
    }

    const receiver = await prisma.user.findUnique({
      where: {
        id: parsed.data.receiverId,
      },
      select: {
        id: true,
      },
    })

    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 })
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: parsed.data.receiverId,
        content: parsed.data.content,
      },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        content: true,
        isRead: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        message: {
          ...message,
          createdAt: message.createdAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    )
  }
}
