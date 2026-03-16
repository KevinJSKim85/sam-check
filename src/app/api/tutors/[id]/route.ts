import { VerificationStatus } from '@prisma/client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const tutor = await prisma.tutorProfile.findFirst({
    where: {
      id,
      isPublished: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      credentials: {
        where: {
          status: VerificationStatus.APPROVED,
        },
        select: {
          id: true,
          type: true,
          label: true,
          scoreValue: true,
          status: true,
          verificationNote: true,
          rejectionReason: true,
          submissionCount: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      reviews: {
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!tutor) {
    return NextResponse.json({ error: 'Tutor not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: tutor.id,
    userId: tutor.userId,
    name: tutor.user.name,
    image: tutor.user.image,
    university: tutor.university,
    degree: tutor.degree,
    headline: tutor.headline,
    bio: tutor.bio,
    subjects: tutor.subjects,
    curricula: tutor.curricula,
    hourlyRate: tutor.hourlyRate,
    teachingMode: tutor.teachingMode,
    averageRating: tutor.averageRating,
    totalReviews: tutor.totalReviews,
    verifiedCredentials: tutor.credentials.map((credential) => ({
      ...credential,
      createdAt: credential.createdAt.toISOString(),
    })),
    allCredentials: tutor.credentials.map((credential) => ({
      ...credential,
      createdAt: credential.createdAt.toISOString(),
    })),
    reviews: tutor.reviews.map((review) => ({
      id: review.id,
      authorId: review.authorId,
      authorName: review.author.name,
      authorImage: review.author.image,
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt.toISOString(),
    })),
  })
}
