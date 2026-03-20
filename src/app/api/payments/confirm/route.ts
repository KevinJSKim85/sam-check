import { BookingStatus, OrderStatus, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { getTossSecretKey } from '@/lib/payments'
import { paymentConfirmSchema } from '@/schemas'

function mapTossMethod(method: string | undefined | null) {
  switch (method) {
    case '카드':
      return PaymentMethod.CARD
    case '가상계좌':
      return PaymentMethod.VIRTUAL_ACCOUNT
    case '계좌이체':
      return PaymentMethod.TRANSFER
    case '휴대폰':
      return PaymentMethod.MOBILE
    default:
      return null
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const json = await request.json()
    const parsed = paymentConfirmSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid payment confirmation payload' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.findUnique({
      where: { merchantOrderNo: parsed.data.orderId },
      include: {
        order: {
          include: {
            booking: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.order.buyerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'You do not have access to this payment' }, { status: 403 })
    }

    if (payment.requestedAmountKrw !== parsed.data.amount) {
      return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 })
    }

    if (payment.status === PaymentStatus.PAID) {
      return NextResponse.json({
        ok: true,
        bookingId: payment.order.bookingId,
        tutorUserId: payment.order.sellerTutorId,
        orderId: payment.merchantOrderNo,
      })
    }

    const tossSecretKey = getTossSecretKey()
    if (!tossSecretKey) {
      return NextResponse.json(
        { error: 'Toss Payments is not configured. Set TOSS_SECRET_KEY first.' },
        { status: 500 }
      )
    }

    const authToken = Buffer.from(`${tossSecretKey}:`).toString('base64')
    const providerResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey: parsed.data.paymentKey,
        orderId: parsed.data.orderId,
        amount: parsed.data.amount,
      }),
    })

    const providerPayload = (await providerResponse.json()) as Prisma.InputJsonValue

    if (!providerResponse.ok) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          rawProviderPayload: providerPayload,
        },
      })

      return NextResponse.json(
        { error: String((providerPayload as Record<string, unknown>).message ?? 'Payment confirmation failed') },
        { status: providerResponse.status }
      )
    }

    const providerData = providerPayload as Record<string, unknown>

    const approvedAt = providerData.approvedAt
      ? new Date(String(providerData.approvedAt))
      : new Date()

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          providerPaymentId: parsed.data.paymentKey,
          paidAmountKrw: parsed.data.amount,
          method: mapTossMethod(typeof providerData.method === 'string' ? providerData.method : null),
          status: PaymentStatus.PAID,
          approvedAt,
          rawProviderPayload: providerPayload,
        },
      })

      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          providerEventId: parsed.data.paymentKey,
          type: 'payment.confirmed',
          rawPayload: providerPayload,
        },
      })

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: OrderStatus.PAID,
          paidAt: approvedAt,
        },
      })

      await tx.booking.update({
        where: { id: payment.order.bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          confirmedAt: approvedAt,
        },
      })
    })

    return NextResponse.json({
      ok: true,
      bookingId: payment.order.bookingId,
      tutorUserId: payment.order.sellerTutorId,
      orderId: payment.merchantOrderNo,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
