import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const review = await prisma.review.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
        tutorProfileId: true,
      },
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    if (review.authorId !== session.user.id) {
      return NextResponse.json({ error: 'You can only delete your own review' }, { status: 403 })
    }

    await prisma.review.delete({
      where: { id: review.id },
    })

    await recalculateTutorReviewStats(review.tutorProfileId)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete review' },
      { status: 500 }
    )
  }
}
