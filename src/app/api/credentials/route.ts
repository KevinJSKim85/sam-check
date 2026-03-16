import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { uploadCredentialDocument } from '@/lib/storage'
import { credentialSubmitSchema } from '@/schemas'

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
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

    let tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!tutorProfile) {
      tutorProfile = await prisma.tutorProfile.create({
        data: {
          userId: session.user.id,
          subjects: [],
          curricula: [],
        },
        select: { id: true },
      })
    }

    const fileEntry = formData.get('file')
    let documentPath: string | null = null
    let documentName: string | null = null
    let mimeType: string | null = null
    let sizeBytes: number | null = null

    if (fileEntry instanceof File) {
      const uploadResult = await uploadCredentialDocument(
        session.user.id,
        validationResult.data.type,
        fileEntry
      )

      if (uploadResult.error) {
        return NextResponse.json({ error: uploadResult.error }, { status: 400 })
      }

      documentPath = uploadResult.path
      documentName = fileEntry.name
      mimeType = fileEntry.type
      sizeBytes = fileEntry.size
    }

    const credential = await prisma.credential.create({
      data: {
        tutorProfileId: tutorProfile.id,
        ...validationResult.data,
        status: 'PENDING',
        submissionCount: 1,
        documentPath,
        documentName,
        mimeType,
        sizeBytes,
      },
    })

    return NextResponse.json({ credential }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit credential' },
      { status: 500 }
    )
  }
}
