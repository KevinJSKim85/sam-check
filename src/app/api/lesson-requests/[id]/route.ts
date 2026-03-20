import {
  BookingStatus,
  LedgerEntryStatus,
  LedgerEntryType,
  OrderStatus,
  PaymentStatus,
} from '@prisma/client'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { addHoldDays, createMerchantOrderNo, getDefaultPaymentProvider } from '@/lib/payments'
import { lessonRequestActionSchema } from '@/schemas'

function isFinalStatus(status: BookingStatus) {
  const finalStatuses: BookingStatus[] = [
    BookingStatus.DECLINED,
    BookingStatus.CANCELED,
    BookingStatus.COMPLETED,
  ]

  return finalStatuses.includes(status)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const json = await request.json()
    const parsed = lessonRequestActionSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid lesson request action' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            payment: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Lesson request not found' }, { status: 404 })
    }

    const isStudent = booking.studentId === session.user.id
    const isTutor = booking.tutorUserId === session.user.id

    if (!isStudent && !isTutor && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'You do not have access to this lesson request' }, { status: 403 })
    }

    if (parsed.data.action === 'accept') {
      if (!isTutor) {
        return NextResponse.json({ error: 'Only tutors can accept lesson requests' }, { status: 403 })
      }
      if (booking.status !== BookingStatus.REQUESTED) {
        return NextResponse.json({ error: 'Only requested lessons can be accepted' }, { status: 400 })
      }

      const merchantOrderNo = booking.order?.merchantOrderNo ?? createMerchantOrderNo(booking.id)

      const updated = await prisma.$transaction(async (tx) => {
        const nextBooking = await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: BookingStatus.ACCEPTED,
            acceptedAt: new Date(),
          },
        })

        const order = booking.order
          ? await tx.order.update({
              where: { id: booking.order.id },
              data: { status: OrderStatus.PENDING_PAYMENT },
            })
          : await tx.order.create({
              data: {
                bookingId: booking.id,
                buyerId: booking.studentId,
                sellerTutorId: booking.tutorUserId,
                sellerTutorProfileId: booking.tutorProfileId,
                merchantOrderNo,
                hourlyRateSnapshotKrw: booking.hourlyRateSnapshotKrw,
                durationMinutes: booking.durationMinutes,
                grossAmountKrw: booking.grossAmountKrw,
                platformFeeBps: booking.platformFeeBps,
                platformFeeAmountKrw: booking.platformFeeAmountKrw,
                tutorNetAmountKrw: booking.tutorNetAmountKrw,
              },
            })

        if (!booking.order?.payment) {
          await tx.payment.create({
            data: {
              orderId: order.id,
              provider: getDefaultPaymentProvider(),
              merchantOrderNo,
              requestedAmountKrw: order.grossAmountKrw,
              status: PaymentStatus.CREATED,
            },
          })
        }

        return { nextBooking, order }
      })

      return NextResponse.json({
        ok: true,
        bookingId: updated.nextBooking.id,
        orderId: updated.order.merchantOrderNo,
        status: updated.nextBooking.status,
      })
    }

    if (parsed.data.action === 'decline') {
      if (!isTutor) {
        return NextResponse.json({ error: 'Only tutors can decline lesson requests' }, { status: 403 })
      }
      if (booking.status !== BookingStatus.REQUESTED) {
        return NextResponse.json({ error: 'Only requested lessons can be declined' }, { status: 400 })
      }

      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.DECLINED,
          declinedAt: new Date(),
          cancelReason: parsed.data.reason || null,
        },
      })

      return NextResponse.json({ ok: true, bookingId: updated.id, status: updated.status })
    }

    if (parsed.data.action === 'cancel') {
      if (booking.order?.payment?.status === PaymentStatus.PAID) {
        return NextResponse.json(
          { error: 'Paid lessons must be refunded before cancellation' },
          { status: 400 }
        )
      }
      if (isFinalStatus(booking.status)) {
        return NextResponse.json({ error: 'This lesson request is already closed' }, { status: 400 })
      }

      await prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: BookingStatus.CANCELED,
            cancelReason: parsed.data.reason || null,
          },
        })

        if (booking.order) {
          await tx.order.update({
            where: { id: booking.order.id },
            data: { status: OrderStatus.CANCELED, canceledAt: new Date() },
          })
        }

        if (booking.order?.payment) {
          await tx.payment.update({
            where: { id: booking.order.payment.id },
            data: { status: PaymentStatus.CANCELED, canceledAt: new Date() },
          })
        }
      })

      return NextResponse.json({ ok: true, bookingId: booking.id, status: BookingStatus.CANCELED })
    }

    if (parsed.data.action === 'complete') {
      if (!isStudent && !isTutor && session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Only lesson participants can complete a lesson' }, { status: 403 })
      }
      if (booking.status !== BookingStatus.CONFIRMED) {
        return NextResponse.json({ error: 'Only confirmed lessons can be completed' }, { status: 400 })
      }
      if (!booking.order || booking.order.status !== OrderStatus.PAID || !booking.order.payment) {
        return NextResponse.json({ error: 'Only paid lessons can be completed' }, { status: 400 })
      }

      const completedAt = new Date()

      await prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: BookingStatus.COMPLETED,
            completedAt,
          },
        })

        await tx.order.update({
          where: { id: booking.order!.id },
          data: {
            status: OrderStatus.FULFILLED,
            fulfilledAt: completedAt,
          },
        })

        const existingLedger = await tx.tutorLedgerEntry.findFirst({
          where: {
            orderId: booking.order!.id,
            type: LedgerEntryType.EARNING,
          },
          select: { id: true },
        })

        if (!existingLedger) {
          await tx.tutorLedgerEntry.create({
            data: {
              tutorId: booking.tutorUserId,
              bookingId: booking.id,
              orderId: booking.order!.id,
              paymentId: booking.order!.payment!.id,
              type: LedgerEntryType.EARNING,
              status: LedgerEntryStatus.HELD,
              amountKrw: booking.tutorNetAmountKrw,
              availableAt: addHoldDays(completedAt),
              description: 'Lesson completed and awaiting payout hold release',
            },
          })
        }
      })

      return NextResponse.json({ ok: true, bookingId: booking.id, status: BookingStatus.COMPLETED })
    }

    return NextResponse.json({ error: 'Unsupported lesson request action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update lesson request' },
      { status: 500 }
    )
  }
}
