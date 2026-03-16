import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { tutorProfileSchema } from '@/schemas'

export async function GET() {
  try {
    const session = await requireAuth()

    const [user, tutorProfile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, role: true },
      }),
      prisma.tutorProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          credentials: {
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
    ])

    return NextResponse.json({ user, tutorProfile })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch tutor profile',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAuth()
    const body = (await request.json()) as unknown
    const validationResult = tutorProfileSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: validationResult.error.issues[0]?.message ?? 'Invalid request body',
        },
        { status: 400 }
      )
    }

    const data = validationResult.data
    const fullName = `${data.firstName} ${data.lastName}`.trim()

    const profile = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          name: fullName,
          role: 'TUTOR',
        },
      })

      return tx.tutorProfile.upsert({
        where: { userId: session.user.id },
        update: {
          headline: data.headline,
          bio: data.bio,
          subjects: data.subjects,
          curricula: data.curricula,
          hourlyRate: data.hourlyRate,
          teachingMode: data.teachingMode,
          university: data.university,
          degree: data.degree,
          isPublished: data.isPublished ?? false,
        },
        create: {
          userId: session.user.id,
          headline: data.headline,
          bio: data.bio,
          subjects: data.subjects,
          curricula: data.curricula,
          hourlyRate: data.hourlyRate,
          teachingMode: data.teachingMode,
          university: data.university,
          degree: data.degree,
          isPublished: data.isPublished ?? false,
        },
      })
    })

    return NextResponse.json({ ok: true, tutorProfile: profile })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update tutor profile',
      },
      { status: 500 }
    )
  }
}
