import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { reviewSchema } from '@/schemas/review'

async function recalculateTutorReviewStats(tutorProfileId: string) {
  const aggregate = await prisma.review.aggregate({
    where: { tutorProfileId },
    _avg: { rating: true },
    _count: { id: true },
  })

  await prisma.tutorProfile.update({
    where: { id: tutorProfileId },
    data: {
      averageRating: aggregate._avg.rating ?? 0,
      totalReviews: aggregate._count.id,
    },
  })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const reviews = await prisma.review.findMany({
      where: {
        tutorProfileId: id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      reviews: reviews.map((review) => ({
        id: review.id,
        authorId: review.authorId,
        authorName: review.author.name,
        authorImage: review.author.image,
        rating: review.rating,
        content: review.content,
        createdAt: review.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Only students can submit reviews' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = reviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid review payload' },
        { status: 400 }
      )
    }

    const tutor = await prisma.tutorProfile.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
      },
    })

    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 })
    }

    if (tutor.userId === session.user.id) {
      return NextResponse.json({ error: 'You cannot review yourself' }, { status: 400 })
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        tutorProfileId_authorId: {
          tutorProfileId: tutor.id,
          authorId: session.user.id,
        },
      },
      select: {
        id: true,
      },
    })

    if (existingReview) {
      return NextResponse.json({ error: 'You already reviewed this tutor' }, { status: 409 })
    }

    const review = await prisma.review.create({
      data: {
        tutorProfileId: tutor.id,
        authorId: session.user.id,
        rating: parsed.data.rating,
        content: parsed.data.content,
      },
      select: {
        id: true,
        tutorProfileId: true,
        authorId: true,
        rating: true,
        content: true,
        createdAt: true,
      },
    })

    await recalculateTutorReviewStats(tutor.id)

    return NextResponse.json(
      {
        review: {
          ...review,
          createdAt: review.createdAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit review' },
      { status: 500 }
    )
  }
}
