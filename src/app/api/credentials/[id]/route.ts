import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { deleteCredentialDocument, uploadCredentialDocument } from '@/lib/storage'
import { credentialSubmitSchema } from '@/schemas'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

async function getOwnedCredential(userId: string, id: string) {
  return prisma.credential.findFirst({
    where: {
      id,
      tutorProfile: {
        userId,
      },
    },
  })
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireAuth()
    const { id } = await context.params

    const credential = await getOwnedCredential(session.user.id, id)

    if (!credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    if (credential.status === 'APPROVED') {
      return NextResponse.json({ error: 'Approved credentials cannot be modified' }, { status: 403 })
    }

    if (credential.status !== 'REJECTED') {
      return NextResponse.json({ error: 'Only rejected credentials can be resubmitted' }, { status: 400 })
    }

    const formData = await request.formData()
    const input = {
      type: String(formData.get('type') ?? ''),
      label: String(formData.get('label') ?? ''),
      scoreValue: String(formData.get('scoreValue') ?? ''),
      description: String(formData.get('description') ?? ''),
    }

    const validationResult = credentialSubmitSchema.safeParse(input)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message ?? 'Invalid credential payload' },
        { status: 400 }
      )
    }

    const fileEntry = formData.get('file')
    let documentPath = credential.documentPath
    let documentName = credential.documentName
    let mimeType = credential.mimeType
    let sizeBytes = credential.sizeBytes

    if (fileEntry instanceof File) {
      const uploadResult = await uploadCredentialDocument(
        session.user.id,
        validationResult.data.type,
        fileEntry
      )

      if (uploadResult.error) {
        return NextResponse.json({ error: uploadResult.error }, { status: 400 })
      }

      if (documentPath) {
        await deleteCredentialDocument(documentPath)
      }

      documentPath = uploadResult.path
      documentName = fileEntry.name
      mimeType = fileEntry.type
      sizeBytes = fileEntry.size
    }

    const updated = await prisma.credential.update({
      where: { id },
      data: {
        ...validationResult.data,
        status: 'PENDING',
        rejectionReason: null,
        verificationNote: null,
        documentPath,
        documentName,
        mimeType,
        sizeBytes,
        submissionCount: credential.submissionCount + 1,
      },
    })

    return NextResponse.json({ credential: updated })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to resubmit credential' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requireAuth()
    const { id } = await context.params

    const credential = await getOwnedCredential(session.user.id, id)
    if (!credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    if (credential.status === 'APPROVED') {
      return NextResponse.json({ error: 'Approved credentials cannot be deleted' }, { status: 403 })
    }

    if (credential.documentPath) {
      await deleteCredentialDocument(credential.documentPath)
    }

    await prisma.credential.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete credential' },
      { status: 500 }
    )
  }
}
