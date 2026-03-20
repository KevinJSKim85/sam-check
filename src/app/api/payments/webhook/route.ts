import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Prisma.InputJsonValue
    const payloadRecord = payload as Record<string, unknown>
    const paymentKey = typeof payloadRecord.paymentKey === 'string' ? payloadRecord.paymentKey : null
    const eventType = typeof payloadRecord.eventType === 'string' ? payloadRecord.eventType : 'payment.webhook'

    if (paymentKey) {
      const payment = await prisma.payment.findFirst({
        where: {
          OR: [
            { providerPaymentId: paymentKey },
            { merchantOrderNo: paymentKey },
          ],
        },
        select: { id: true },
      })

      if (payment) {
        await prisma.paymentEvent.create({
          data: {
            paymentId: payment.id,
            providerEventId: `${eventType}:${paymentKey}:${Date.now()}`,
            type: eventType,
            rawPayload: payload,
          },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process payment webhook' },
      { status: 500 }
    )
  }
}
