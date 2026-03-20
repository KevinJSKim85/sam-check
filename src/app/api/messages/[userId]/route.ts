import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await requireAuth()
    const { userId } = await params

    const partner = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        tutorProfile: {
          select: {
            id: true,
            isPublished: true,
            hourlyRate: true,
            subjects: true,
          },
        },
      },
    })

    if (!partner) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: userId },
          { senderId: userId, receiverId: session.user.id },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        senderId: true,
        content: true,
        isRead: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      partner: {
        id: partner.id,
        name: partner.name,
        image: partner.image,
        tutorProfileId: partner.tutorProfile?.isPublished ? partner.tutorProfile.id : null,
        hourlyRate: partner.tutorProfile?.isPublished ? partner.tutorProfile.hourlyRate : null,
        subjects: partner.tutorProfile?.isPublished ? partner.tutorProfile.subjects : [],
      },
      messages: messages.map((message) => ({
        ...message,
        createdAt: message.createdAt.toISOString(),
      })),
      currentUserId: session.user.id,
      currentUserRole: session.user.role,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load messages' },
      { status: 500 }
    )
  }
}
