import { Prisma, UserRole } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { calculateLessonAmounts } from '@/lib/payments'
import { lessonRequestSchema } from '@/schemas'

function serializeBooking(booking: Awaited<ReturnType<typeof getBookingList>>[number]) {
  return {
    id: booking.id,
    studentId: booking.studentId,
    tutorUserId: booking.tutorUserId,
    tutorProfileId: booking.tutorProfileId,
    subject: booking.subject,
    curriculum: booking.curriculum,
    requestedMessage: booking.requestedMessage,
    startsAt: booking.startsAt.toISOString(),
    endsAt: booking.endsAt.toISOString(),
    durationMinutes: booking.durationMinutes,
    hourlyRateSnapshotKrw: booking.hourlyRateSnapshotKrw,
    grossAmountKrw: booking.grossAmountKrw,
    platformFeeBps: booking.platformFeeBps,
    platformFeeAmountKrw: booking.platformFeeAmountKrw,
    tutorNetAmountKrw: booking.tutorNetAmountKrw,
    status: booking.status,
    acceptedAt: booking.acceptedAt?.toISOString() ?? null,
    declinedAt: booking.declinedAt?.toISOString() ?? null,
    confirmedAt: booking.confirmedAt?.toISOString() ?? null,
    completedAt: booking.completedAt?.toISOString() ?? null,
    createdAt: booking.createdAt.toISOString(),
    student: booking.student,
    tutor: booking.tutor,
    order: booking.order
      ? {
          id: booking.order.id,
          merchantOrderNo: booking.order.merchantOrderNo,
          status: booking.order.status,
          grossAmountKrw: booking.order.grossAmountKrw,
          platformFeeAmountKrw: booking.order.platformFeeAmountKrw,
          tutorNetAmountKrw: booking.order.tutorNetAmountKrw,
          payment: booking.order.payment
            ? {
                id: booking.order.payment.id,
                status: booking.order.payment.status,
                provider: booking.order.payment.provider,
                providerPaymentId: booking.order.payment.providerPaymentId,
              }
            : null,
        }
      : null,
  }
}

async function getBookingList(where: Prisma.BookingWhereInput) {
  return prisma.booking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      student: { select: { id: true, name: true } },
      tutor: { select: { id: true, name: true } },
      order: {
        include: {
          payment: {
            select: {
              id: true,
              status: true,
              provider: true,
              providerPaymentId: true,
            },
          },
        },
      },
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const partnerId = request.nextUrl.searchParams.get('partnerId')

    const where = partnerId
      ? {
          OR: [
            { studentId: session.user.id, tutorUserId: partnerId },
            { studentId: partnerId, tutorUserId: session.user.id },
          ],
        }
      : session.user.role === UserRole.TUTOR
        ? { tutorUserId: session.user.id }
        : { studentId: session.user.id }

    const bookings = await getBookingList(where)

    return NextResponse.json({ bookings: bookings.map(serializeBooking) })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load lesson requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth()

    if (session.user.role !== UserRole.STUDENT) {
      return NextResponse.json({ error: 'Only students can request lessons' }, { status: 403 })
    }

    const json = await request.json()
    const parsed = lessonRequestSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid lesson request' },
        { status: 400 }
      )
    }

    const startsAt = new Date(parsed.data.startsAt)
    if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) {
      return NextResponse.json({ error: 'Lesson start time must be in the future' }, { status: 400 })
    }

    const tutorProfile = await prisma.tutorProfile.findFirst({
      where: {
        id: parsed.data.tutorProfileId,
        isPublished: true,
        hourlyRate: { not: null },
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    })

    if (!tutorProfile?.hourlyRate) {
      return NextResponse.json({ error: 'Tutor is not available for paid lessons' }, { status: 404 })
    }

    if (tutorProfile.userId === session.user.id) {
      return NextResponse.json({ error: 'You cannot request a lesson from yourself' }, { status: 400 })
    }

    const endsAt = new Date(startsAt.getTime() + parsed.data.durationMinutes * 60 * 1000)
    const amounts = calculateLessonAmounts(tutorProfile.hourlyRate, parsed.data.durationMinutes)

    const booking = await prisma.booking.create({
      data: {
        studentId: session.user.id,
        tutorUserId: tutorProfile.userId,
        tutorProfileId: tutorProfile.id,
        subject: parsed.data.subject,
        curriculum: parsed.data.curriculum || null,
        requestedMessage: parsed.data.requestedMessage || null,
        startsAt,
        endsAt,
        durationMinutes: parsed.data.durationMinutes,
        hourlyRateSnapshotKrw: tutorProfile.hourlyRate,
        ...amounts,
      },
      include: {
        student: { select: { id: true, name: true } },
        tutor: { select: { id: true, name: true } },
        order: { include: { payment: true } },
      },
    })

    return NextResponse.json({ booking: serializeBooking(booking) }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create lesson request' },
      { status: 500 }
    )
  }
}
