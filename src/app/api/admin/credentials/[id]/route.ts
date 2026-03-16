import { VerificationStatus } from '@prisma/client'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { credentialReviewSchema } from '@/schemas'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireAdmin()
    const { id } = await context.params
    const body = (await request.json()) as unknown

    const validation = credentialReviewSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message ?? 'Invalid payload' },
        { status: 400 }
      )
    }

    if (
      validation.data.status === VerificationStatus.APPROVED &&
      (!validation.data.verificationNote || validation.data.verificationNote.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: 'Verification note is required when approving' },
        { status: 400 }
      )
    }

    const existing = await prisma.credential.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    if (existing.status === VerificationStatus.APPROVED) {
      return NextResponse.json({ error: 'Credential already approved' }, { status: 400 })
    }

    if (
      existing.status !== VerificationStatus.PENDING &&
      existing.status !== VerificationStatus.UNDER_REVIEW
    ) {
      return NextResponse.json({ error: 'Credential is not in review queue' }, { status: 400 })
    }

    const updated = await prisma.credential.update({
      where: { id },
      data: {
        status: validation.data.status,
        verificationNote:
          validation.data.status === VerificationStatus.APPROVED
            ? validation.data.verificationNote?.trim() ?? null
            : null,
        rejectionReason:
          validation.data.status === VerificationStatus.REJECTED
            ? validation.data.rejectionReason?.trim() ?? null
            : null,
        verifiedBy: session.user.id,
        verifiedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        verificationNote: true,
        rejectionReason: true,
        verifiedBy: true,
        verifiedAt: true,
      },
    })

    return NextResponse.json({ credential: updated })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update credential' },
      { status: 500 }
    )
  }
}
