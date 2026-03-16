import { VerificationStatus } from '@prisma/client'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { getSignedUrl } from '@/lib/storage'

export async function GET() {
  try {
    await requireAdmin()

    const credentials = await prisma.credential.findMany({
      where: {
        status: {
          in: [VerificationStatus.PENDING, VerificationStatus.UNDER_REVIEW],
        },
      },
      include: {
        tutorProfile: {
          select: {
            id: true,
            headline: true,
            bio: true,
            subjects: true,
            curricula: true,
            university: true,
            degree: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    const rows = await Promise.all(
      credentials.map(async (credential) => {
        let documentSignedUrl: string | null = null

        if (credential.documentPath) {
          const signed = await getSignedUrl(credential.documentPath)
          if (!signed.error) {
            documentSignedUrl = signed.url
          }
        }

        return {
          id: credential.id,
          type: credential.type,
          label: credential.label,
          scoreValue: credential.scoreValue,
          description: credential.description,
          status: credential.status,
          submittedAt: credential.createdAt.toISOString(),
          documentName: credential.documentName,
          documentSignedUrl,
          tutor: {
            id: credential.tutorProfile.user.id,
            name: credential.tutorProfile.user.name,
            email: credential.tutorProfile.user.email,
            profile: {
              headline: credential.tutorProfile.headline,
              bio: credential.tutorProfile.bio,
              subjects: credential.tutorProfile.subjects,
              curricula: credential.tutorProfile.curricula,
              university: credential.tutorProfile.university,
              degree: credential.tutorProfile.degree,
            },
          },
        }
      })
    )

    return NextResponse.json({
      pendingCount: rows.length,
      credentials: rows,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load credential queue' },
      { status: 500 }
    )
  }
}
